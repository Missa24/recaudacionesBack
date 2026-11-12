/**
 * Módulo: Seguridad - Módulo
 * Archivo: modulo.service.ts
 *
 * Descripción:
 * Contiene la lógica de negocio para administrar los módulos
 * funcionales del sistema, incluyendo creación, consulta,
 * actualización, paginación y cambios de estado.
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
import { IsNull, Repository } from 'typeorm';

import { Modulo } from './entities/modulo.entity';

import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { QueryModuloDto } from './dto/query-modulo.dto';

import { mapearRespuesta } from './util/map-response-modulo.util';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import {
  ModuloMessageResponse,
  ModuloResponse,
} from './interfaces/modulo-response.interface';

@Injectable()
export class ModuloService {
  private readonly logger = new Logger(ModuloService.name);

  constructor(
    @InjectRepository(Modulo)
    private readonly moduloRepository: Repository<Modulo>,
  ) {}

  /*
  Nombre del método: crear
  Descripción: Registra un nuevo módulo y asocia al usuario creador.
  */

  async crear(
    dto: CreateModuloDto,
    idUsuario: string,
  ): Promise<ModuloMessageResponse> {
    const codigo = dto.codigo.trim();

    const existe = await this.moduloRepository.findOne({
      where: { codigo },
    });

    if (existe) {
      throw new ConflictException(
        'Ya existe un módulo registrado con ese código',
      );
    }

    const modulo = this.moduloRepository.create({
      ...dto,
      codigo,
      usuario_creador: { id: idUsuario },
    });

    try {
      await this.moduloRepository.save(modulo);

      return {
        message: 'Módulo registrado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe un módulo registrado con ese código',
        );
      }

      this.logger.error(
        `Error al crear módulo. Código: ${codigo}, Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('No se pudo registrar el módulo');
    }
  }

  /*
  Nombre del método: listar
  Descripción: Obtiene los módulos aplicando búsqueda,
               filtros, ordenamiento y paginación.
  */

  async listar(
    query: QueryModuloDto,
  ): Promise<PaginatedResponse<ModuloResponse>> {
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
      nombre: 'nombre',
      codigo: 'codigo',
      ruta: 'ruta',
      estado: 'estado',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido',
      );
    }

    try {
      const queryBuilder = this.moduloRepository
        .createQueryBuilder('modulo')
        .leftJoinAndSelect('modulo.usuario_creador', 'creador')
        .leftJoinAndSelect('modulo.usuario_actualizador', 'actualizador');

      if (status && status !== 'TODOS') {
        queryBuilder.andWhere('modulo.estado = :status', {
          status,
        });
      } else if (!status) {
        queryBuilder.andWhere("modulo.estado = 'ACTIVO'");
      }

      if (search) {
        queryBuilder.andWhere(
          `(
            modulo.nombre ILIKE :search OR
            modulo.codigo ILIKE :search OR
            modulo.descripcion ILIKE :search OR
            modulo.ruta ILIKE :search
          )`,
          {
            search: `%${search}%`,
          },
        );
      }

      const [registros, total] = await queryBuilder
        .orderBy(`modulo.${campoOrdenamiento}`, sortOrder)
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

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
        `Error al listar módulos. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /*
  Nombre del método: buscarPorId
  Descripción: Busca un módulo por su identificador UUID.
  */

  async buscarPorId(id: string): Promise<ModuloResponse> {
    const modulo = await this.moduloRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!modulo) {
      throw new NotFoundException('No existe un módulo con ese identificador');
    }

    return mapearRespuesta(modulo);
  }

  /*
  Nombre del método: actualizar
  Descripción: Actualiza parcialmente un módulo existente.
               Verifica códigos duplicados y registra auditoría.
  */

  async actualizar(
    id: string,
    dto: UpdateModuloDto,
    idUsuario: string,
  ): Promise<ModuloMessageResponse> {
    const modulo = await this.moduloRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!modulo) {
      throw new NotFoundException(
        'No existe un módulo activo con ese identificador',
      );
    }

    if (modulo.estado !== 'ACTIVO') {
      throw new ConflictException('No se puede actualizar un módulo inactivo');
    }

    const codigo = dto.codigo?.trim();

    if (codigo && codigo !== modulo.codigo) {
      const existe = await this.moduloRepository.findOne({
        where: { codigo },
      });

      if (existe) {
        throw new ConflictException(
          'Ya existe otro módulo registrado con ese código',
        );
      }
    }

    Object.assign(modulo, {
      ...dto,
      ...(codigo ? { codigo } : {}),
    });

    modulo._user_update = idUsuario;
    modulo.updatedAt = new Date();

    try {
      await this.moduloRepository.save(modulo);

      return {
        message: 'Módulo actualizado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe otro módulo registrado con ese código',
        );
      }

      this.logger.error(
        `Error al actualizar módulo. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('No se pudo actualizar el módulo');
    }
  }

  /*
  Nombre del método: cambiarEstado
  Descripción: Alterna el estado del módulo entre ACTIVO e INACTIVO.
               Al desactivar registra la eliminación lógica y al
               reactivar limpia los datos correspondientes.
  */

  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<ModuloMessageResponse> {
    const modulo = await this.moduloRepository.findOne({
      where: { id },
    });

    if (!modulo) {
      throw new NotFoundException('No existe un módulo con ese identificador');
    }

    const nuevoEstado = modulo.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    modulo.estado = nuevoEstado;

    if (nuevoEstado === 'INACTIVO') {
      modulo._user_delete = idUsuario;
      modulo.deletedAt = new Date();
      modulo._user_update = null;
      modulo.updatedAt = new Date();
    } else {
      modulo._user_update = idUsuario;
      modulo.updatedAt = new Date();
      modulo._user_delete = null;
      modulo.deletedAt = null;
    }

    try {
      await this.moduloRepository.save(modulo);

      return {
        message: `Módulo ${nuevoEstado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente`,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar estado del módulo. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del módulo',
      );
    }
  }

  async validarModulo(id: string): Promise<Modulo> {
    const modulo = await this.moduloRepository.findOne({
      where: {
        id,
        estado: 'ACTIVO',
        deletedAt: IsNull(),
      },
    });

    if (!modulo) {
      throw new NotFoundException(
        'El módulo no existe, está inactivo o fue eliminado',
      );
    }

    return modulo;
  }
  async obtenerModulosActivos(): Promise<Modulo[]> {
    return this.moduloRepository.find({
      where: {
        estado: 'ACTIVO',
        deletedAt: IsNull(),
      },
      order: {
        nombre: 'ASC',
      },
    });
  }
}
