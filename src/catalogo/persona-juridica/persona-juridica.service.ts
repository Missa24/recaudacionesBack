/**
 * Módulo: Catálogos - Personas Jurídicas
 * Archivo: persona-juridica.service.ts
 * Descripción:
 * Contiene la lógica de negocio para el registro, consulta,
 * actualización y administración de personas jurídicas.
 *
 * Desarrollado por: Missael Apaza
 */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

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
 * Desarrollado por: Missael Apaza
 */
@Injectable()
export class PersonaJuridicaService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza
   */
  private readonly logger = new Logger(PersonaJuridicaService.name);

  /**
   * Inyecta el repositorio de personas jurídicas
   * para realizar las operaciones sobre la entidad.
   *
   * Desarrollado por: Missael Apaza
   */
  constructor(
    @InjectRepository(PersonaJuridica)
    private readonly personaJuridicaRepository: Repository<PersonaJuridica>,
  ) {}

  /**
   * Registra una nueva persona jurídica, verificando
   * que el NIT no se encuentre registrado previamente.
   *
   * Desarrollado por: Missael Apaza
   */
  async crear(
    dto: CreatePersonaJuridicaDto,
    idUsuario: string,
  ): Promise<PersonaJuridicaCreateResponse> {
    this.logger.log(
      `Iniciando creación de persona jurídica. NIT: ${dto.nit}, Razón social: ${dto.razon_social}, Usuario: ${idUsuario}`,
    );

    const existente = await this.personaJuridicaRepository.findOne({
      where: { nit: dto.nit },
    });

    if (existente) {
      this.logger.warn(
        `Conflicto al crear persona jurídica: ya existe registro con NIT ${dto.nit}`,
      );
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

      this.logger.log(
        `Persona jurídica creada exitosamente. ID: ${guardada.id}, NIT: ${guardada.nit}, Usuario: ${idUsuario}`,
      );

      return {
        message: 'Persona jurídica registrada exitosamente.',
        id: guardada.id,
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al crear persona jurídica. NIT: ${dto.nit}`,
        );
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
   * Desarrollado por: Missael Apaza
   */
  async listar(
    query: QueryPersonaJuridicaDto,
  ): Promise<PaginatedResponse<PersonaJuridicaResponse>> {
    this.logger.log(
      `Listando personas jurídicas. Página: ${query.page}, Límite: ${query.limit}, Search: ${query.search ?? 'N/A'}, Estado: ${query.status ?? 'ACTIVO'}, StartDate: ${query.startDate ?? 'N/A'}, EndDate: ${query.endDate ?? 'N/A'}`,
    );

    const {
      page,
      limit,
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query;

    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'persona._created_at',
      nit: 'persona.nit',
      razon_social: 'persona.razon_social',
    };

    const campoOrdenamiento =
      camposOrdenamiento[sortBy] ?? 'persona._created_at';

    const queryBuilder = this.personaJuridicaRepository
      .createQueryBuilder('persona')
      .leftJoinAndSelect('persona.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect(
        'persona.usuario_actualizador',
        'usuario_actualizador',
      );

    if (search) {
      this.logger.debug(`Aplicando filtro de búsqueda: "${search}"`);
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('persona.nit ILIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('persona.razon_social ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('persona.email ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    // Aplicar filtro de estado, mostrando activos por defecto.
    if (status && status !== 'TODOS') {
      this.logger.debug(`Aplicando filtro estado: ${status}`);
      queryBuilder.andWhere('persona.estado = :estado', {
        estado: status,
      });
    } else if (!status) {
      this.logger.debug('Aplicando filtro estado por defecto: ACTIVO');
      queryBuilder.andWhere('persona.estado = :estado', {
        estado: 'ACTIVO',
      });
    } else {
      this.logger.debug('Consultando personas juridicas de todos los estados');
    }

    if (startDate) {
      this.logger.debug(`Aplicando filtro startDate: ${startDate}`);
      queryBuilder.andWhere('persona._created_at >= :startDate', {
        startDate: `${startDate} 00:00:00`,
      });
    }

    if (endDate) {
      this.logger.debug(`Aplicando filtro endDate: ${endDate}`);
      queryBuilder.andWhere('persona._created_at <= :endDate', {
        endDate: `${endDate} 23:59:59.999`,
      });
    }

    try {
      const [personas, total] = await queryBuilder
        .orderBy(campoOrdenamiento, sortOrder ?? 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Listado de personas jurídicas obtenido. Total: ${total}, Página: ${page}/${totalPages || 1}, Items devueltos: ${personas.length}`,
      );

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
   * Desarrollado por: Missael Apaza
   */
  async buscarPorNit(
    dto: BuscarPersonaJuridicaDto,
  ): Promise<BuscarPersonaJuridicaResponse> {
    this.logger.log(`Buscando persona jurídica por NIT: ${dto.nit}`);

    const persona = await this.personaJuridicaRepository
      .createQueryBuilder('persona')
      .leftJoinAndSelect('persona.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect('persona.usuario_actualizador', 'usuario_actualizador')
      .where('persona.nit = :nit', { nit: dto.nit })
      .getOne();

    if (persona) {
      this.logger.log(
        `Persona jurídica encontrada por NIT: ${dto.nit}, ID: ${persona.id}`,
      );
    } else {
      this.logger.warn(
        `Persona jurídica no encontrada para el NIT: ${dto.nit}`,
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
   * Desarrollado por: Missael Apaza
   */
  async buscarPorId(id: string): Promise<PersonaJuridicaResponse> {
    this.logger.log(`Buscando persona jurídica por ID: ${id}`);

    const persona = await this.personaJuridicaRepository
      .createQueryBuilder('persona')
      .leftJoinAndSelect('persona.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect('persona.usuario_actualizador', 'usuario_actualizador')
      .where('persona.id = :id', { id })
      .getOne();

    if (!persona) {
      this.logger.warn(`Persona jurídica no encontrada con ID: ${id}`);
      throw new NotFoundException(
        'No se encontró la persona jurídica solicitada.',
      );
    }

    this.logger.log(`Persona jurídica encontrada. ID: ${id}`);
    return mapearRespuesta(persona);
  }

  /**
   * Actualiza la información de una persona jurídica existente.
   * Verifica su estado y la unicidad del NIT cuando este cambia.
   *
   * Desarrollado por: Missael Apaza
   */
  async actualizar(
    id: string,
    dto: UpdatePersonaJuridicaDto,
    idUsuario: string,
  ): Promise<PersonaJuridicaMessageResponse> {
    this.logger.log(
      `Iniciando actualización de persona jurídica. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const persona = await this.personaJuridicaRepository.findOne({
      where: { id: id },
    });

    if (!persona) {
      this.logger.warn(
        `No se encontró persona jurídica para actualizar. ID: ${id}`,
      );
      throw new NotFoundException(
        'No se encontró la persona jurídica solicitada.',
      );
    }

    if (persona.estado !== 'ACTIVO') {
      this.logger.warn(
        `Intento de actualización sobre persona jurídica inactiva. ID: ${id}, Estado: ${persona.estado}`,
      );
      throw new BadRequestException(
        'No se puede actualizar una persona jurídica inactiva.',
      );
    }

    if (dto.nit !== undefined && dto.nit !== persona.nit) {
      this.logger.debug(
        `Cambio de NIT detectado. Anterior: ${persona.nit}, Nuevo: ${dto.nit}`,
      );

      const existente = await this.personaJuridicaRepository
        .createQueryBuilder('persona')
        .where('persona.nit = :nit', { nit: dto.nit })
        .andWhere('persona.id != :id', { id })
        .getOne();

      if (existente) {
        this.logger.warn(
          `Conflicto al actualizar NIT: ya existe otra persona jurídica con NIT ${dto.nit}. ID actual: ${id}`,
        );
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

      this.logger.log(
        `Persona jurídica actualizada correctamente. ID: ${id}, NIT: ${persona.nit}, Usuario: ${idUsuario}`,
      );

      return {
        message: 'Persona jurídica actualizada correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al actualizar persona jurídica. ID: ${id}, NIT: ${dto.nit ?? persona.nit}`,
        );
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
   * Desarrollado por: Missael Apaza
   */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<PersonaJuridicaMessageResponse> {
    this.logger.log(
      `Iniciando cambio de estado de persona jurídica. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const persona = await this.personaJuridicaRepository.findOne({
      where: { id: id },
    });

    if (!persona) {
      this.logger.warn(
        `No se encontró persona jurídica para cambiar estado. ID: ${id}`,
      );
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

      this.logger.log(
        `Estado de persona jurídica cambiado correctamente. ID: ${id}, Estado anterior: ${estadoAnterior}, Estado nuevo: ${persona.estado}, Usuario: ${idUsuario}`,
      );

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
