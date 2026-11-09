/**
 * Módulo: Catálogos - Personas Naturales
 * Archivo: persona-natural.service.ts
 * Descripción:
 * Contiene la lógica de negocio para el registro, consulta,
 * actualización y administración de personas naturales.
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
 * Desarrollado por: Missael Apaza
 */
@Injectable()
export class PersonaNaturalService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza
   */
  private readonly logger = new Logger(PersonaNaturalService.name);

  /**
   * Inyecta el repositorio de personas naturales
   * para realizar las operaciones sobre la entidad.
   *
   * Desarrollado por: Missael Apaza
   */
  constructor(
    @InjectRepository(PersonaNatural)
    private readonly personaNaturalRepository: Repository<PersonaNatural>,
  ) {}

  /**
   * Registra una nueva persona natural, verificando
   * la existencia de sus datos documentales y la validez
   * de su fecha de nacimiento.
   *
   * Desarrollado por: Missael Apaza
   */
  async crear(
    dto: CreatePersonaNaturalDto,
    id_usuario: string,
  ): Promise<PersonaNaturalCreateResponse> {
    this.logger.log(
      `Iniciando creación de persona natural. Tipo: ${dto.tipo_documento}, Número: ${dto.numero_documento}, Usuario: ${id_usuario}`,
    );

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
      this.logger.warn(
        `Conflicto al crear persona natural: ya existe registro con Tipo: ${dto.tipo_documento}, Número: ${dto.numero_documento}, Complemento: ${complemento}, Expedido: ${expedido}`,
      );
      throw new ConflictException(
        'Ya existe una persona registrada con esos datos documentales.',
      );
    }

    if (
      dto.fecha_nacimiento &&
      dto.fecha_nacimiento > new Date().toISOString().slice(0, 10)
    ) {
      this.logger.warn(
        `Fecha de nacimiento inválida al crear persona natural: ${dto.fecha_nacimiento}`,
      );
      throw new BadRequestException(
        'La fecha de nacimiento no puede ser posterior a la fecha actual.',
      );
    }

    const persona = this.personaNaturalRepository.create({
      ...dto,
      complemento,
      expedido,
      estado: 'ACTIVO',
      _created_at: new Date(),
      _updated_at: new Date(),
      _user_created: id_usuario,
      usuario_creador: { id_usuario } as Usuario,
    });

    try {
      const guardada = await this.personaNaturalRepository.save(persona);

      this.logger.log(
        `Persona natural creada exitosamente. ID: ${guardada.id}, Usuario: ${id_usuario}`,
      );

      return {
        message: 'Persona registrada exitosamente',
        id: guardada.id,
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al crear persona natural. Tipo: ${dto.tipo_documento}, Número: ${dto.numero_documento}`,
        );
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

  /**
   * Obtiene el listado paginado de personas naturales
   * aplicando filtros de búsqueda, estado y fechas,
   * además de los criterios de ordenamiento.
   *
   * Desarrollado por: Missael Apaza
   */
  async listar(
    query: QueryPersonaNaturalDto,
  ): Promise<PaginatedResponse<PersonaNaturalResponse>> {
    this.logger.log(
      `Listando personas naturales. Página: ${query.page}, Límite: ${query.limit}, Search: ${query.search ?? 'N/A'}, Tipo: ${query.tipo_documento ?? 'N/A'}, Estado: ${query.status ?? 'ACTIVO'}`,
    );

    const {
      page,
      limit,
      search,
      tipo_documento,
      status,
      estado_civil,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query;

    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'persona._created_at',
      nombres: 'persona.nombres',
      numero_documento: 'persona.numero_documento',
      fecha_nacimiento: 'persona.fecha_nacimiento',
    };

    const campoOrdenamiento =
      camposOrdenamiento[sortBy] ?? 'persona._created_at';

    const queryBuilder = this.personaNaturalRepository
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
          qb.where('persona.nombres ILIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('persona.apellido_paterno ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('persona.apellido_materno ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('persona.numero_documento ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('persona.email ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    if (tipo_documento) {
      this.logger.debug(`Aplicando filtro tipo_documento: ${tipo_documento}`);
      queryBuilder.andWhere('persona.tipo_documento = :tipo_documento', {
        tipo_documento,
      });
    }

    queryBuilder.andWhere('persona.estado = :estado', {
      estado: status ?? 'ACTIVO',
    });

    if (estado_civil) {
      this.logger.debug(`Aplicando filtro estado_civil: ${estado_civil}`);
      queryBuilder.andWhere('persona.estado_civil = :estado_civil', {
        estado_civil,
      });
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
        `Listado de personas naturales obtenido. Total: ${total}, Página: ${page}/${totalPages || 1}, Items devueltos: ${personas.length}`,
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
        `Error al listar personas naturales. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Busca personas naturales mediante sus datos documentales.
   * El tipo y número de documento son obligatorios, mientras que
   * el complemento y lugar de expedición funcionan como filtros opcionales.
   *
   * Desarrollado por: Missael Apaza
   */
  async buscarPorDocumento(
    dto: BuscarPersonaNaturalDto,
  ): Promise<BuscarPersonaNaturalResponse> {
    this.logger.log(
      `Buscando persona natural por documento. Tipo: ${dto.tipo_documento}, Número: ${dto.numero_documento}, Complemento: ${dto.complemento ?? 'N/A'}, Expedido: ${dto.expedido ?? 'N/A'}`,
    );

    const queryBuilder = this.personaNaturalRepository
      .createQueryBuilder('persona')
      .leftJoinAndSelect('persona.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect('persona.usuario_actualizador', 'usuario_actualizador')
      .where('persona.tipo_documento = :tipo_documento', {
        tipo_documento: dto.tipo_documento,
      })
      .andWhere('persona.numero_documento = :numero_documento', {
        numero_documento: dto.numero_documento,
      });

    if (dto.complemento !== undefined) {
      queryBuilder.andWhere('persona.complemento = :complemento', {
        complemento: dto.complemento,
      });
    }

    if (dto.expedido !== undefined) {
      queryBuilder.andWhere('persona.expedido = :expedido', {
        expedido: dto.expedido,
      });
    }

    try {
      const personas = await queryBuilder.getMany();

      this.logger.log(
        `Búsqueda por documento finalizada. Tipo: ${dto.tipo_documento}, Número: ${dto.numero_documento}, Resultados: ${personas.length}`,
      );

      return {
        encontrada: personas.length > 0,
        persona: personas.map((persona) => mapearRespuesta(persona)),
      };
    } catch (error) {
      this.logger.error(
        `Error al buscar persona natural por documento. Tipo: ${dto.tipo_documento}, Número: ${dto.numero_documento}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Busca una persona natural mediante su identificador UUID.
   * Si no existe un registro con el identificador proporcionado,
   * genera una excepción de recurso no encontrado.
   *
   * Desarrollado por: Missael Apaza
   */
  async buscarPorId(id: string): Promise<PersonaNaturalResponse> {
    this.logger.log(`Buscando persona natural por ID: ${id}`);

    const persona = await this.personaNaturalRepository
      .createQueryBuilder('persona')
      .leftJoinAndSelect('persona.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect('persona.usuario_actualizador', 'usuario_actualizador')
      .where('persona.id = :id', { id })
      .getOne();

    if (!persona) {
      this.logger.warn(`Persona natural no encontrada con ID: ${id}`);
      throw new NotFoundException(
        'No se encontró la persona natural solicitada.',
      );
    }

    this.logger.log(`Persona natural encontrada. ID: ${id}`);
    return mapearRespuesta(persona);
  }

  /**
   * Actualiza la información de una persona natural existente.
   * Verifica su estado, la fecha de nacimiento y la unicidad
   * de los datos documentales cuando estos son modificados.
   *
   * Desarrollado por: Missael Apaza
   */
  async actualizar(
    id: string,
    dto: UpdatePersonaNaturalDto,
    id_usuario: string,
  ): Promise<PersonaNaturalMessageResponse> {
    this.logger.log(
      `Iniciando actualización de persona natural. ID: ${id}, Usuario: ${id_usuario}`,
    );

    const persona = await this.personaNaturalRepository.findOne({
      where: { id: id },
    });

    if (!persona) {
      this.logger.warn(
        `No se encontró persona natural para actualizar. ID: ${id}`,
      );
      throw new NotFoundException(
        'No se encontró la persona natural solicitada.',
      );
    }

    if (persona.estado !== 'ACTIVO') {
      this.logger.warn(
        `Intento de actualización sobre persona inactiva. ID: ${id}, Estado: ${persona.estado}`,
      );
      throw new BadRequestException(
        'No se puede actualizar una persona inactiva.',
      );
    }

    const fechaNacimiento = dto.fecha_nacimiento ?? persona.fecha_nacimiento;

    if (
      fechaNacimiento &&
      fechaNacimiento > new Date().toISOString().slice(0, 10)
    ) {
      this.logger.warn(
        `Fecha de nacimiento inválida al actualizar persona natural. ID: ${id}, Fecha: ${fechaNacimiento}`,
      );
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
      this.logger.debug(
        `Se detectó cambio en datos documentales. Validando unicidad para ID: ${id}`,
      );

      const identidad = {
        tipo_documento: dto.tipo_documento ?? persona.tipo_documento,
        numero_documento: dto.numero_documento ?? persona.numero_documento,
        complemento: dto.complemento ?? persona.complemento,
        expedido: dto.expedido ?? persona.expedido,
      };

      const existente = await this.personaNaturalRepository
        .createQueryBuilder('persona')
        .where('persona.tipo_documento = :tipo_documento', {
          tipo_documento: identidad.tipo_documento,
        })
        .andWhere('persona.numero_documento = :numero_documento', {
          numero_documento: identidad.numero_documento,
        })
        .andWhere('persona.complemento = :complemento', {
          complemento: identidad.complemento,
        })
        .andWhere('persona.expedido = :expedido', {
          expedido: identidad.expedido,
        })
        .andWhere('persona.id != :id', { id })
        .getOne();

      if (existente) {
        this.logger.warn(
          `Conflicto al actualizar: ya existe otra persona con los mismos datos documentales. ID: ${id}, Tipo: ${identidad.tipo_documento}, Número: ${identidad.numero_documento}`,
        );
        throw new ConflictException(
          'Ya existe otra persona registrada con esos datos documentales.',
        );
      }
    }

    Object.assign(persona, dto);
    persona._updated_at = new Date();
    persona._user_update = id_usuario;
    persona.usuario_actualizador = { id_usuario } as Usuario;

    try {
      await this.personaNaturalRepository.save(persona);

      this.logger.log(
        `Persona natural actualizada correctamente. ID: ${id}, Usuario: ${id_usuario}`,
      );

      return {
        message: 'Persona natural actualizada correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al actualizar persona natural. ID: ${id}`,
        );
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

  /**
   * Alterna el estado de una persona natural entre ACTIVO e INACTIVO.
   * Actualiza los datos de auditoría y registra o limpia la información
   * correspondiente a la inactivación del registro.
   *
   * Desarrollado por: Missael Apaza
   */
  async cambiarEstado(
    id: string,
    id_usuario: string,
  ): Promise<PersonaNaturalMessageResponse> {
    this.logger.log(
      `Iniciando cambio de estado de persona natural. ID: ${id}, Usuario: ${id_usuario}`,
    );

    const persona = await this.personaNaturalRepository.findOne({
      where: { id: id },
    });

    if (!persona) {
      this.logger.warn(
        `No se encontró persona natural para cambiar estado. ID: ${id}`,
      );
      throw new NotFoundException(
        'No se encontró la persona natural solicitada.',
      );
    }

    const estadoAnterior = persona.estado;
    persona.estado = persona.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    persona._updated_at = new Date();
    persona._user_update = id_usuario;
    persona.usuario_actualizador = { id_usuario } as Usuario;

    if (persona.estado === 'INACTIVO') {
      persona._deleted_at = new Date();
      persona._user_delete = id_usuario;
      persona.usuario_eliminador = { id_usuario } as Usuario;
    } else {
      persona._deleted_at = null;
      persona._user_delete = null;
      persona.usuario_eliminador = null;
    }

    try {
      await this.personaNaturalRepository.save(persona);

      this.logger.log(
        `Estado de persona natural cambiado correctamente. ID: ${id}, Estado anterior: ${estadoAnterior}, Estado nuevo: ${persona.estado}, Usuario: ${id_usuario}`,
      );

      return {
        message: `Persona natural ${persona.estado === 'ACTIVO' ? 'activada' : 'inactivada'} correctamente.`,
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
