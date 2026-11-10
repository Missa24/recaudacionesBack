/**
 * Módulo: Catálogos - Personas Jurídicas
 * Archivo: persona-juridica.service.ts
 * Descripción:
 * Contiene la lógica de negocio para el registro, consulta,
 * actualización y administración de personas jurídicas.
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

import { PersonaJuridica } from './entities/persona-juridica.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

import { CreatePersonaJuridicaDto } from './dto/create-persona-juridica.dto';
import { UpdatePersonaJuridicaDto } from './dto/update-persona-juridica.dto';
import { QueryPersonaJuridicaDto } from './dto/query-persona-juridica.dto';
import { BuscarPersonaJuridicaDto } from './dto/buscar-persona-juridica.dto';

import {
  BuscarPersonaJuridicaResponse,
  PersonaJuridicaCreateResponse,
  PersonaJuridicaMessageResponse,
  PersonaJuridicaResponse,
} from './interface/persona-juridica-response.interface';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { mapearRespuesta } from './util/map-response-personajuridica.util';

/**
 * Servicio encargado de gestionar las operaciones
 * del catálogo de personas jurídicas.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class PersonaJuridicaService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  private readonly logger = new Logger(PersonaJuridicaService.name);

  /**
   * Inyecta el repositorio de personas jurídicas
   * para realizar las operaciones sobre la entidad.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  constructor(
    @InjectRepository(PersonaJuridica)
    private readonly personaJuridicaRepository: Repository<PersonaJuridica>,
  ) {}

  /**
   * Registra una nueva persona jurídica, verificando
   * que el NIT no se encuentre registrado previamente.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async crear(
    dto: CreatePersonaJuridicaDto,
    idUsuario: string,
  ): Promise<PersonaJuridicaCreateResponse> {
    const existente = await this.personaJuridicaRepository.findOne({
      where: { nit: dto.nit },
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe una persona jurídica registrada con ese NIT.',
      );
    }

    const persona = this.personaJuridicaRepository.create({
      ...dto,
      estado: 'ACTIVO',
      _created_at: new Date(),
      _updated_at: new Date(),
      _user_created: idUsuario,
      usuario_creador: { idUsuario } as Usuario,
    });

    try {
      const guardada = await this.personaJuridicaRepository.save(persona);

      return {
        message: 'Persona jurídica registrada exitosamente.',
        id: guardada.id,
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe una persona jurídica registrada con ese NIT.',
        );
      }

      this.logger.error(
        `Error al crear persona jurídica. NIT: ${dto.nit}, Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Obtiene el listado paginado de personas jurídicas
   * aplicando búsqueda, filtros, fechas y ordenamiento.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async listar(
    query: QueryPersonaJuridicaDto,
  ): Promise<PaginatedResponse<PersonaJuridicaResponse>> {
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

    // Definir campos permitidos para ordenar
    const camposOrdenamiento: Record<string, keyof PersonaJuridica> = {
      createdAt: '_created_at',
      nit: 'nit',
      razon_social: 'razon_social',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy] ?? '_created_at';

    // Construir filtros
    const filtros: FindOptionsWhere<PersonaJuridica> = {};

    // Filtro por estado
    if (status && status !== 'TODOS') {
      filtros.estado = status;
    } else if (!status) {
      filtros.estado = 'ACTIVO';
    }

    // Filtro por rango de fechas (horario local de Bolivia)
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
    // Construir condiciones de búsqueda OR
    const condiciones: FindOptionsWhere<PersonaJuridica>[] = [];

    if (search?.trim()) {
      const busqueda = ILike(`%${search.trim()}%`);

      condiciones.push(
        { ...filtros, nit: busqueda },
        { ...filtros, razon_social: busqueda },
        { ...filtros, email: busqueda },
      );
    } else {
      condiciones.push(filtros);
    }

    try {
      const [personas, total] =
        await this.personaJuridicaRepository.findAndCount({
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
        `Error al listar personas jurídicas. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Busca una persona jurídica mediante su NIT único.
   * Devuelve el registro encontrado o null si no existe.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorNit(
    dto: BuscarPersonaJuridicaDto,
  ): Promise<BuscarPersonaJuridicaResponse> {
    const persona = await this.personaJuridicaRepository.findOne({
      where: { nit: dto.nit },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!persona) {
      throw new NotFoundException(
        'No se encontró la persona jurídica solicitada.',
      );
    }

    return {
      encontrada: persona !== null,
      persona: persona ? mapearRespuesta(persona) : null,
    };
  }

  /**
   * Busca una persona jurídica mediante su identificador UUID.
   * Si no existe, genera una excepción de recurso no encontrado.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorId(id: string): Promise<PersonaJuridicaResponse> {
    const persona = await this.personaJuridicaRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!persona) {
      throw new NotFoundException(
        'No se encontró la persona jurídica solicitada.',
      );
    }

    return mapearRespuesta(persona);
  }

  /**
   * Actualiza la información de una persona jurídica existente.
   * Verifica su estado y la unicidad del NIT cuando este cambia.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async actualizar(
    id: string,
    dto: UpdatePersonaJuridicaDto,
    idUsuario: string,
  ): Promise<PersonaJuridicaMessageResponse> {
    const persona = await this.personaJuridicaRepository.findOne({
      where: { id: id },
    });

    if (!persona) {
      throw new NotFoundException(
        'No se encontró la persona jurídica solicitada.',
      );
    }

    if (persona.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar una persona jurídica inactiva.',
      );
    }

    if (dto.nit !== undefined && dto.nit !== persona.nit) {
      const existente = await this.personaJuridicaRepository.findOne({
        where: {
          nit: dto.nit,
          id: Not(id),
        },
      });

      if (existente) {
        throw new ConflictException(
          'Ya existe otra persona jurídica registrada con ese NIT.',
        );
      }
    }

    if (dto.nit !== undefined) persona.nit = dto.nit;
    if (dto.razon_social !== undefined) {
      persona.razon_social = dto.razon_social;
    }
    if (dto.domicilio !== undefined) persona.domicilio = dto.domicilio;
    if (dto.telefono !== undefined) persona.telefono = dto.telefono;
    if (dto.email !== undefined) persona.email = dto.email;

    persona._updated_at = new Date();
    persona._user_update = idUsuario;
    persona.usuario_actualizador = { idUsuario } as Usuario;

    try {
      await this.personaJuridicaRepository.save(persona);

      return {
        message: 'Persona jurídica actualizada correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe otra persona jurídica registrada con ese NIT.',
        );
      }

      this.logger.error(
        `Error al actualizar persona jurídica. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Alterna el estado de una persona jurídica entre ACTIVO e INACTIVO.
   * Actualiza los datos de auditoría y registra o limpia la información
   * correspondiente a la inactivación del registro.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<PersonaJuridicaMessageResponse> {
    const persona = await this.personaJuridicaRepository.findOne({
      where: { id: id },
    });

    if (!persona) {
      throw new NotFoundException(
        'No se encontró la persona jurídica solicitada.',
      );
    }

    const estadoAnterior = persona.estado;

    persona.estado = persona.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    persona._updated_at = new Date();
    persona._user_update = idUsuario;
    persona.usuario_actualizador = { idUsuario } as Usuario;

    if (persona.estado === 'INACTIVO') {
      persona._deleted_at = new Date();
      persona._user_delete = idUsuario;
      persona.usuario_eliminador = { idUsuario } as Usuario;
    } else {
      persona._deleted_at = null;
      persona._user_delete = null;
      persona.usuario_eliminador = null;
    }

    try {
      await this.personaJuridicaRepository.save(persona);

      return {
        message: `Registro de la Persona Juridica ${persona.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
      };
    } catch (error) {
      this.logger.error(
        `Error al cambiar estado de persona jurídica. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
