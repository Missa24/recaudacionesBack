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

  /**
   * Registra manualmente un nuevo valor de Dependencia.
   * Verifica que no exista otro registro para el mismo código
   * y asocia al usuario responsable de la creación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
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
      usuario_creador: { idUsuario },
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

  /**
   * Obtiene los registros de Dependencia aplicando filtros, búsqueda,
   * ordenamiento y paginación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
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
      createdAt: '_created_at',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy] ?? '_created_at';

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
      filtros._created_at = And(
        MoreThanOrEqual(new Date(`${startDate}T00:00:00.000`)),
        LessThanOrEqual(new Date(`${endDate}T23:59:59.999`)),
      );
    } else if (startDate) {
      filtros._created_at = MoreThanOrEqual(
        new Date(`${startDate}T00:00:00.000`),
      );
    } else if (endDate) {
      filtros._created_at = LessThanOrEqual(
        new Date(`${endDate}T23:59:59.999`),
      );
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

  /**
   * Busca un registro de Dependencia mediante su identificador único.
   * Incluye los nombres de usuario asociados a su creación y actualización.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
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

  /**
   * Busca un registro de Dependencia por un código específico.
   * Solo considera registros activos y que no hayan sido eliminados.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorCodigo(codigo: string): Promise<DependenciaResponse> {
    const dependencia = await this.dependenciaRepository.findOne({
      where: {
        codigo,
        estado: 'ACTIVO',
        _deleted_at: IsNull(),
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
  /**
   * Actualiza parcialmente un registro de Dependencia existente.
   * Verifica su existencia, estado y posibles duplicados de código.
   * También actualiza los campos de auditoría correspondientes.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
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
    dependencia._updated_at = new Date();
    dependencia._user_update = idUsuario;
    dependencia.usuario_actualizador = { idUsuario } as Usuario;

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

  /**
   * Cambia el estado de un registro de una Dependencia
   * entre ACTIVO e INACTIVO.
   * Al desactivar, registra los datos de eliminación lógica.
   * Al reactivar, limpia dichos datos y registra la actualización.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
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
      dependencia._deleted_at = new Date();
      dependencia._user_update = null;
      dependencia._updated_at = null;
    } else {
      dependencia._user_update = idUsuario;
      dependencia._updated_at = new Date();
      dependencia._user_delete = null;
      dependencia._deleted_at = null;
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

  async validarDependencia(id_dependencia: string): Promise<void> {
    const dependencia = await this.dependenciaRepository.findOne({
      where: { id: id_dependencia },
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
