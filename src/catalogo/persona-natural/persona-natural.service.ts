/**
 * Módulo: Catálogos - Personas Naturales
 * Archivo: persona-natural.service.ts
 * Descripción:
 * Contiene la lógica de negocio para el registro, consulta,
 * actualización y administración de personas naturales.
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
  And,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { PersonaNatural } from './entities/persona-natural.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

import { CreatePersonaNaturalDto } from './dto/create-persona-natural.dto';
import { UpdatePersonaNaturalDto } from './dto/update-persona-natural.dto';
import { QueryPersonaNaturalDto } from './dto/query-persona-natural.dto';
import { BuscarPersonaNaturalDto } from './dto/buscar-persona-natural.dto';

import {
  BuscarPersonaNaturalResponse,
  PersonaNaturalCreateResponse,
  PersonaNaturalMessageResponse,
  PersonaNaturalResponse,
} from './interface/persona-natural-response.interface';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { mapearRespuesta } from './util/map-response-persona-natural.utill';

/**
 * Servicio encargado de gestionar las operaciones
 * del catálogo de personas naturales.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class PersonaNaturalService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  private readonly logger = new Logger(PersonaNaturalService.name);

  /**
   * Inyecta el repositorio de personas naturales
   * para realizar las operaciones sobre la entidad.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  constructor(
    @InjectRepository(PersonaNatural)
    private readonly personaNaturalRepository: Repository<PersonaNatural>,
  ) {}
  /*
  Nombre del método: crear
  Descripción: Registra una nueva persona natural, verificando la existencia de
               sus datos documentales (tipo, número, complemento, expedido) y la
               validez de su fecha de nacimiento.
  Parámetros:
    - dto: CreatePersonaNaturalDto (tipo_documento, numero_documento,
           complemento?, expedido?, nombres, apellido_paterno, apellido_materno?,
           fecha_nacimiento?, estado_civil?, email?, ...)
    - idUsuario: string (usuario que crea)
  Respuestas posibles:
    - 201: Persona registrada exitosamente (con id).
    - 400: La fecha de nacimiento no puede ser posterior a la fecha actual.
    - 409: Ya existe una persona registrada con esos datos documentales.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async crear(
    dto: CreatePersonaNaturalDto,
    idUsuario: string,
  ): Promise<PersonaNaturalCreateResponse> {
    const complemento = dto.complemento ?? '';
    const expedido = dto.expedido ?? '';

    const existente = await this.personaNaturalRepository.findOne({
      where: {
        tipo_documento: dto.tipo_documento,
        numero_documento: dto.numero_documento,
        complemento,
        expedido,
      },
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe una persona registrada con esos datos documentales.',
      );
    }

    if (
      dto.fecha_nacimiento &&
      dto.fecha_nacimiento > new Date().toISOString().slice(0, 10)
    ) {
      throw new BadRequestException(
        'La fecha de nacimiento no puede ser posterior a la fecha actual.',
      );
    }

    const persona = this.personaNaturalRepository.create({
      ...dto,
      complemento,
      expedido,
      estado: 'ACTIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
      _user_created: idUsuario,
      usuario_creador: { id: idUsuario } as Usuario,
    });

    try {
      const guardada = await this.personaNaturalRepository.save(persona);

      return {
        message: 'Persona registrada exitosamente',
        id: guardada.id,
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe una persona registrada con esos datos documentales.',
        );
      }

      this.logger.error(
        `Error al crear persona natural. Tipo: ${dto.tipo_documento}, Número: ${dto.numero_documento}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /*
  Nombre del método: listar
  Descripción: Obtiene el listado paginado de personas naturales aplicando
               filtros de búsqueda, estado, tipo de documento, estado civil,
               fechas y ordenamiento.
  Parámetros:
    - query: QueryPersonaNaturalDto (page, limit, search, tipo_documento,
             status, estado_civil, startDate, endDate, sortBy, sortOrder)
  Respuestas posibles:
    - 200: Listado paginado de personas naturales.
    - 400: Rango de fechas inválido (startDate > endDate).
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async listar(
    query: QueryPersonaNaturalDto,
  ): Promise<PaginatedResponse<PersonaNaturalResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
      tipo_documento,
      status,
      estado_civil,
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

    // Definir campos permitidos para ordenar
    const camposOrdenamiento: Record<string, keyof PersonaNatural> = {
      createdAt: 'createdAt',
      nombres: 'nombres',
      numero_documento: 'numero_documento',
      fecha_nacimiento: 'fecha_nacimiento',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy] ?? 'createdAt';

    // Construir filtros comunes
    const filtros: FindOptionsWhere<PersonaNatural> = {};

    // Filtro por tipo de documento
    if (tipo_documento) {
      filtros.tipo_documento = tipo_documento;
    }

    // Filtro por estado
    if (status && status !== 'TODOS') {
      filtros.estado = status;
    } else if (!status) {
      filtros.estado = 'ACTIVO';
    }

    // Filtro por estado civil
    if (estado_civil) {
      filtros.estado_civil = estado_civil;
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
    const condiciones: FindOptionsWhere<PersonaNatural>[] = [];

    if (search?.trim()) {
      const busqueda = ILike(`%${search.trim()}%`);

      condiciones.push(
        { ...filtros, nombres: busqueda },
        { ...filtros, apellido_paterno: busqueda },
        { ...filtros, apellido_materno: busqueda },
        { ...filtros, numero_documento: busqueda },
        { ...filtros, email: busqueda },
      );
    } else {
      condiciones.push(filtros);
    }

    try {
      const [personas, total] =
        await this.personaNaturalRepository.findAndCount({
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
        items: personas.map((persona) => mapearRespuesta(persona)),
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
        `Error al listar personas naturales. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /*
  Nombre del método: buscarPorDocumento
  Descripción: Busca personas naturales mediante sus datos documentales.
               Tipo y número de documento son obligatorios; complemento y lugar
               de expedición funcionan como filtros opcionales.
  Parámetros:
    - dto: BuscarPersonaNaturalDto (tipo_documento, numero_documento,
           complemento?, expedido?)
  Respuestas posibles:
    - 200: Resultado con encontrada y persona (lista de registros).
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Se usa para la ruta `persona-natural/documento/...` y debe
                     declararse antes de `:id` para que la ruta literal no sea
                     capturada por el parámetro genérico.
*/
  async buscarPorDocumento(
    dto: BuscarPersonaNaturalDto,
  ): Promise<BuscarPersonaNaturalResponse> {
    const where: FindOptionsWhere<PersonaNatural> = {
      tipo_documento: dto.tipo_documento,
      numero_documento: dto.numero_documento,
    };

    if (dto.complemento !== undefined) {
      where.complemento = dto.complemento;
    }

    if (dto.expedido !== undefined) {
      where.expedido = dto.expedido;
    }

    const personas = await this.personaNaturalRepository.find({
      where,
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    return {
      encontrada: personas.length > 0,
      persona: personas.map((persona) => mapearRespuesta(persona)),
    };
  }

  /*
  Nombre del método: buscarPorId
  Descripción: Busca una persona natural mediante su identificador UUID.
               Si no existe un registro con ese identificador, lanza excepción
               de recurso no encontrado.
  Parámetros:
    - id: string (identificador de la persona natural)
  Respuestas posibles:
    - 200: Registro encontrado.
    - 404: No se encontró la persona natural solicitada.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async buscarPorId(id: string): Promise<PersonaNaturalResponse> {
    const persona = await this.personaNaturalRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!persona) {
      throw new NotFoundException(
        'No se encontró la persona natural solicitada.',
      );
    }

    return mapearRespuesta(persona);
  }
  /*
  Nombre del método: actualizar
  Descripción: Actualiza la información de una persona natural existente.
               Verifica su estado ACTIVO, la fecha de nacimiento y la unicidad de
               los datos documentales cuando estos son modificados.
  Parámetros:
    - id: string (identificador de la persona natural)
    - dto: UpdatePersonaNaturalDto (campos a actualizar, incl. datos documentales
           y fecha_nacimiento)
    - idUsuario: string (usuario que actualiza)
  Respuestas posibles:
    - 200: Persona natural actualizada correctamente.
    - 400: No se puede actualizar una persona inactiva / fecha de nacimiento
           posterior a la actual.
    - 404: No se encontró la persona natural solicitada.
    - 409: Ya existe otra persona registrada con esos datos documentales.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async actualizar(
    id: string,
    dto: UpdatePersonaNaturalDto,
    idUsuario: string,
  ): Promise<PersonaNaturalMessageResponse> {
    const persona = await this.personaNaturalRepository.findOne({
      where: { id: id },
    });

    if (!persona) {
      throw new NotFoundException(
        'No se encontró la persona natural solicitada.',
      );
    }

    if (persona.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar una persona inactiva.',
      );
    }

    const fechaNacimiento = dto.fecha_nacimiento ?? persona.fecha_nacimiento;

    if (
      fechaNacimiento &&
      fechaNacimiento > new Date().toISOString().slice(0, 10)
    ) {
      throw new BadRequestException(
        'La fecha de nacimiento no puede ser posterior a la fecha actual.',
      );
    }

    const identidadCambio =
      dto.tipo_documento !== undefined ||
      dto.numero_documento !== undefined ||
      dto.complemento !== undefined ||
      dto.expedido !== undefined;

    if (identidadCambio) {
      const identidad = {
        tipo_documento: dto.tipo_documento ?? persona.tipo_documento,
        numero_documento: dto.numero_documento ?? persona.numero_documento,
        complemento: dto.complemento ?? persona.complemento,
        expedido: dto.expedido ?? persona.expedido,
      };

      const existente = await this.personaNaturalRepository.findOne({
        where: {
          tipo_documento: identidad.tipo_documento,
          numero_documento: identidad.numero_documento,
          complemento: identidad.complemento,
          expedido: identidad.expedido,
          id: Not(id),
        },
      });

      if (existente) {
        throw new ConflictException(
          'Ya existe otra persona registrada con esos datos documentales.',
        );
      }
    }

    Object.assign(persona, dto);
    persona.updatedAt = new Date();
    persona._user_update = idUsuario;
    persona.usuario_actualizador = { id: idUsuario } as Usuario;

    try {
      await this.personaNaturalRepository.save(persona);

      return {
        message: 'Persona natural actualizada correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe otra persona registrada con esos datos documentales.',
        );
      }

      this.logger.error(
        `Error al actualizar persona natural. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /*
  Nombre del método: cambiarEstado
  Descripción: Alterna el estado de una persona natural entre ACTIVO e INACTIVO.
               Actualiza datos de auditoría y registra o limpia la información
               de inactivación (eliminación lógica).
  Parámetros:
    - id: string (identificador de la persona natural)
    - idUsuario: string (usuario que realiza el cambio)
  Respuestas posibles:
    - 200: Registro de la persona natural activado/inactivado correctamente.
    - 404: No se encontró la persona natural solicitada.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<PersonaNaturalMessageResponse> {
    const persona = await this.personaNaturalRepository.findOne({
      where: { id: id },
    });

    if (!persona) {
      throw new NotFoundException(
        'No se encontró la persona natural solicitada.',
      );
    }

    const estadoAnterior = persona.estado;
    persona.estado = persona.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    persona.updatedAt = new Date();
    persona._user_update = idUsuario;
    persona.usuario_actualizador = { id: idUsuario } as Usuario;

    if (persona.estado === 'INACTIVO') {
      persona.deletedAt = new Date();
      persona._user_delete = idUsuario;
      persona.usuario_eliminador = { id: idUsuario } as Usuario;
    } else {
      persona.deletedAt = null;
      persona._user_delete = null;
      persona.usuario_eliminador = null;
    }

    try {
      await this.personaNaturalRepository.save(persona);
      return {
        message: `Registro de la persona natural ${persona.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
      };
    } catch (error) {
      this.logger.error(
        `Error al cambiar estado de persona natural. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
