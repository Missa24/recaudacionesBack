/**
 * Módulo: Catálogo - Requisito
 * Archivo: requisito.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de los valores de Requisito.
 * Gestiona registros manuales, consultas, actualizaciones y cambios de estado,
 * incluyendo el control de auditoría.
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
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { Requisito } from './entities/requisito.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { CreateRequisitoDto } from './dto/create-requisito.dto';
import { UpdateRequisitoDto } from './dto/update-requisito.dto';
import { QueryRequisitoDto } from './dto/query-requisito.dto';
import {
  RequisitoCreateResponse,
  RequisitoMessageResponse,
  RequisitoResponse,
} from './interface/requisito-response.interface';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { mapearRespuesta } from './util/map-response-requisito.util';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

/**
 * Servicio: RequisitoService
 * Descripción:
 * Implementa las operaciones de negocio para administrar los registros de
 * Requisito, utilizando TypeORM para interactuar con la base de datos.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class RequisitoService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  private readonly logger = new Logger(RequisitoService.name);

  constructor(
    @InjectRepository(Requisito)
    private readonly requisitoRepository: Repository<Requisito>,
  ) {}

  /*
    Nombre del método: crear
    Descripción: Registra manualmente un nuevo Requisito. Verifica duplicidad
                 por código y asocia al usuario creador.
    Parámetros:
      - dto: CreateRequisitoDto (codigo, descripcion)
      - idUsuario: string (usuario que crea)
    Respuestas posibles:
      - 201: Requisito registrado correctamente (con id).
      - 409: Ya existe un Requisito con ese código.
      - 500: No se pudo guardar el registro.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
  */
  async crear(
    dto: CreateRequisitoDto,
    idUsuario: string,
  ): Promise<RequisitoCreateResponse> {
    // Comprueba si ya existe un registro con el código proporcionado.
    const existe = await this.requisitoRepository.findOne({
      where: { codigo: dto.codigo },
    });

    if (existe) {
      throw new ConflictException('Ya existe un Requisito con ese código');
    }

    // Prepara la entidad asociando los datos del usuario creador.
    const requisito = this.requisitoRepository.create({
      codigo: dto.codigo,
      descripcion: dto.descripcion,
      estado: 'ACTIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
      _user_created: idUsuario,
      usuario_creador: { id: idUsuario } as Usuario,
    });

    try {
      await this.requisitoRepository.save(requisito);

      return {
        message: 'Requisito registrado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException('Ya existe un Requisito con ese código');
      }

      this.logger.error(
        `Error al crear un Requisito. Código: ${dto.codigo}, Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('No se pudo guardar el registro');
    }
  }

  /*
    Nombre del método: listar
    Descripción: Obtiene los registros de Requisito aplicando filtros,
                 búsqueda, ordenamiento y paginación.
    Parámetros:
      - query: QueryRequisitoDto (page, limit, search, status, startDate,
               endDate, sortBy, sortOrder)
    Respuestas posibles:
      - 200: Listado paginado de requisitos.
      - 400: Rango de fechas inválido (startDate > endDate).
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
  */
  async listar(
    query: QueryRequisitoDto,
  ): Promise<PaginatedResponse<RequisitoResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
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
    const camposOrdenamiento: Record<string, keyof Requisito> = {
      codigo: 'codigo',
      descripcion: 'descripcion',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy] ?? 'createdAt';

    // Construir filtros comunes
    const filtros: FindOptionsWhere<Requisito> = {};

    // Filtro por estado
    if (status && status !== 'TODOS') {
      filtros.estado = status;
    } else if (!status) {
      filtros.estado = 'ACTIVO';
    }

    // Filtro por rango de fechas (Bolivia UTC-4)
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
    const condiciones: FindOptionsWhere<Requisito>[] = [];

    if (search?.trim()) {
      const busqueda = ILike(`%${search.trim()}%`);

      condiciones.push(
        { ...filtros, codigo: busqueda },
        { ...filtros, descripcion: busqueda },
      );
    } else {
      condiciones.push(filtros);
    }

    try {
      const [requisitos, total] = await this.requisitoRepository.findAndCount({
        where: condiciones,
        relations: {
          usuario_creador: true,
          usuario_actualizador: true,
          usuario_eliminador: true,
        },
        order: {
          [campoOrdenamiento]: sortOrder ?? 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        items: requisitos.map((requisito) => mapearRespuesta(requisito)),
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
        `Error al listar Requisitos. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /*
    Nombre del método: buscarPorId
    Descripción: Busca un registro de Requisito por su identificador único e
                 incluye los usuarios de creación, actualización y baja lógica.
    Parámetros:
      - id: string (identificador del requisito)
    Respuestas posibles:
      - 200: Registro encontrado.
      - 404: No existe un Requisito con ese Id.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
  */
  async buscarPorId(id: string): Promise<RequisitoResponse> {
    const requisito = await this.requisitoRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
        usuario_eliminador: true,
      },
    });

    if (!requisito) {
      throw new NotFoundException('No existe un Requisito con ese Id');
    }

    return mapearRespuesta(requisito);
  }

  /*
    Nombre del método: buscarPorCodigo
    Descripción: Busca un registro de Requisito por un código específico, solo
                 si está ACTIVO y no eliminado lógicamente.
    Parámetros:
      - codigo: string (código del requisito a buscar)
    Respuestas posibles:
      - 200: Registro encontrado.
      - 404: No existe un Requisito activo para ese código.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
    Notas adicionales: Se usa para la ruta `requisito/codigo/:codigo` y debe
                       declararse antes de `:id` para que la ruta literal no
                       sea capturada por el parámetro genérico.
  */
  async buscarPorCodigo(codigo: string): Promise<RequisitoResponse> {
    const requisito = await this.requisitoRepository.findOne({
      where: {
        codigo,
        estado: 'ACTIVO',
        deletedAt: IsNull(),
      },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
        usuario_eliminador: true,
      },
    });

    if (!requisito) {
      throw new NotFoundException(
        'No existe un Requisito activo para ese código',
      );
    }

    return mapearRespuesta(requisito);
  }

  /*
    Nombre del método: actualizar
    Descripción: Actualiza parcialmente un registro de Requisito existente.
                 Verifica existencia, estado ACTIVO y posibles duplicados de
                 código, actualizando los campos de auditoría.
    Parámetros:
      - id: string (identificador del requisito)
      - dto: UpdateRequisitoDto (codigo?, descripcion?)
      - idUsuario: string (usuario que actualiza)
    Respuestas posibles:
      - 200: Requisito actualizado correctamente.
      - 400: No se puede actualizar un requisito inactivo.
      - 404: No se encontró el Requisito solicitado.
      - 409: Ya existe otro Requisito registrado con ese código.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
  */
  async actualizar(
    id: string,
    dto: UpdateRequisitoDto,
    idUsuario: string,
  ): Promise<RequisitoMessageResponse> {
    const requisito = await this.requisitoRepository.findOne({
      where: { id },
    });

    if (!requisito) {
      throw new NotFoundException('No se encontró el Requisito solicitado.');
    }

    if (requisito.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar un requisito inactivo.',
      );
    }

    // Verifica que el nuevo código no esté asignado a otro registro.
    if (dto.codigo !== undefined && dto.codigo !== requisito.codigo) {
      const codigoDuplicado = await this.requisitoRepository.findOne({
        where: { codigo: dto.codigo, id: Not(id) },
      });

      if (codigoDuplicado) {
        throw new ConflictException(
          'Ya existe otro Requisito registrado con ese código',
        );
      }
    }

    if (dto.codigo !== undefined) requisito.codigo = dto.codigo;
    if (dto.descripcion !== undefined) {
      requisito.descripcion = dto.descripcion;
    }

    requisito.updatedAt = new Date();
    requisito._user_update = idUsuario;
    requisito.usuario_actualizador = { id: idUsuario } as Usuario;

    try {
      await this.requisitoRepository.save(requisito);

      return {
        message: 'Requisito actualizado correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException('Ya existe un Requisito con ese código');
      }

      this.logger.error(
        `Error al actualizar Requisito. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /*
    Nombre del método: cambiarEstado
    Descripción: Cambia el estado de un Requisito entre ACTIVO e INACTIVO.
                 Al desactivar registra eliminación lógica; al reactivar limpia
                 esos datos y registra la actualización.
    Parámetros:
      - id: string (identificador del requisito)
      - idUsuario: string (usuario que realiza el cambio)
    Respuestas posibles:
      - 200: Registro del Requisito activado/inactivado correctamente.
      - 404: No existe un Requisito con esa identificación.
      - 500: No se pudo cambiar el estado del registro.
    Fecha de creación: 2026-11-10
    Autor: Missael Apaza
  */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<RequisitoMessageResponse> {
    const requisito = await this.requisitoRepository.findOne({
      where: { id },
    });

    if (!requisito) {
      throw new NotFoundException(
        'No existe un Requisito con esa identificación',
      );
    }

    const estadoAnterior = requisito.estado;
    const nuevoEstado = requisito.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    requisito.estado = nuevoEstado;

    if (nuevoEstado === 'INACTIVO') {
      // Registra quién y cuándo realizó la desactivación.
      requisito._user_delete = idUsuario;
      requisito.deletedAt = new Date();
      requisito.usuario_eliminador = { id: idUsuario } as Usuario;
      requisito._user_update = null;
      requisito.updatedAt = null;
      requisito.usuario_actualizador = null;
    } else {
      // Al reactivar, limpia los datos de eliminación lógica.
      requisito._user_update = idUsuario;
      requisito.updatedAt = new Date();
      requisito.usuario_actualizador = { id: idUsuario } as Usuario;
      requisito._user_delete = null;
      requisito.deletedAt = null;
      requisito.usuario_eliminador = null;
    }

    try {
      await this.requisitoRepository.save(requisito);

      return {
        message: `Registro del Requisito ${requisito.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar el estado del Requisito. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del registro',
      );
    }
  }

  // Funcion para validar que existe un Requisito - Catalogo
  // Desarrollado por: Missael Apaza
  // Fecha: 11/11/2026
  async validarRequisitoActivo(id: string): Promise<void> {
    const requisito = await this.requisitoRepository.findOne({
      where: { id },
    });

    if (!requisito) {
      throw new NotFoundException(
        'No se encontró el requisito del catálogo solicitado.',
      );
    }

    if (requisito.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'El requisito del catálogo seleccionado se encuentra inactivo.',
      );
    }
  }
}
