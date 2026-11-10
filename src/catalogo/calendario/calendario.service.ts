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
import { Brackets, DataSource, Repository } from 'typeorm';

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
    this.logger.log(
      `Iniciando creación de fecha en calendario. Fecha: ${dto.fecha}, Usuario: ${idUsuario}`,
    );

    validarFecha(dto.fecha);

    const existente = await this.calendarioRepository.findOne({
      where: { fecha: dto.fecha },
    });

    if (existente) {
      this.logger.warn(
        `Conflicto al crear fecha de calendario: ya existe registro para la fecha ${dto.fecha}`,
      );
      throw new ConflictException(
        'La fecha ya se encuentra registrada en el calendario.',
      );
    }

    const calendario = this.calendarioRepository.create({
      fecha: dto.fecha,
      habil: dto.habil ?? calcularDiaHabil(dto.fecha),
      descripcion: dto.descripcion ?? null,
      estado: 'ACTIVO',
      _created_at: new Date(),
      _updated_at: new Date(),
      _user_created: idUsuario,
      usuario_creador: { idUsuario } as Usuario,
    });

    try {
      const guardado = await this.calendarioRepository.save(calendario);

      this.logger.log(
        `Fecha registrada correctamente en calendario. ID: ${guardado.id}, Fecha: ${guardado.fecha}, Habil: ${guardado.habil}, Usuario: ${idUsuario}`,
      );

      return {
        message: 'La fecha fue registrada correctamente.',
        id: guardado.id,
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al crear fecha de calendario. Fecha: ${dto.fecha}`,
        );
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
    this.logger.log(
      `Iniciando creación de rango. Desde: ${dto.fecha_inicio}, Hasta: ${dto.fecha_fin}, Usuario: ${idUsuario}`,
    );

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
          const existentes = await repository
            .createQueryBuilder('calendario')
            .select('calendario.fecha', 'fecha')
            .where('calendario.fecha IN (:...fechas)', { fechas })
            .getRawMany<{ fecha: string }>();

          const setExistentes = new Set(existentes.map(({ fecha }) => fecha));

          // 3. Separar fechas nuevas y omitidas
          const fechasNuevas = fechas.filter(
            (fecha) => !setExistentes.has(fecha),
          );

          const fechasOmitidas = fechas.filter((fecha) =>
            setExistentes.has(fecha),
          );

          this.logger.debug(
            `Rango procesado: ${fechas.length} totales, ${fechasNuevas.length} nuevas, ${fechasOmitidas.length} omitidas.`,
          );

          // 4. Insertar únicamente fechas nuevas
          if (fechasNuevas.length > 0) {
            const fechaActual = new Date();

            const registros = fechasNuevas.map((fecha) =>
              repository.create({
                fecha,
                habil: dto.habil ?? calcularDiaHabil(fecha),
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

      this.logger.log(
        `Rango finalizado. Insertados: ${resultado.total}, Omitidos: ${resultado.fechas_omitidas?.length}, Usuario: ${idUsuario}`,
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
    this.logger.log(
      `Listando calendario. Página: ${query.page}, Límite: ${query.limit}, Search: ${query.search ?? 'N/A'}, Estado: ${query.status ?? 'ACTIVO'}, Habil: ${query.habil ?? 'N/A'}, StartDate: ${query.startDate ?? 'N/A'}, EndDate: ${query.endDate ?? 'N/A'}`,
    );

    const {
      page,
      limit,
      search,
      status,
      habil,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query;

    const camposOrdenamiento: Record<string, string> = {
      fecha: 'calendario.fecha',
      habil: 'calendario.habil',
      descripcion: 'calendario.descripcion',
      createdAt: 'calendario._created_at',
      updatedAt: 'calendario._updated_at',
    };

    const campoOrdenamiento =
      camposOrdenamiento[sortBy ?? 'fecha'] ?? 'calendario.fecha';

    const queryBuilder = this.calendarioRepository
      .createQueryBuilder('calendario')
      .leftJoinAndSelect('calendario.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect(
        'calendario.usuario_actualizador',
        'usuario_actualizador',
      );

    if (search) {
      this.logger.debug(`Aplicando filtro de búsqueda: "${search}"`);
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('CAST(calendario.fecha AS TEXT) ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('calendario.descripcion ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    // Aplicar filtro de estado, mostrando activos por defecto.
    if (status && status !== 'TODOS') {
      this.logger.debug(`Aplicando filtro estado: ${status}`);
      queryBuilder.andWhere('calendario.estado = :estado', {
        estado: status,
      });
    } else if (!status) {
      this.logger.debug('Aplicando filtro estado por defecto: ACTIVO');
      queryBuilder.andWhere('calendario.estado = :estado', {
        estado: 'ACTIVO',
      });
    } else {
      this.logger.debug('Consultando el Calendario de todos los estados');
    }

    if (habil !== undefined) {
      this.logger.debug(`Aplicando filtro habil: ${habil}`);
      queryBuilder.andWhere('calendario.habil = :habil', {
        habil,
      });
    }

    if (startDate) {
      this.logger.debug(`Aplicando filtro startDate: ${startDate}`);
      validarFecha(startDate);

      queryBuilder.andWhere('calendario.fecha >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      this.logger.debug(`Aplicando filtro endDate: ${endDate}`);
      validarFecha(endDate);

      queryBuilder.andWhere('calendario.fecha <= :endDate', {
        endDate,
      });
    }

    if (startDate && endDate && startDate > endDate) {
      this.logger.warn(
        `Rango de fechas inválido: startDate ${startDate} > endDate ${endDate}`,
      );
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    try {
      const [registros, total] = await queryBuilder
        .orderBy(campoOrdenamiento, sortOrder ?? 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Listado de calendario obtenido. Total: ${total}, Página: ${page}/${totalPages || 1}, Items devueltos: ${registros.length}`,
      );

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
    this.logger.log(`Buscando fecha en calendario: ${fecha}`);

    validarFecha(fecha);

    const calendario = await this.calendarioRepository
      .createQueryBuilder('calendario')
      .leftJoinAndSelect('calendario.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect(
        'calendario.usuario_actualizador',
        'usuario_actualizador',
      )
      .where('calendario.fecha = :fecha', { fecha })
      .andWhere('calendario.estado = :estado', { estado: 'ACTIVO' })
      .getOne();

    if (calendario) {
      this.logger.log(
        `Fecha encontrada en configuración. Fecha: ${fecha}, Habil: ${calendario.habil}`,
      );
      return {
        fecha: calendario.fecha,
        habil: calendario.habil,
        configurada: true,
        origen: 'CONFIGURACION',
        registro: mapearCalendario(calendario),
      };
    }

    const habilCalculado = calcularDiaHabil(fecha);
    this.logger.log(
      `Fecha no configurada, se calcula por día de semana. Fecha: ${fecha}, Habil: ${habilCalculado}`,
    );

    return {
      fecha,
      habil: habilCalculado,
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
    this.logger.log(`Buscando registro de calendario por ID: ${id}`);

    const calendario = await this.calendarioRepository
      .createQueryBuilder('calendario')
      .leftJoinAndSelect('calendario.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect(
        'calendario.usuario_actualizador',
        'usuario_actualizador',
      )
      .where('calendario.id = :id', { id })
      .getOne();

    if (!calendario) {
      this.logger.warn(`Registro de calendario no encontrado. ID: ${id}`);
      throw new NotFoundException(
        'No se encontró el registro del calendario solicitado.',
      );
    }

    this.logger.log(
      `Registro de calendario encontrado. ID: ${id}, Fecha: ${calendario.fecha}`,
    );
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
    this.logger.log(
      `Iniciando actualización de registro de calendario. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const calendario = await this.calendarioRepository.findOne({
      where: { id },
    });

    if (!calendario) {
      this.logger.warn(
        `No se encontró registro de calendario para actualizar. ID: ${id}`,
      );
      throw new NotFoundException(
        'No se encontró el registro del calendario solicitado.',
      );
    }

    if (calendario.estado !== 'ACTIVO') {
      this.logger.warn(
        `Intento de actualización sobre registro inactivo del calendario. ID: ${id}, Estado: ${calendario.estado}`,
      );
      throw new BadRequestException(
        'No se puede actualizar un registro inactivo del calendario.',
      );
    }

    if (dto.fecha !== undefined && dto.fecha !== calendario.fecha) {
      this.logger.debug(
        `Cambio de fecha detectado. Anterior: ${calendario.fecha}, Nueva: ${dto.fecha}`,
      );
      validarFecha(dto.fecha);

      const existente = await this.calendarioRepository
        .createQueryBuilder('calendario')
        .where('calendario.fecha = :fecha', { fecha: dto.fecha })
        .andWhere('calendario.id != :id', { id })
        .getOne();

      if (existente) {
        this.logger.warn(
          `Conflicto al actualizar fecha: ya existe otro registro con la fecha ${dto.fecha}. ID actual: ${id}`,
        );
        throw new ConflictException(
          'La fecha ya se encuentra registrada en el calendario.',
        );
      }

      calendario.fecha = dto.fecha;
    }

    if (dto.habil !== undefined) {
      calendario.habil = dto.habil;
    }

    if (dto.descripcion !== undefined) {
      calendario.descripcion = dto.descripcion;
    }

    calendario._updated_at = new Date();
    calendario._user_update = idUsuario;
    calendario.usuario_actualizador = { idUsuario } as Usuario;

    try {
      await this.calendarioRepository.save(calendario);

      this.logger.log(
        `Registro de calendario actualizado correctamente. ID: ${id}, Fecha: ${calendario.fecha}, Usuario: ${idUsuario}`,
      );

      return {
        message: 'El registro del calendario fue actualizado correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al actualizar registro de calendario. ID: ${id}, Fecha: ${calendario.fecha}`,
        );
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
    this.logger.log(
      `Iniciando cambio de estado de registro de calendario. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const calendario = await this.calendarioRepository.findOne({
      where: { id },
    });

    if (!calendario) {
      this.logger.warn(
        `No se encontró registro de calendario para cambiar estado. ID: ${id}`,
      );
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

      this.logger.log(
        `Estado de registro de calendario cambiado correctamente. ID: ${id}, Estado anterior: ${estadoAnterior}, Estado nuevo: ${calendario.estado}, Usuario: ${idUsuario}`,
      );

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
