/**
 * Módulo: Seguridad - Usuario
 * Archivo: usuario.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de usuarios.
 * Permite registrar, consultar, actualizar y cambiar el estado
 * de los usuarios, incluyendo el control de auditoría.
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
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';

import { Usuario } from './entities/usuario.entity';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { QueryUsuarioDto } from './dto/query-usuario.dto';

import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';

import { mapearRespuesta } from './util/map-response-usuario.util';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import {
  UsuarioMessageResponse,
  UsuarioResponse,
} from './interfaces/usuario-response.interface';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * Registra un nuevo usuario.
   */
  async crear(
    dto: CreateUsuarioDto,
    idUsuario: string,
  ): Promise<UsuarioMessageResponse> {
    const existe = await this.usuarioRepository.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });

    if (existe) {
      throw new ConflictException(
        'El nombre de usuario o correo electrónico ya se encuentra registrado',
      );
    }

    const usuario = this.usuarioRepository.create({
      ...dto,
      usuario_creador: { id: idUsuario },
    });

    try {
      await this.usuarioRepository.save(usuario);

      return {
        message: 'Usuario registrado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'El nombre de usuario o correo electrónico ya se encuentra registrado',
        );
      }

      this.logger.error(
        `Error al crear usuario. Usuario creador: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('No se pudo registrar el usuario');
    }
  }

  /**
   * Lista usuarios aplicando filtros y paginación.
   */

  async listar(
    query: QueryUsuarioDto,
  ): Promise<PaginatedResponse<UsuarioResponse>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      status,
      search,
    } = query;

    const camposOrdenamiento: Record<string, keyof Usuario> = {
      createdAt: 'createdAt',
      username: 'username',
      email: 'email',
      nombres: 'nombres',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido',
      );
    }

    // Filtros base
    const where: FindOptionsWhere<Usuario> = {
      deletedAt: IsNull(),
    };

    // Filtro por estado
    if (status && status !== 'TODOS') {
      where.estado = status;
    } else if (!status) {
      where.estado = 'ACTIVO';
    }

    // Filtro de búsqueda
    if (search) {
      Object.assign(where, [
        {
          ...where,
          username: ILike(`%${search}%`),
        },
        {
          ...where,
          email: ILike(`%${search}%`),
        },
        {
          ...where,
          nombres: ILike(`%${search}%`),
        },
        {
          ...where,
          ci: ILike(`%${search}%`),
        },
      ]);
    }

    // Consulta ORM
    const [registros, total] = await this.usuarioRepository.findAndCount({
      where,
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
      order: {
        [campoOrdenamiento]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Mapear respuesta
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
  }

  /**
   * Busca un usuario mediante su identificador.
   */
  async buscarPorId(id: string): Promise<UsuarioResponse> {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('No existe un usuario con ese identificador');
    }

    return mapearRespuesta(usuario);
  }

  /**
   * Busca un usuario mediante su username.
   */
  async buscarPorUsername(username: string): Promise<UsuarioResponse> {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        username,
        estado: 'ACTIVO',
        deletedAt: IsNull(),
      },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(
        'No existe un usuario activo con ese nombre de usuario',
      );
    }

    return mapearRespuesta(usuario);
  }

  /**
   * Actualiza los datos de un usuario.
   */
  async actualizar(
    id: string,
    dto: UpdateUsuarioDto,
    idUsuario: string,
  ): Promise<UsuarioMessageResponse> {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!usuario) {
      throw new NotFoundException('No existe un usuario con ese identificador');
    }

    if (usuario.estado !== 'ACTIVO') {
      throw new ConflictException('No se puede actualizar un usuario inactivo');
    }

    if (dto.username && dto.username !== usuario.username) {
      const existeUsername = await this.usuarioRepository.findOne({
        where: { username: dto.username },
      });

      if (existeUsername) {
        throw new ConflictException(
          'El nombre de usuario ya se encuentra registrado',
        );
      }
    }

    if (dto.email && dto.email !== usuario.email) {
      const existeEmail = await this.usuarioRepository.findOne({
        where: { email: dto.email },
      });

      if (existeEmail) {
        throw new ConflictException(
          'El correo electrónico ya se encuentra registrado',
        );
      }
    }

    Object.assign(usuario, dto);

    usuario._user_update = idUsuario;

    try {
      await this.usuarioRepository.save(usuario);

      return {
        message: 'Usuario actualizado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'El nombre de usuario o correo electrónico ya se encuentra registrado',
        );
      }

      this.logger.error(
        `Error al actualizar usuario. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo actualizar el usuario',
      );
    }
  }

  /**
   * Cambia el estado de un usuario.
   */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<UsuarioMessageResponse> {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!usuario) {
      throw new NotFoundException('No existe un usuario con ese identificador');
    }

    const nuevoEstado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    usuario.estado = nuevoEstado;

    if (nuevoEstado === 'INACTIVO') {
      usuario._user_delete = idUsuario;
      usuario.deletedAt = new Date();
      usuario._user_update = null;
    } else {
      usuario._user_delete = null;
      usuario.deletedAt = null;
      usuario._user_update = idUsuario;
    }

    try {
      await this.usuarioRepository.save(usuario);

      return {
        message: `Usuario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente`,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar estado del usuario. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del usuario',
      );
    }
  }

  async validarUsuario(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('No existe un usuario con ese identificador');
    }

    if (usuario.estado !== 'ACTIVO' || usuario.deletedAt) {
      throw new ConflictException(
        'No se puede asignar un rol a un usuario inactivo',
      );
    }

    return usuario;
  }
}
