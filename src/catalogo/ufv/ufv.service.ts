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

  /*
  Nombre del método: crear
  Descripción: Registra manualmente un nuevo valor UFV. Verifica que no exista
               otro registro para la misma fecha y asocia al usuario creador.
  Parámetros:
    - dto: CreateUfvDto (fecha, valor, ...)
    - idUsuario: string (usuario que crea)
  Respuestas posibles:
    - 201: UFV registrada correctamente.
    - 409: Ya existe una UFV para esa fecha.
    - 500: No se pudo guardar el registro.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
      usuario_creador: { id: idUsuario },
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

  /*
  Nombre del método: crearDesdeApi
  Descripción: Registra un valor UFV obtenido desde una fuente externa.
               Evita duplicados por fecha y usa el identificador del usuario
               recibido en el DTO de integración. No lanza conflicto por
               duplicados; retorna un estado "registrado".
  Parámetros:
    - dto: CreateUfvApiDto (fecha, valor, userId)
  Respuestas posibles:
    - 201: { registrado: true, mensaje: 'UFV registrada correctamente' }.
    - 201: { registrado: false, mensaje: 'La UFV de esta fecha ya se encuentra registrada' }.
    - 500: No se pudo registrar la UFV obtenida desde la API.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
      usuario_creador: { id: userId },
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

  /*
  Nombre del método: listar
  Descripción: Obtiene los registros UFV aplicando filtros, búsqueda,
               ordenamiento y paginación.
  Parámetros:
    - query: QueryUfvDto (page, limit, sortBy, sortOrder, startDate, endDate,
             status)
  Respuestas posibles:
    - 200: Listado paginado de UFVs.
    - 400: Rango de fechas inválido (startDate > endDate) / campo de
           ordenamiento no válido.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
      createdAt: 'createdAt',
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
  /*
  Nombre del método: buscarPorId
  Descripción: Busca un registro UFV por su identificador único e incluye los
               usuarios de creación y actualización.
  Parámetros:
    - id: string (identificador de la UFV)
  Respuestas posibles:
    - 200: Registro encontrado.
    - 404: No existe una UFV con ese identificador.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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

  /*
  Nombre del método: buscarPorFecha
  Descripción: Busca un registro UFV por una fecha específica, solo si está
               ACTIVO y no eliminado lógicamente.
  Parámetros:
    - fecha: string (fecha de la UFV a buscar)
  Respuestas posibles:
    - 200: Registro encontrado.
    - 404: No existe una UFV activa para esa fecha.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Se usa para la ruta `ufv/fecha/:fecha` y debe declararse
                     antes de `:id` para que la ruta literal no sea capturada por
                     el parámetro genérico.
*/
  async buscarPorFecha(fecha: string): Promise<UfvResponse> {
    const ufv = await this.ufvRepository.findOne({
      where: { fecha, estado: 'ACTIVO', deletedAt: IsNull() },
      relations: { usuario_creador: true, usuario_actualizador: true },
    });
    if (!ufv) {
      throw new NotFoundException('No existe una UFV activa para esa fecha');
    }

    this.logger.log(`UFV encontrada para la fecha: ${fecha}`);
    return mapearRespuesta(ufv);
  }

  /*
  Nombre del método: actualizar
  Descripción: Actualiza parcialmente un registro UFV existente. Verifica
               existencia, estado ACTIVO (no eliminado) y posibles duplicados de
               fecha, actualizando los campos de auditoría.
  Parámetros:
    - id: string (identificador de la UFV)
    - dto: UpdateUfvDto (campos a actualizar)
    - idUsuario: string (usuario que actualiza)
  Respuestas posibles:
    - 200: UFV actualizada correctamente.
    - 404: No existe una UFV con ese identificador.
    - 409: No se puede actualizar una UFV inactiva / ya existe otra UFV para
           esa fecha.
    - 500: No se pudo actualizar el registro.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
    if (ufv.estado !== 'ACTIVO' || ufv.deletedAt) {
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
    ufv.deletedAt = new Date();

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

  /*
  Nombre del método: cambiarEstado
  Descripción: Cambia el estado de un registro UFV entre ACTIVO e INACTIVO.
               Al desactivar registra eliminación lógica; al reactivar limpia esos
               datos y registra la actualización.
  Parámetros:
    - id: string (identificador de la UFV)
    - idUsuario: string (usuario que realiza el cambio)
  Respuestas posibles:
    - 200: Registro del UFV activado/inactivado correctamente.
    - 404: No existe una UFV con ese identificador.
    - 500: No se pudo cambiar el estado del registro.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
      ufv.deletedAt = new Date();
      ufv._user_update = null;
      ufv.updatedAt = null;
    } else {
      // Al reactivar, limpia los datos de eliminación lógica.
      ufv._user_update = idUsuario;
      ufv.updatedAt = new Date();
      ufv._user_delete = null;
      ufv.deletedAt = null;
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
