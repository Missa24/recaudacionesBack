/**
 * Módulo: Seguridad - Permiso
 * Archivo: permiso.service.ts
 * Descripción:
 * Contiene la lógica de negocio para administrar los permisos
 * del sistema, incluyendo registro, consulta, actualización
 * y cambios de estado con auditoría.
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
import { FindOptionsWhere, In, IsNull, Repository } from 'typeorm';

import { Permiso } from './entities/permiso.entity';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { QueryPermisoDto } from './dto/query-permiso.dto';

import { mapearRespuesta } from './util/map-response-permiso.util';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import {
  PermisoMessageResponse,
  PermisoResponse,
} from './interfaces/permiso-response.interface';

@Injectable()
export class PermisoService {
  private readonly logger = new Logger(PermisoService.name);

  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
  ) {}

  /*
  Nombre del método: crear
  Descripción: Registra un nuevo permiso y asocia al usuario creador.
  Parámetros:
    - dto: CreatePermisoDto.
    - idUsuario: Usuario responsable de la creación.
  Respuestas:
    - 201: Permiso registrado correctamente.
    - 409: El código ya se encuentra registrado.
    - 500: Error al guardar.
  */

  async crear(
    dto: CreatePermisoDto,
    idUsuario: string,
  ): Promise<PermisoMessageResponse> {
    const codigo = dto.codigo.trim().toUpperCase();

    const existe = await this.permisoRepository.findOne({
      where: { codigo },
    });

    if (existe) {
      throw new ConflictException(
        'Ya existe un permiso registrado con ese código',
      );
    }

    const permiso = this.permisoRepository.create({
      codigo,
      descripcion: dto.descripcion.trim(),
      usuario_creador: { id: idUsuario },
    });

    try {
      await this.permisoRepository.save(permiso);

      return {
        message: 'Permiso registrado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe un permiso registrado con ese código',
        );
      }

      this.logger.error(
        `Error al crear permiso. Código: ${codigo}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('No se pudo registrar el permiso');
    }
  }

  /*
  Nombre del método: listar
  Descripción: Obtiene los permisos aplicando búsqueda,
               filtros, ordenamiento y paginación.
  Parámetros:
    - query: QueryPermisoDto.
  Respuestas:
    - 200: Listado paginado.
    - 400: Campo de ordenamiento inválido.
  */

  async listar(
    query: QueryPermisoDto,
  ): Promise<PaginatedResponse<PermisoResponse>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      status,
      search,
    } = query;

    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'createdAt',
      codigo: 'codigo',
      descripcion: 'descripcion',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido',
      );
    }

    const where: FindOptionsWhere<Permiso> = {
      deletedAt: IsNull(),
    };

    if (status && status !== 'TODOS') {
      where.estado = status;
    } else if (!status) {
      where.estado = 'ACTIVO';
    }

    const skip = (page - 1) * limit;

    try {
      let registros: Permiso[];
      let total: number;

      if (search) {
        const resultado = await this.permisoRepository
          .createQueryBuilder('permiso')
          .leftJoinAndSelect('permiso.usuario_creador', 'creador')
          .leftJoinAndSelect('permiso.usuario_actualizador', 'actualizador')
          .where('permiso.deletedAt IS NULL')
          .andWhere(
            status && status !== 'TODOS'
              ? 'permiso.estado = :status'
              : !status
                ? "permiso.estado = 'ACTIVO'"
                : '1 = 1',
            { status },
          )
          .andWhere(
            `(
              permiso.codigo ILIKE :search OR
              permiso.descripcion ILIKE :search
            )`,
            { search: `%${search}%` },
          )
          .orderBy(`permiso.${campoOrdenamiento}`, sortOrder)
          .skip(skip)
          .take(limit)
          .getManyAndCount();

        [registros, total] = resultado;
      } else {
        [registros, total] = await this.permisoRepository.findAndCount({
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
      }

      const items = registros.map((registro) => mapearRespuesta(registro));

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
    } catch (error: unknown) {
      this.logger.error(
        `Error al listar permisos. Página: ${page}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /*
  Nombre del método: buscarPorId
  Descripción: Busca un permiso por su identificador UUID.
  */

  async buscarPorId(id: string): Promise<PermisoResponse> {
    const permiso = await this.permisoRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!permiso) {
      throw new NotFoundException('No existe un permiso con ese identificador');
    }

    return mapearRespuesta(permiso);
  }

  /*
  Nombre del método: actualizar
  Descripción: Actualiza parcialmente un permiso activo.
               Registra el usuario y fecha de actualización.
  */

  async actualizar(
    id: string,
    dto: UpdatePermisoDto,
    idUsuario: string,
  ): Promise<PermisoMessageResponse> {
    const permiso = await this.permisoRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!permiso) {
      throw new NotFoundException('No existe un permiso con ese identificador');
    }

    if (permiso.estado !== 'ACTIVO') {
      throw new ConflictException('No se puede actualizar un permiso inactivo');
    }

    if (dto.codigo !== undefined) {
      const codigo = dto.codigo.trim().toUpperCase();

      if (codigo !== permiso.codigo) {
        const codigoDuplicado = await this.permisoRepository.findOne({
          where: { codigo },
        });

        if (codigoDuplicado) {
          throw new ConflictException(
            'Ya existe otro permiso registrado con ese código',
          );
        }
      }

      permiso.codigo = codigo;
    }

    if (dto.descripcion !== undefined) {
      permiso.descripcion = dto.descripcion.trim();
    }

    permiso._user_update = idUsuario;
    permiso.updatedAt = new Date();

    try {
      await this.permisoRepository.save(permiso);

      return {
        message: 'Permiso actualizado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe otro permiso registrado con ese código',
        );
      }

      this.logger.error(
        `Error al actualizar permiso. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo actualizar el permiso',
      );
    }
  }

  /*
  Nombre del método: cambiarEstado
  Descripción: Alterna el estado del permiso entre ACTIVO e INACTIVO.
               Al desactivar registra eliminación lógica y auditoría.
               Al reactivar limpia los datos de eliminación.
  */

  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<PermisoMessageResponse> {
    const permiso = await this.permisoRepository.findOne({
      where: { id },
    });

    if (!permiso) {
      throw new NotFoundException('No existe un permiso con ese identificador');
    }

    const nuevoEstado = permiso.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    permiso.estado = nuevoEstado;

    if (nuevoEstado === 'INACTIVO') {
      permiso._user_delete = idUsuario;
      permiso.deletedAt = new Date();
      permiso._user_update = null;
    } else {
      permiso._user_update = idUsuario;
      permiso._user_delete = null;
      permiso.deletedAt = null;
    }

    try {
      await this.permisoRepository.save(permiso);

      return {
        message: `Permiso ${nuevoEstado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente`,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar estado del permiso. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del permiso',
      );
    }
  }
  async validarPermisos(ids: string[]): Promise<Permiso[]> {
    const idsUnicos = [...new Set(ids)];

    const permisos = await this.permisoRepository.find({
      where: {
        id: In(idsUnicos),
        estado: 'ACTIVO',
        deletedAt: IsNull(),
      },
    });

    if (permisos.length !== idsUnicos.length) {
      throw new NotFoundException(
        'Uno o varios permisos no existen, están inactivos o fueron eliminados',
      );
    }

    return permisos;
  }
  async obtenerPermisosActivos(): Promise<Permiso[]> {
    return this.permisoRepository.find({
      where: {
        estado: 'ACTIVO',
        deletedAt: IsNull(),
      },
      order: {
        codigo: 'ASC',
      },
    });
  }
}
