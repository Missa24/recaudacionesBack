/**
 * Módulo: Catálogo - UFV
 * Archivo: ufv.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de los valores UFV.
 * Gestiona registros manuales, sincronización externa, consultas,
 * actualizaciones y cambios de estado, incluyendo el control de auditoría.
 *
 * Desarrollado por: Missael Apaza
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
import { Repository } from 'typeorm';
import { Ufv } from './entities/ufv.entity';
import { CreateUfvDto } from './dto/create-ufv.dto';
import { UpdateUfvDto } from './dto/update-ufv.dto';
import { CreateUfvApiDto } from './dto/create-ufv-api.dto';
import { QueryUfvDto } from './dto/query-ufv.dto';
import { esErrorDuplicado } from '../../shared/util/errores-duplicados.util';
import {
  UfvResponse,
  UfvMessageResponse,
} from './interface/ufv-response.interface';
import { mapearRespuesta } from './util/map-response-ufv.util';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

/**
 * Servicio: UfvService
 * Descripción:
 * Implementa las operaciones de negocio para administrar los registros UFV,
 * utilizando TypeORM para interactuar con la base de datos.
 *
 * Desarrollado por: Missael Apaza
 */
@Injectable()
export class UfvService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza
   */
  private readonly logger = new Logger(UfvService.name);

  constructor(
    @InjectRepository(Ufv)
    private readonly ufvRepository: Repository<Ufv>,
  ) {}

  /**
   * Registra manualmente un nuevo valor UFV.
   * Verifica que no exista otro registro para la misma fecha
   * y asocia al usuario responsable de la creación.
   *
   * Desarrollado por: Missael Apaza
   */
  async crear(
    dto: CreateUfvDto,
    idUsuario: string,
  ): Promise<UfvMessageResponse> {
    this.logger.log(
      `Iniciando creación de UFV. Fecha: ${dto.fecha}, Valor: ${dto.valor}, Usuario: ${idUsuario}`,
    );

    // Comprueba si ya existe un registro para la fecha proporcionada.
    const existe = await this.ufvRepository.findOne({
      where: { fecha: dto.fecha },
    });

    if (existe) {
      this.logger.warn(
        `Conflicto al crear UFV: ya existe registro para la fecha ${dto.fecha}`,
      );
      throw new ConflictException('Ya existe una UFV para esa fecha');
    }

    // Prepara la entidad asociando los datos del usuario creador.
    const ufv = this.ufvRepository.create({
      ...dto,
      usuario_creador: { idUsuario },
    });

    try {
      const guardada = await this.ufvRepository.save(ufv);

      this.logger.log(
        `UFV registrada correctamente. ID: ${guardada.id}, Fecha: ${guardada.fecha}, Valor: ${guardada.valor}, Usuario: ${idUsuario}`,
      );

      return {
        message: 'UFV registrada correctamente',
      };
    } catch (error: unknown) {
      // Controla posibles duplicados producidos durante el guardado.
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al crear UFV. Fecha: ${dto.fecha}`,
        );
        throw new ConflictException('Ya existe una UFV para esa fecha');
      }

      this.logger.error(
        `Error al crear una UFV. Fecha: ${dto.fecha}, Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('No se pudo guardar el registro');
    }
  }

  /**
   * Registra un valor UFV obtenido desde una fuente externa.
   * Evita duplicados por fecha y utiliza el identificador del usuario
   * recibido mediante el DTO de integración.
   *
   * Desarrollado por: Missael Apaza
   */
  async crearDesdeApi(dto: CreateUfvApiDto) {
    const { fecha, valor, userId } = dto;

    this.logger.log(
      `Iniciando registro de UFV desde API. Fecha: ${fecha}, Valor: ${valor}, UserID: ${userId}`,
    );

    // Evita registrar nuevamente una fecha existente.
    const existe = await this.ufvRepository.findOne({
      where: { fecha },
    });

    if (existe) {
      this.logger.warn(
        `UFV desde API omitida: la fecha ${fecha} ya se encuentra registrada`,
      );
      return {
        registrado: false,
        mensaje: 'La UFV de esta fecha ya se encuentra registrada',
      };
    }

    // Construye el registro con los datos recibidos desde la API.
    const ufv = this.ufvRepository.create({
      fecha,
      valor,
      usuario_creador: { idUsuario: userId },
    });

    try {
      const guardada = await this.ufvRepository.save(ufv);

      this.logger.log(
        `UFV desde API registrada correctamente. ID: ${guardada.id}, Fecha: ${fecha}, Valor: ${valor}, UserID: ${userId}`,
      );

      return {
        registrado: true,
        mensaje: 'UFV registrada correctamente',
      };
    } catch (error: unknown) {
      // Evita interrumpir el proceso de sincronización por registros duplicados.
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al registrar UFV desde API. Fecha: ${fecha}`,
        );
        return {
          registrado: false,
          mensaje: 'La UFV de esta fecha ya se encuentra registrada',
        };
      }

      this.logger.error(
        `Error al registrar UFV desde API. Fecha: ${fecha}, UserID: ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo registrar la UFV obtenida desde la API',
      );
    }
  }

  /**
   * Obtiene los registros UFV aplicando filtros, búsqueda,
   * ordenamiento y paginación.
   *
   * Desarrollado por: Missael Apaza
   */
  async listar(query: QueryUfvDto): Promise<PaginatedResponse<UfvResponse>> {
    this.logger.log(
      `Listando UFVs. Página: ${query.page ?? 1}, Límite: ${query.limit ?? 10}, Search: ${query.search ?? 'N/A'}, StartDate: ${query.startDate ?? 'N/A'}, EndDate: ${query.endDate ?? 'N/A'}, Estado: ${query.status ?? 'ACTIVO'}`,
    );

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      startDate,
      endDate,
      status,
    } = query;

    // Validar el rango de fechas.
    if (startDate && endDate && startDate > endDate) {
      this.logger.warn(
        `Rango de fechas inválido al listar UFVs: startDate ${startDate} > endDate ${endDate}`,
      );
      throw new BadRequestException(
        'La fecha inicial no puede ser mayor que la fecha final.',
      );
    }

    // Crear la consulta principal.
    const queryBuilder = this.ufvRepository
      .createQueryBuilder('ufv')
      .leftJoinAndSelect('ufv.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect('ufv.usuario_actualizador', 'usuario_actualizador');

    if (status && status !== 'TODOS') {
      this.logger.debug(`Aplicando filtro estado: ${status}`);
      queryBuilder.andWhere('ufv.estado = :estado', {
        estado: status,
      });
    } else if (!status) {
      this.logger.debug('Aplicando filtro estado por defecto: ACTIVO');
      queryBuilder.andWhere('ufv.estado = :estado', {
        estado: 'ACTIVO',
      });
    } else {
      this.logger.debug('Consultando UFVs de todos los estados');
    }

    // Aplicar filtro por fecha inicial.
    if (startDate) {
      this.logger.debug(`Aplicando filtro startDate: ${startDate}`);
      queryBuilder.andWhere('ufv.fecha >= :startDate', {
        startDate,
      });
    }

    // Aplicar filtro por fecha final.
    if (endDate) {
      this.logger.debug(`Aplicando filtro endDate: ${endDate}`);
      queryBuilder.andWhere('ufv.fecha <= :endDate', {
        endDate,
      });
    }

    // Aplicar búsqueda general sobre los campos de UFV.
    if (search?.trim()) {
      this.logger.debug(`Aplicando filtro de búsqueda: "${search.trim()}"`);
      queryBuilder.andWhere(
        `(
        CAST(ufv.fecha AS TEXT) ILIKE :search
        OR CAST(ufv.valor AS TEXT) ILIKE :search
      )`,
        {
          search: `%${search.trim()}%`,
        },
      );
    }

    // Definir los campos permitidos para ordenar.
    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'ufv._created_at',
      fecha: 'ufv.fecha',
      valor: 'ufv.valor',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      this.logger.warn(`Campo de ordenamiento inválido solicitado: ${sortBy}`);
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido.',
      );
    }

    // Aplicar ordenamiento.
    queryBuilder.orderBy(campoOrdenamiento, sortOrder);

    // Aplicar paginación y obtener registros junto con el total.
    const skip = (page - 1) * limit;

    try {
      const [registros, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      // Mapear las entidades a la estructura de respuesta.
      const items: UfvResponse[] = registros.map((registro) =>
        mapearRespuesta(registro),
      );

      // Calcular información de paginación.
      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Listado de UFVs obtenido. Total: ${total}, Página: ${page}/${totalPages || 1}, Items devueltos: ${items.length}`,
      );

      return {
        items,
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
        `Error al listar UFVs. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Busca un registro UFV mediante su identificador único.
   * Incluye los nombres de usuario asociados a su creación y actualización.
   *
   * Desarrollado por: Missael Apaza
   */
  async buscarPorId(id: string): Promise<UfvResponse> {
    this.logger.log(`Buscando UFV por ID: ${id}`);

    const ufv = await this.ufvRepository
      .createQueryBuilder('ufv')
      .leftJoin('ufv.usuario_creador', 'creador')
      .leftJoin('ufv.usuario_actualizador', 'actualizador')
      .select([
        'ufv.id',
        'ufv.fecha',
        'ufv.valor',
        'ufv.estado',
        'creador.username',
        'actualizador.username',
      ])
      .where('ufv.id = :id', { id })
      .getOne();

    if (!ufv) {
      this.logger.warn(`UFV no encontrada con ID: ${id}`);
      throw new NotFoundException('No existe una UFV con ese identificador');
    }

    this.logger.log(`UFV encontrada. ID: ${id}, Fecha: ${ufv.fecha}`);
    return mapearRespuesta(ufv);
  }

  /**
   * Busca un registro UFV por una fecha específica.
   * Solo considera registros activos y que no hayan sido eliminados.
   *
   * Desarrollado por: Missael Apaza
   */
  async buscarPorFecha(fecha: string): Promise<UfvResponse> {
    this.logger.log(`Buscando UFV por fecha: ${fecha}`);

    const ufv = await this.ufvRepository
      .createQueryBuilder('ufv')
      .leftJoin('ufv.usuario_creador', 'creador')
      .leftJoin('ufv.usuario_actualizador', 'actualizador')
      .select([
        'ufv.id',
        'ufv.fecha',
        'ufv.valor',
        'ufv.estado',
        'creador.username',
        'actualizador.username',
      ])
      .where('ufv.fecha = :fecha', { fecha })
      .andWhere('ufv.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('ufv._deleted_at IS NULL')
      .getOne();

    if (!ufv) {
      this.logger.warn(`UFV activa no encontrada para la fecha: ${fecha}`);
      throw new NotFoundException('No existe una UFV activa para esa fecha');
    }

    this.logger.log(`UFV encontrada para la fecha: ${fecha}`);
    return mapearRespuesta(ufv);
  }

  /**
   * Actualiza parcialmente un registro UFV existente.
   * Verifica su existencia, estado y posibles duplicados de fecha.
   * También actualiza los campos de auditoría correspondientes.
   *
   * Desarrollado por: Missael Apaza
   */
  async actualizar(
    id: string,
    dto: UpdateUfvDto,
    idUsuario: string,
  ): Promise<UfvMessageResponse> {
    this.logger.log(
      `Iniciando actualización de UFV. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const ufv = await this.ufvRepository.findOne({
      where: { id },
    });

    if (!ufv) {
      this.logger.warn(`No se encontró UFV para actualizar. ID: ${id}`);
      throw new NotFoundException('No existe una UFV con ese identificador');
    }

    // Impide modificar registros inactivos o eliminados.
    if (ufv.estado !== 'ACTIVO' || ufv._deleted_at) {
      this.logger.warn(
        `Intento de actualización sobre UFV no actualizable. ID: ${id}, Estado: ${ufv.estado},`,
      );
      throw new ConflictException('No se puede actualizar una UFV inactiva');
    }

    // Verifica que la nueva fecha no esté asignada a otro registro.
    if (dto.fecha && dto.fecha !== ufv.fecha) {
      this.logger.debug(
        `Cambio de fecha detectado. Anterior: ${ufv.fecha}, Nueva: ${dto.fecha}`,
      );

      const fechaDuplicada = await this.ufvRepository.findOne({
        where: { fecha: dto.fecha },
      });

      if (fechaDuplicada) {
        this.logger.warn(
          `Conflicto al actualizar UFV: ya existe otro registro para la fecha ${dto.fecha}. ID actual: ${id}`,
        );
        throw new ConflictException(
          'Ya existe otra UFV registrada para esa fecha',
        );
      }
    }

    // Aplica únicamente los campos recibidos en la solicitud.
    Object.assign(ufv, dto);

    // Actualiza la información de auditoría.
    ufv._user_update = idUsuario;
    ufv._updated_at = new Date();

    try {
      await this.ufvRepository.save(ufv);

      this.logger.log(
        `UFV actualizada correctamente. ID: ${id}, Fecha: ${ufv.fecha}, Usuario: ${idUsuario}`,
      );

      return {
        message: 'UFV actualizada correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al actualizar UFV. ID: ${id}, Fecha: ${dto.fecha ?? ufv.fecha}`,
        );
        throw new ConflictException(
          'Ya existe otra UFV registrada para esa fecha',
        );
      }

      this.logger.error(
        `Error al actualizar UFV. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo actualizar el registro',
      );
    }
  }

  /**
   * Cambia el estado de un registro UFV entre ACTIVO e INACTIVO.
   * Al desactivar, registra los datos de eliminación lógica.
   * Al reactivar, limpia dichos datos y registra la actualización.
   *
   * Desarrollado por: Missael Apaza
   */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<UfvMessageResponse> {
    this.logger.log(
      `Iniciando cambio de estado de UFV. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const ufv = await this.ufvRepository.findOne({
      where: { id },
    });

    if (!ufv) {
      this.logger.warn(`No se encontró UFV para cambiar estado. ID: ${id}`);
      throw new NotFoundException('No existe una UFV con ese identificador');
    }

    const estadoAnterior = ufv.estado;
    // Determina el estado contrario al estado actual.
    const nuevoEstado = ufv.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    ufv.estado = nuevoEstado;

    if (nuevoEstado === 'INACTIVO') {
      // Registra quién y cuándo realizó la desactivación.
      ufv._user_delete = idUsuario;
      ufv._deleted_at = new Date();
      ufv._user_update = null;
      ufv._updated_at = null;
    } else {
      // Al reactivar, limpia los datos de eliminación lógica.
      ufv._user_update = idUsuario;
      ufv._updated_at = new Date();
      ufv._user_delete = null;
      ufv._deleted_at = null;
    }

    try {
      await this.ufvRepository.save(ufv);

      this.logger.log(
        `Estado de UFV cambiado correctamente. ID: ${id}, Estado anterior: ${estadoAnterior}, Estado nuevo: ${nuevoEstado}, Usuario: ${idUsuario}`,
      );

      return {
        message: `Registro del UFV ${ufv.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar estado de UFV. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del registro',
      );
    }
  }
}
