/**
 * Módulo: Catálogo - UFV
 * Archivo: ufv.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de los valores UFV.
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

import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
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
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class UfvService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
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
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async crear(
    dto: CreateUfvDto,
    idUsuario: string,
  ): Promise<UfvMessageResponse> {
    // Comprueba si ya existe un registro para la fecha proporcionada.
    const existe = await this.ufvRepository.findOne({
      where: { fecha: dto.fecha },
    });

    if (existe) {
      throw new ConflictException('Ya existe una UFV para esa fecha');
    }

    // Prepara la entidad asociando los datos del usuario creador.
    const ufv = this.ufvRepository.create({
      ...dto,
      usuario_creador: { idUsuario },
    });

    try {
      await this.ufvRepository.save(ufv);

      return {
        message: 'UFV registrada correctamente',
      };
    } catch (error: unknown) {
      // Controla posibles duplicados producidos durante el guardado.
      if (esErrorDuplicado(error)) {
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
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async crearDesdeApi(dto: CreateUfvApiDto) {
    const { fecha, valor, userId } = dto;

    // Evita registrar nuevamente una fecha existente.
    const existe = await this.ufvRepository.findOne({
      where: { fecha },
    });

    if (existe) {
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
      await this.ufvRepository.save(ufv);

      return {
        registrado: true,
        mensaje: 'UFV registrada correctamente',
      };
    } catch (error: unknown) {
      // Evita interrumpir el proceso de sincronización por registros duplicados.
      if (esErrorDuplicado(error)) {
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
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async listar(query: QueryUfvDto): Promise<PaginatedResponse<UfvResponse>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
      status,
    } = query;

    // Validar rango de fechas
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser mayor que la fecha final.',
      );
    }

    // Validar campo de ordenamiento
    const camposOrdenamiento: Record<string, string> = {
      createdAt: '_created_at',
      fecha: 'fecha',
      valor: 'valor',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido.',
      );
    }

    // Construir filtros
    const where: FindOptionsWhere<Ufv> = {};

    // Filtro por estado
    if (status && status !== 'TODOS') {
      where.estado = status;
    } else if (!status) {
      where.estado = 'ACTIVO';
    }

    // Filtro por fechas
    if (startDate) {
      where.fecha = MoreThanOrEqual(startDate);
    }

    if (endDate) {
      where.fecha = LessThanOrEqual(endDate);
    }

    // Paginación
    const skip = (page - 1) * limit;

    try {
      const [registros, total] = await this.ufvRepository.findAndCount({
        where,
        relations: {
          usuario_creador: true,
          usuario_actualizador: true,
        },
        order: {
          [campoOrdenamiento]: sortOrder,
        },
        skip,
        take: limit,
      });

      const items: UfvResponse[] = registros.map((registro) =>
        mapearRespuesta(registro),
      );

      const totalPages = Math.ceil(total / limit);

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
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorId(id: string): Promise<UfvResponse> {
    const ufv = await this.ufvRepository.findOne({
      where: { id },
      relations: { usuario_creador: true, usuario_actualizador: true },
    });

    if (!ufv) {
      throw new NotFoundException('No existe una UFV con ese identificador');
    }

    this.logger.log(`UFV encontrada. ID: ${id}, Fecha: ${ufv.fecha}`);
    return mapearRespuesta(ufv);
  }

  /**
   * Busca un registro UFV por una fecha específica.
   * Solo considera registros activos y que no hayan sido eliminados.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorFecha(fecha: string): Promise<UfvResponse> {
    const ufv = await this.ufvRepository.findOne({
      where: { fecha, estado: 'ACTIVO', _deleted_at: IsNull() },
      relations: { usuario_creador: true, usuario_actualizador: true },
    });
    if (!ufv) {
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
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async actualizar(
    id: string,
    dto: UpdateUfvDto,
    idUsuario: string,
  ): Promise<UfvMessageResponse> {
    const ufv = await this.ufvRepository.findOne({
      where: { id },
    });

    if (!ufv) {
      throw new NotFoundException('No existe una UFV con ese identificador');
    }

    // Impide modificar registros inactivos o eliminados.
    if (ufv.estado !== 'ACTIVO' || ufv._deleted_at) {
      throw new ConflictException('No se puede actualizar una UFV inactiva');
    }

    // Verifica que la nueva fecha no esté asignada a otro registro.
    if (dto.fecha && dto.fecha !== ufv.fecha) {
      const fechaDuplicada = await this.ufvRepository.findOne({
        where: { fecha: dto.fecha },
      });

      if (fechaDuplicada) {
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

      return {
        message: 'UFV actualizada correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
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
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<UfvMessageResponse> {
    const ufv = await this.ufvRepository.findOne({
      where: { id },
    });

    if (!ufv) {
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
