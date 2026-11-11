/**
 * Módulo: Catálogos - Calendario
 * Archivo: calendario.service.ts
 * Descripción:
 * Contiene la lógica de negocio para el registro, consulta,
 * actualización y administración de fechas del calendario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { Calendario } from './entities/calendario.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

import { CreateCalendarioDto } from './dto/create-calendario.dto';
import { CreateCalendarioRangoDto } from './dto/create-calendario-lote.dto';
import { UpdateCalendarioDto } from './dto/update-calendario.dto';
import { QueryCalendarioDto } from './dto/query-calendario.dto';

import {
  CalendarioCreateResponse,
  CalendarioFechaResponse,
  CalendarioLoteResponse,
  CalendarioMessageResponse,
  CalendarioResponse,
} from './interface/calendario-response.interface';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';

import { validarFecha } from './util/calendario-validar-fecha.util';
import { calcularDiaHabil } from './util/calendario-dia-habil.util';
import { mapearCalendario } from './util/calendario.mapper';
import { generarFechasDelRango } from './util/calendario-generar-fechas.util';

/**
 * Servicio encargado de gestionar las operaciones
 * del catálogo de calendario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class CalendarioService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  private readonly logger = new Logger(CalendarioService.name);

  /**
   * Inyecta el repositorio de calendario y el origen de datos
   * para realizar las operaciones sobre la entidad.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  constructor(
    @InjectRepository(Calendario)
    private readonly calendarioRepository: Repository<Calendario>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Registra una nueva fecha en el calendario,
   * verificando que no se encuentre registrada previamente.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async crear(
    dto: CreateCalendarioDto,
    idUsuario: string,
  ): Promise<CalendarioCreateResponse> {
    validarFecha(dto.fecha);

    const existente = await this.calendarioRepository.findOne({
      where: { fecha: dto.fecha },
    });

    if (existente) {
      throw new ConflictException(
        'La fecha ya se encuentra registrada en el calendario.',
      );
    }

    const calendario = this.calendarioRepository.create({
      fecha: dto.fecha,
      dia_habil: dto.habil ?? calcularDiaHabil(dto.fecha),
      descripcion: dto.descripcion ?? null,
      estado: 'ACTIVO',
      _created_at: new Date(),
      _updated_at: new Date(),
      _user_created: idUsuario,
      usuario_creador: { idUsuario } as Usuario,
    });

    try {
      const guardado = await this.calendarioRepository.save(calendario);

      return {
        message: 'La fecha fue registrada correctamente.',
        id: guardado.id,
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'La fecha ya se encuentra registrada en el calendario.',
        );
      }

      this.logger.error(
        `Error al crear fecha de calendario. Fecha: ${dto.fecha}, Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Registra un rango continuo de fechas en el calendario.
   * Genera todas las fechas entre fecha_inicio y fecha_fin (inclusive),
   * calcula "habil" automáticamente si no se envía y evita duplicados.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async crearPorRango(
    dto: CreateCalendarioRangoDto,
    idUsuario: string,
  ): Promise<CalendarioLoteResponse> {
    // 1. Validaciones
    validarFecha(dto.fecha_inicio);
    validarFecha(dto.fecha_fin);

    if (dto.fecha_inicio > dto.fecha_fin) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const fechas = generarFechasDelRango(dto.fecha_inicio, dto.fecha_fin);

    if (fechas.length > 366) {
      throw new BadRequestException('El rango no puede exceder 366 días.');
    }

    try {
      const resultado = await this.dataSource.transaction(
        async (manager): Promise<CalendarioLoteResponse> => {
          const repository = manager.getRepository(Calendario);

          // 2. Consultar fechas existentes
          const existentes = await repository.find({
            where: { fecha: In(fechas) },
            select: { fecha: true },
          });
          const setExistentes = new Set(existentes.map(({ fecha }) => fecha));

          // 3. Separar fechas nuevas y omitidas
          const fechasNuevas = fechas.filter(
            (fecha) => !setExistentes.has(fecha),
          );

          const fechasOmitidas = fechas.filter((fecha) =>
            setExistentes.has(fecha),
          );

          // 4. Insertar únicamente fechas nuevas
          if (fechasNuevas.length > 0) {
            const fechaActual = new Date();

            const registros = fechasNuevas.map((fecha) =>
              repository.create({
                fecha,
                dia_habil: dto.habil ?? calcularDiaHabil(fecha),
                descripcion: dto.descripcion ?? null,
                estado: 'ACTIVO',
                _created_at: fechaActual,
                _updated_at: fechaActual,
                _user_created: idUsuario,
                usuario_creador: { idUsuario } as Usuario,
              }),
            );

            await repository
              .createQueryBuilder()
              .insert()
              .into(Calendario)
              .values(registros)
              .orIgnore()
              .execute();
          }

          // 5. Construir respuesta
          const totalInsertados = fechasNuevas.length;

          return {
            message:
              fechasOmitidas.length > 0
                ? `Se registraron ${totalInsertados} fechas. Se omitieron ${fechasOmitidas.length} por ya existir.`
                : `Se registraron correctamente ${totalInsertados} fechas.`,
            total: totalInsertados,
            fechas_omitidas: fechasOmitidas,
          };
        },
      );

      return resultado;
    } catch (error) {
      this.logger.error(
        `Error al crear rango. Desde: ${dto.fecha_inicio}, Hasta: ${dto.fecha_fin}, Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Obtiene el listado paginado de fechas del calendario
   * aplicando búsqueda, filtros y ordenamiento.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */

  async listar(
    query: QueryCalendarioDto,
  ): Promise<PaginatedResponse<CalendarioResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      habil,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query;

    // Validar fechas
    if (startDate) {
      validarFecha(startDate);
    }

    if (endDate) {
      validarFecha(endDate);
    }

    // Validar rango de fechas
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    // Campos permitidos para ordenar
    const camposOrdenamiento: Record<string, keyof Calendario> = {
      fecha: 'fecha',
      dia_habil: 'dia_habil',
      descripcion: 'descripcion',
      createdAt: '_created_at',
      updatedAt: '_updated_at',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy ?? 'fecha'] ?? 'fecha';

    // Construir filtros comunes
    const filtros: FindOptionsWhere<Calendario> = {};

    // Filtro por estado
    if (status && status !== 'TODOS') {
      filtros.estado = status;
    } else if (!status) {
      filtros.estado = 'ACTIVO';
    }

    // Filtro por día hábil
    if (habil !== undefined) {
      filtros.dia_habil = habil;
    }

    // Filtro por rango de fechas
    if (startDate && endDate) {
      filtros.fecha = Between(startDate, endDate);
    } else if (startDate) {
      filtros.fecha = MoreThanOrEqual(startDate);
    } else if (endDate) {
      filtros.fecha = LessThanOrEqual(endDate);
    }

    // Construir condiciones OR para búsqueda
    const condiciones: FindOptionsWhere<Calendario>[] = [];

    if (search?.trim()) {
      const busqueda = ILike(`%${search.trim()}%`);

      condiciones.push(
        { ...filtros, descripcion: busqueda },
        { ...filtros, fecha: ILike(`%${search.trim()}%`) },
      );
    } else {
      condiciones.push(filtros);
    }

    try {
      const [registros, total] = await this.calendarioRepository.findAndCount({
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
        items: registros.map((registro) => mapearCalendario(registro)),
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
        `Error al listar calendario. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }
  /**
   * Busca una fecha específica y determina su condición
   * de día hábil según la configuración o el día de la semana.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorFecha(fecha: string): Promise<CalendarioFechaResponse> {
    validarFecha(fecha);

    const calendario = await this.calendarioRepository.findOne({
      where: {
        fecha,
        estado: 'ACTIVO',
      },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (calendario) {
      return {
        fecha: calendario.fecha,
        dia_habil: calendario.dia_habil,
        configurada: true,
        origen: 'CONFIGURACION',
        registro: mapearCalendario(calendario),
      };
    }

    const habilCalculado = calcularDiaHabil(fecha);

    return {
      fecha,
      dia_habil: habilCalculado,
      configurada: false,
      origen: 'DIA_SEMANA',
      registro: null,
    };
  }

  /**
   * Busca un registro del calendario mediante su identificador UUID.
   * Si no existe, genera una excepción de recurso no encontrado.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorId(id: string): Promise<CalendarioResponse> {
    const calendario = await this.calendarioRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!calendario) {
      throw new NotFoundException(
        'No se encontró el registro del calendario solicitado.',
      );
    }

    return mapearCalendario(calendario);
  }

  /**
   * Actualiza la información de un registro del calendario.
   * Verifica su estado y la unicidad de la fecha cuando esta cambia.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async actualizar(
    id: string,
    dto: UpdateCalendarioDto,
    idUsuario: string,
  ): Promise<CalendarioMessageResponse> {
    const calendario = await this.calendarioRepository.findOne({
      where: { id },
    });

    if (!calendario) {
      throw new NotFoundException(
        'No se encontró el registro del calendario solicitado.',
      );
    }

    if (calendario.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar un registro inactivo del calendario.',
      );
    }

    if (dto.fecha !== undefined && dto.fecha !== calendario.fecha) {
      validarFecha(dto.fecha);

      const existente = await this.calendarioRepository.findOne({
        where: {
          fecha: dto.fecha,
          id: Not(id),
        },
      });

      if (existente) {
        throw new ConflictException(
          'La fecha ya se encuentra registrada en el calendario.',
        );
      }

      calendario.fecha = dto.fecha;
    }

    if (dto.habil !== undefined) {
      calendario.dia_habil = dto.habil;
    }

    if (dto.descripcion !== undefined) {
      calendario.descripcion = dto.descripcion;
    }

    calendario._updated_at = new Date();
    calendario._user_update = idUsuario;
    calendario.usuario_actualizador = { idUsuario } as Usuario;

    try {
      await this.calendarioRepository.save(calendario);

      return {
        message: 'El registro del calendario fue actualizado correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'La fecha ya se encuentra registrada en el calendario.',
        );
      }

      this.logger.error(
        `Error al actualizar registro de calendario. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
  /**
   * Alterna el estado de un registro del calendario entre ACTIVO e INACTIVO.
   * Actualiza los datos de auditoría y registra o limpia la información
   * correspondiente a la inactivación del registro.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<CalendarioMessageResponse> {
    const calendario = await this.calendarioRepository.findOne({
      where: { id },
    });

    if (!calendario) {
      throw new NotFoundException(
        'No se encontró el registro del calendario solicitado.',
      );
    }

    const estadoAnterior = calendario.estado;
    calendario.estado = calendario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    calendario._updated_at = new Date();
    calendario._user_update = idUsuario;
    calendario.usuario_actualizador = { idUsuario } as Usuario;

    if (calendario.estado === 'INACTIVO') {
      calendario._deleted_at = new Date();
      calendario._user_delete = idUsuario;
      calendario.usuario_eliminador = { idUsuario } as Usuario;
    } else {
      calendario._deleted_at = null;
      calendario._user_delete = null;
      calendario.usuario_eliminador = null;
    }

    try {
      await this.calendarioRepository.save(calendario);

      return {
        message: `Registro del calendario ${calendario.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
      };
    } catch (error) {
      this.logger.error(
        `Error al cambiar estado de registro de calendario. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
