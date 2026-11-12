/**
 * Módulo: Catálogo - Dependencia
 * Archivo: dependencia.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de los valores de Dependencia.
 * Gestiona registros manuales, sincronización externa, consultas,
 * actualizaciones y cambios de estado, incluyendo el control de auditoría.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import {
  DependenciaMessageResponse,
  DependenciaResponse,
} from './interface/dependencia-response.interface';
import {
  And,
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { mapearRespuesta } from './util/map-response-dependencia.util';
import { QueryDependenciaDto } from './dto/query-dependencia.dto';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

/**
 * Servicio: DependenciaService
 * Descripción:
 * Implementa las operaciones de negocio para administrar los registros de Dependencia,
 * utilizando TypeORM para interactuar con la base de datos.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class DependenciaService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  private readonly logger = new Logger(DependenciaService.name);

  constructor(
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>,
  ) {}

  /*
  Nombre del método: crear
  Descripción: Registra manualmente un nuevo valor de Dependencia. Verifica
               duplicidad por código y asocia al usuario creador.
  Parámetros:
    - dto: CreateDependenciaDto (datos de la dependencia, incluye código)
    - idUsuario: string (usuario que crea)
  Respuestas posibles:
    - 201: Dependencia registrada correctamente.
    - 409: Ya existe una Dependencia con ese código.
    - 500: No se pudo guardar el registro.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async crear(
    dto: CreateDependenciaDto,
    idUsuario: string,
  ): Promise<DependenciaMessageResponse> {
    // Comprueba si ya existe un registro con el código proporcionado.
    const existe = await this.dependenciaRepository.findOne({
      where: {
        codigo: dto.codigo,
      },
    });

    if (existe) {
      throw new ConflictException('Ya existe una Dependencia con ese código');
    }

    // Prepara la entidad asociando los datos del usuario creador.
    const dependencia = this.dependenciaRepository.create({
      ...dto,
      usuario_creador: { id: idUsuario },
    });

    try {
      await this.dependenciaRepository.save(dependencia);
      return {
        message: 'Dependencia registrada correctamente',
      };
    } catch (error: unknown) {
      // Controla posibles duplicados producidos durante el guardado.
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe una Dependencia para ese código',
        );
      }

      this.logger.error(
        `Error al crear una dependencia. Código: ${dto.codigo}, Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('No se pudo guardar el registro');
    }
  }

  /*
  Nombre del método: listar
  Descripción: Obtiene los registros de Dependencia aplicando filtros, búsqueda,
               ordenamiento y paginación.
  Parámetros:
    - query: QueryDependenciaDto (page, limit, search, codigo, abreviacion,
             es_unidad_desconcentrada, status, startDate, endDate, sortBy,
             sortOrder)
  Respuestas posibles:
    - 200: Listado paginado de dependencias.
    - 400: Rango de fechas inválido (startDate > endDate).
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async listar(
    query: QueryDependenciaDto,
  ): Promise<PaginatedResponse<DependenciaResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
      codigo,
      abreviacion,
      es_unidad_desconcentrada,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query;

    // Validar rango de fechas
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser mayor que la fecha final.',
      );
    }

    // Campos permitidos para ordenar
    const camposOrdenamiento: Record<string, keyof Dependencia> = {
      createdAt: 'createdAt',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy] ?? 'createdAt';

    // Construir filtros comunes
    const filtros: FindOptionsWhere<Dependencia> = {};

    // Filtro por código
    if (codigo) {
      filtros.codigo = codigo;
    }

    // Filtro por abreviación
    if (abreviacion) {
      filtros.abreviacion = abreviacion;
    }

    // Filtro por unidad desconcentrada
    if (es_unidad_desconcentrada !== undefined) {
      filtros.es_unidad_desconcentrada = es_unidad_desconcentrada;
    }

    // Filtro por estado
    if (status && status !== 'TODOS') {
      filtros.estado = status;
    } else if (!status) {
      filtros.estado = 'ACTIVO';
    }

    // Filtro por rango de fechas (Bolivia)
    if (startDate && endDate) {
      filtros.createdAt = And(
        MoreThanOrEqual(new Date(`${startDate}T00:00:00.000`)),
        LessThanOrEqual(new Date(`${endDate}T23:59:59.999`)),
      );
    } else if (startDate) {
      filtros.createdAt = MoreThanOrEqual(
        new Date(`${startDate}T00:00:00.000`),
      );
    } else if (endDate) {
      filtros.createdAt = LessThanOrEqual(new Date(`${endDate}T23:59:59.999`));
    }

    // Construir condiciones OR para búsqueda general
    const condiciones: FindOptionsWhere<Dependencia>[] = [];

    if (search?.trim()) {
      const busqueda = ILike(`%${search.trim()}%`);

      condiciones.push(
        { ...filtros, codigo: busqueda },
        { ...filtros, nombre: busqueda },
      );
    } else {
      condiciones.push(filtros);
    }

    try {
      const [dependencias, total] =
        await this.dependenciaRepository.findAndCount({
          where: condiciones,
          relations: {
            usuario_creador: true,
            usuario_actualizador: true,
          },
          order: {
            [campoOrdenamiento]: sortOrder ?? 'DESC',
          },
          skip: (page - 1) * limit,
          take: limit,
        });

      const totalPages = Math.ceil(total / limit);

      return {
        items: dependencias.map((dependencia) => mapearRespuesta(dependencia)),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error al listar Dependencias. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /*
  Nombre del método: buscarPorId
  Descripción: Busca un registro de Dependencia por su identificador único e
               incluye los usuarios de creación y actualización.
  Parámetros:
    - id: string (identificador de la dependencia)
  Respuestas posibles:
    - 200: Registro encontrado.
    - 404: No existe una Dependencia con ese Id.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async buscarPorId(id: string): Promise<DependenciaResponse> {
    const dependencia = await this.dependenciaRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!dependencia) {
      throw new NotFoundException('No existe una Dependencia con ese Id');
    }

    return mapearRespuesta(dependencia);
  }

  /*
  Nombre del método: buscarPorCodigo
  Descripción: Busca un registro de Dependencia por un código específico, solo
               si está ACTIVO y no eliminado lógicamente.
  Parámetros:
    - codigo: string (código de la dependencia a buscar)
  Respuestas posibles:
    - 200: Registro encontrado.
    - 404: No existe una Dependencia activa para ese código.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Se usa para la ruta `dependencia/codigo/:codigo` y debe
                     declararse antes de `:id` para que la ruta literal no sea
                     capturada por el parámetro genérico.
*/
  async buscarPorCodigo(codigo: string): Promise<DependenciaResponse> {
    const dependencia = await this.dependenciaRepository.findOne({
      where: {
        codigo,
        estado: 'ACTIVO',
        deletedAt: IsNull(),
      },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!dependencia) {
      throw new NotFoundException(
        'No existe una Dependencia activa para ese codigo',
      );
    }

    return mapearRespuesta(dependencia);
  }

  /*
  Nombre del método: actualizar
  Descripción: Actualiza parcialmente un registro de Dependencia existente.
               Verifica existencia, estado ACTIVO y posibles duplicados de
               código, actualizando los campos de auditoría.
  Parámetros:
    - id: string (identificador de la dependencia)
    - dto: UpdateDependenciaDto (campos a actualizar)
    - idUsuario: string (usuario que actualiza)
  Respuestas posibles:
    - 200: Dependencia actualizada correctamente.
    - 400: No se puede actualizar una dependencia inactiva.
    - 404: No se encontró la dependencia solicitada.
    - 409: Ya existe una dependencia con ese código.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async actualizar(
    id: string,
    dto: UpdateDependenciaDto,
    idUsuario: string,
  ): Promise<DependenciaMessageResponse> {
    const dependencia = await this.dependenciaRepository.findOne({
      where: { id: id },
    });

    if (!dependencia) {
      throw new NotFoundException('No se encontro la dependencia solicitada.');
    }

    if (dependencia.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar una dependencia inactiva.',
      );
    }

    Object.assign(dependencia, dto);
    dependencia.updatedAt = new Date();
    dependencia._user_update = idUsuario;
    dependencia.usuario_actualizador = { id: idUsuario } as Usuario;

    try {
      await this.dependenciaRepository.save(dependencia);

      return {
        message: 'Dependencia actualizada correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException('Ya existe una dependencia con ese código');
      }

      this.logger.error(
        `Error al actualizar Dependencia. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /*
  Nombre del método: cambiarEstado
  Descripción: Cambia el estado de una Dependencia entre ACTIVO e INACTIVO.
               Al desactivar registra eliminación lógica; al reactivar limpia
               esos datos y registra la actualización.
  Parámetros:
    - id: string (identificador de la dependencia)
    - idUsuario: string (usuario que realiza el cambio)
  Respuestas posibles:
    - 200: Registro de la dependencia activado/inactivado correctamente.
    - 404: No existe una Dependencia con esa identificación.
    - 500: No se pudo cambiar el estado del registro.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<DependenciaMessageResponse> {
    this.logger.log(
      `Iniciando cambio de estado de Dependencia. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const dependencia = await this.dependenciaRepository.findOne({
      where: { id: id },
    });

    if (!dependencia) {
      this.logger.warn(
        `No se encontró Dependencia para cambiar estado. ID: ${id}`,
      );
      throw new NotFoundException(
        'No existe una Dependencia con esa identificación',
      );
    }

    const estadoAnterior = dependencia.estado;
    // Determina el estado contrario al estado actual.
    const nuevoEstado = dependencia.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    dependencia.estado = nuevoEstado;

    if (nuevoEstado === 'INACTIVO') {
      dependencia._user_delete = idUsuario;
      dependencia.deletedAt = new Date();
      dependencia._user_update = null;
      dependencia.updatedAt = null;
    } else {
      dependencia._user_update = idUsuario;
      dependencia.updatedAt = new Date();
      dependencia._user_delete = null;
      dependencia.deletedAt = null;
    }

    try {
      await this.dependenciaRepository.save(dependencia);

      this.logger.log(
        `Estado de Dependencia cambiado correctamente. ID: ${id}, Estado anterior: ${estadoAnterior}, Estado nuevo: ${nuevoEstado}, Usuario: ${idUsuario}`,
      );

      return {
        message: `Registro de la dependencia ${dependencia.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar el estado de la Dependencia. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del registro',
      );
    }
  }
  /*
  Nombre del método: validarDependencia
  Descripción: Valida que una Dependencia exista y se encuentre ACTIVA. No
               retorna datos; lanza excepción si no cumple las condiciones.
  Parámetros:
    - dependencia_id: string (identificador de la dependencia a validar)
  Respuestas posibles:
    - 200: Dependencia válida (sin retorno).
    - 400: La dependencia seleccionada se encuentra inactiva.
    - 404: No se encontró la dependencia solicitada.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async validarDependencia(dependencia_id: string): Promise<void> {
    const dependencia = await this.dependenciaRepository.findOne({
      where: { id: dependencia_id },
    });

    if (!dependencia) {
      throw new NotFoundException('No se encontró la dependencia solicitada.');
    }

    if (dependencia.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'La dependencia seleccionada se encuentra inactiva.',
      );
    }
  }
}
