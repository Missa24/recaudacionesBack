/**
 * Módulo: Seguridad - UsuarioRol
 * Archivo: usuario-rol.service.ts
 * Descripción:
 * Contiene la lógica de negocio para administrar las asignaciones
 * de roles a usuarios. Gestiona creación, consultas, actualizaciones
 * y cambios de estado, incluyendo validaciones y auditoría.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
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

import { FindOptionsWhere, ILike, In, IsNull, Not, Repository } from 'typeorm';

import { UsuarioRol } from './entities/usuario-rol.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Rol } from '../rol/entities/rol.entity';

import { CreateUsuarioRolDto } from './dto/create-usuario-rol.dto';
import { UpdateUsuarioRolDto } from './dto/update-usuario-rol.dto';
import { QueryUsuarioRolDto } from './dto/query-usuario-rol.dto';

import {
  UsuarioRolResponse,
  UsuarioRolMessageResponse,
  UsuarioRolesResponse,
  RolUsuariosResponse,
} from './interface/usuario-rol-response.interface';

import { mapearRespuesta } from './util/map-response-usuario-rol.util';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { AsignarVariosUsuarioRolDto } from './dto/crear-varios-usuario-rol.dto';
import { DesactivarVariosUsuarioRolDto } from './dto/desactivar-varios-usuario-rol.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { RolService } from '../rol/rol.service';

/**
 * Servicio: UsuarioRolService
 * Descripción:
 * Implementa las operaciones de negocio para administrar
 * las asignaciones de roles a usuarios mediante TypeORM FULL ORM.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
@Injectable()
export class UsuarioRolService {
  private readonly logger = new Logger(UsuarioRolService.name);

  constructor(
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,

    private readonly usuarioService: UsuarioService,
    private readonly rolService: RolService,
  ) {}

  /*
  Nombre del método: crear
  Descripción: Asigna un rol a un usuario. Verifica la existencia
               y estado de ambas entidades. Si ya existe una asignación
               eliminada lógicamente, la reactiva.
  Parámetros:
    - dto: CreateUsuarioRolDto (usuario_id, rol_id)
    - idUsuario: string (usuario que realiza la asignación)
  Respuestas posibles:
    - 201: Asignación registrada correctamente.
    - 404: Usuario o rol no encontrado.
    - 409: Asignación duplicada o entidad inactiva.
    - 500: No se pudo guardar la asignación.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async crear(
    dto: CreateUsuarioRolDto,
    idUsuario: string,
  ): Promise<UsuarioRolMessageResponse> {
    await this.usuarioService.validarUsuario(dto.usuario_id);
    await this.rolService.validarRol(dto.rol_id);

    // Busca cualquier asignación previa, incluso eliminada.
    const existente = await this.usuarioRolRepository.findOne({
      where: {
        usuario_id: dto.usuario_id,
        rol_id: dto.rol_id,
      },
    });

    if (existente) {
      // No permite duplicar una asignación activa.
      if (existente.estado === 'ACTIVO' && !existente.deletedAt) {
        throw new ConflictException('El usuario ya tiene asignado este rol');
      }

      // Reactiva la asignación anterior.
      existente.estado = 'ACTIVO';
      existente.deletedAt = null;
      existente._user_delete = null;
      existente._user_update = idUsuario;

      try {
        await this.usuarioRolRepository.save(existente);

        return {
          message: 'Asignación de rol reactivada correctamente',
        };
      } catch (error: unknown) {
        this.logger.error(
          `Error al reactivar asignación. ID: ${existente.id}`,
          error instanceof Error ? error.stack : String(error),
        );

        throw new InternalServerErrorException(
          'No se pudo reactivar la asignación',
        );
      }
    }

    const asignacion = this.usuarioRolRepository.create({
      usuario_id: dto.usuario_id,
      rol_id: dto.rol_id,
      estado: 'ACTIVO',
      usuario: { id: dto.usuario_id },
      rol: { id: dto.rol_id },
      usuario_creador: { id: idUsuario },
    });

    try {
      await this.usuarioRolRepository.save(asignacion);

      return {
        message: 'Rol asignado al usuario correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException('El usuario ya tiene asignado este rol');
      }

      this.logger.error(
        `Error al asignar rol. Usuario: ${dto.usuario_id}, Rol: ${dto.rol_id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo registrar la asignación',
      );
    }
  }

  /*
  Nombre del método: asignarVarios
  Descripción: Asigna varios roles a un usuario en una sola operación.
               Reactiva las asignaciones anteriores cuando corresponda.
  Parámetros:
    - usuarioId: Identificador del usuario.
    - dto: Lista de roles a asignar.
    - idUsuario: Usuario responsable de la operación.
  Respuestas posibles:
    - 200: Roles asignados correctamente.
    - 404: Usuario o rol no encontrado.
    - 409: Usuario o rol inactivo / asignación duplicada.
    - 500: Error durante la operación.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async asignarVarios(
    usuarioId: string,
    dto: AsignarVariosUsuarioRolDto,
    idUsuario: string,
  ): Promise<UsuarioRolMessageResponse> {
    return this.usuarioRolRepository.manager.transaction(async (manager) => {
      const usuarioRepo = manager.getRepository(Usuario);
      const rolRepo = manager.getRepository(Rol);
      const asignacionRepo = manager.getRepository(UsuarioRol);

      const usuario = await usuarioRepo.findOne({
        where: { id: usuarioId },
      });

      if (!usuario) {
        throw new NotFoundException(
          'No existe un usuario con ese identificador',
        );
      }

      if (usuario.estado !== 'ACTIVO' || usuario._deleted_at) {
        throw new ConflictException(
          'No se pueden asignar roles a un usuario inactivo',
        );
      }

      const roles = await rolRepo.find({
        where: {
          id: In(dto.roles),
          estado: 'ACTIVO',
          _deleted_at: IsNull(),
        },
      });

      if (roles.length !== dto.roles.length) {
        throw new NotFoundException(
          'Uno o varios roles no existen o no están disponibles',
        );
      }

      const asignacionesExistentes = await asignacionRepo.find({
        where: {
          usuario_id: usuarioId,
          rol_id: In(dto.roles),
        },
      });

      const activas = asignacionesExistentes.filter(
        (asignacion) => asignacion.estado === 'ACTIVO' && !asignacion.deletedAt,
      );

      if (activas.length > 0) {
        throw new ConflictException(
          'Uno o varios roles ya están asignados al usuario',
        );
      }

      const nuevasAsignaciones: UsuarioRol[] = [];

      for (const rolId of dto.roles) {
        const existente = asignacionesExistentes.find(
          (asignacion) => asignacion.rol_id === rolId,
        );

        if (existente) {
          // Reactivar asignación anterior.
          existente.estado = 'ACTIVO';
          existente.deletedAt = null;
          existente._user_delete = null;
          existente._user_update = idUsuario;

          nuevasAsignaciones.push(existente);
        } else {
          // Crear nueva asignación.
          nuevasAsignaciones.push(
            asignacionRepo.create({
              usuario_id: usuarioId,
              rol_id: rolId,
              usuario: { id: usuarioId },
              rol: { id: rolId },
              estado: 'ACTIVO',
              usuario_creador: { id: idUsuario },
            }),
          );
        }
      }

      await asignacionRepo.save(nuevasAsignaciones);

      return {
        message: 'Roles asignados al usuario correctamente',
      };
    });
  }

  /*
  Nombre del método: listar
  Descripción: Obtiene las asignaciones aplicando filtros,
               búsqueda, ordenamiento y paginación.
  Parámetros:
    - query: QueryUsuarioRolDto
  Respuestas posibles:
    - 200: Listado paginado de asignaciones.
    - 400: Campo de ordenamiento no válido.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async listar(
    query: QueryUsuarioRolDto,
  ): Promise<PaginatedResponse<UsuarioRolResponse>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      status,
      search,
    } = query;

    // Validar campo de ordenamiento.
    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'createdAt',
      estado: 'estado',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido',
      );
    }

    // Construir filtros base.
    const whereBase: FindOptionsWhere<UsuarioRol> = {
      deletedAt: IsNull(),
    };

    // Filtro por estado.
    if (status && status !== 'TODOS') {
      whereBase.estado = status;
    } else if (!status) {
      whereBase.estado = 'ACTIVO';
    }

    // Búsqueda por usuario y rol.
    const where: FindOptionsWhere<UsuarioRol>[] | FindOptionsWhere<UsuarioRol> =
      search
        ? [
            {
              ...whereBase,
              usuario: {
                username: ILike(`%${search}%`),
              },
            },
            {
              ...whereBase,
              rol: {
                codigo: ILike(`%${search}%`),
              },
            },
            {
              ...whereBase,
              rol: {
                descripcion: ILike(`%${search}%`),
              },
            },
          ]
        : whereBase;

    const skip = (page - 1) * limit;

    try {
      const [registros, total] = await this.usuarioRolRepository.findAndCount({
        where,
        relations: {
          usuario: true,
          rol: true,
          usuario_creador: true,
          usuario_actualizador: true,
          usuario_eliminador: true,
        },
        order: {
          [campoOrdenamiento]: sortOrder,
        },
        skip,
        take: limit,
      });

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
        `Error al listar asignaciones. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /*
  Nombre del método: listarPorRol
  Descripción: Obtiene los usuarios que tienen asignado un rol activo.
  Parámetros:
    - rolId: Identificador UUID del rol.
  Respuestas posibles:
    - 200: Usuarios encontrados.
    - 404: Rol no encontrado.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async listarPorRol(rolId: string): Promise<RolUsuariosResponse> {
    const rol = await this.rolService.validarRol(rolId);

    if (!rol) {
      throw new NotFoundException('No existe un rol con ese identificador');
    }

    const asignaciones = await this.usuarioRolRepository.find({
      where: {
        rol_id: rolId,
        estado: 'ACTIVO',
        deletedAt: IsNull(),
      },
      relations: {
        usuario: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      rol_id: rol.id,
      codigo: rol.codigo,
      descripcion: rol.descripcion,
      usuarios: asignaciones.map((asignacion) => ({
        id: asignacion.usuario.id,
        username: asignacion.usuario.username,
      })),
    };
  }

  /*
  Nombre del método: buscarPorId
  Descripción: Busca una asignación por su identificador único.
  Parámetros:
    - id: string (identificador de la asignación)
  Respuestas posibles:
    - 200: Asignación encontrada.
    - 404: Asignación no encontrada.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async buscarPorId(id: string): Promise<UsuarioRolResponse> {
    const asignacion = await this.usuarioRolRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
        rol: true,
        usuario_creador: true,
        usuario_actualizador: true,
        usuario_eliminador: true,
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'No existe una asignación con ese identificador',
      );
    }

    return mapearRespuesta(asignacion);
  }

  /*
  Nombre del método: listarPorUsuario
  Descripción: Obtiene todos los roles activos y no eliminados
               lógicamente que tiene asignados un usuario.
  Parámetros:
    - usuarioId: string (identificador del usuario)
  Respuestas posibles:
    - 200: Roles del usuario encontrados.
    - 404: Usuario no encontrado.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async listarPorUsuario(usuarioId: string): Promise<UsuarioRolesResponse> {
    // Verificar que el usuario exista.
    await this.usuarioService.validarUsuario(usuarioId);

    // Obtener las asignaciones activas del usuario.
    const asignaciones = await this.usuarioRolRepository.find({
      where: {
        usuario_id: usuarioId,
        estado: 'ACTIVO',
        deletedAt: IsNull(),
        rol: {
          estado: 'ACTIVO',
          _deleted_at: IsNull(),
        },
      },
      relations: {
        rol: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      usuario_id: usuarioId,
      roles: asignaciones.map((asignacion) => ({
        id: asignacion.rol.id,
        codigo: asignacion.rol.codigo,
        descripcion: asignacion.rol.descripcion,
      })),
    };
  }

  /*
  Nombre del método: actualizar
  Descripción: Actualiza parcialmente una asignación. Valida
               la existencia y estado del usuario y rol, además
               de evitar combinaciones duplicadas.
  Parámetros:
    - id: string
    - dto: UpdateUsuarioRolDto
    - idUsuario: string
  Respuestas posibles:
    - 200: Asignación actualizada correctamente.
    - 404: Asignación, usuario o rol no encontrado.
    - 409: Asignación inactiva o combinación duplicada.
    - 500: Error al actualizar.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async actualizar(
    id: string,
    dto: UpdateUsuarioRolDto,
    idUsuario: string,
  ): Promise<UsuarioRolMessageResponse> {
    const asignacion = await this.usuarioRolRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'No existe una asignación activa con ese identificador',
      );
    }

    if (asignacion.estado !== 'ACTIVO') {
      throw new ConflictException(
        'No se puede actualizar una asignación inactiva',
      );
    }

    const nuevoUsuarioId = dto.usuario_id ?? asignacion.usuario_id;
    const nuevoRolId = dto.rol_id ?? asignacion.rol_id;

    await this.usuarioService.validarUsuario(nuevoUsuarioId);
    await this.rolService.validarRol(nuevoRolId);

    // Comprueba si la nueva combinación ya está asignada.
    const duplicada = await this.usuarioRolRepository.findOne({
      where: {
        usuario_id: nuevoUsuarioId,
        rol_id: nuevoRolId,
        id: Not(id),
      },
    });

    if (duplicada) {
      throw new ConflictException(
        'El usuario ya tiene registrada esta asignación de rol',
      );
    }

    asignacion.usuario_id = nuevoUsuarioId;
    asignacion.rol_id = nuevoRolId;
    asignacion.usuario = { id: nuevoUsuarioId } as Usuario;
    asignacion.rol = { id: nuevoRolId } as Rol;
    asignacion._user_update = idUsuario;

    try {
      await this.usuarioRolRepository.save(asignacion);

      return {
        message: 'Asignación actualizada correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'El usuario ya tiene registrada esta asignación de rol',
        );
      }

      this.logger.error(
        `Error al actualizar asignación. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo actualizar la asignación',
      );
    }
  }

  /*
  Nombre del método: cambiarEstado
  Descripción: Cambia el estado de una asignación entre ACTIVO e INACTIVO.
               Al desactivar registra eliminación lógica y al reactivar
               limpia los datos de eliminación.
  Parámetros:
    - id: string
    - idUsuario: string
  Respuestas posibles:
    - 200: Estado actualizado correctamente.
    - 404: Asignación no encontrada.
    - 500: No se pudo cambiar el estado.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<UsuarioRolMessageResponse> {
    const asignacion = await this.usuarioRolRepository.findOne({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'No existe una asignación con ese identificador',
      );
    }

    const nuevoEstado = asignacion.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    asignacion.estado = nuevoEstado;

    if (nuevoEstado === 'INACTIVO') {
      asignacion._user_delete = idUsuario;
      asignacion.deletedAt = new Date();
      asignacion._user_update = null;
    } else {
      // Verifica que el usuario y rol sigan disponibles.
      await this.usuarioService.validarUsuario(asignacion.usuario_id);
      await this.rolService.validarRol(asignacion.rol_id);

      asignacion._user_update = idUsuario;
      asignacion._user_delete = null;
      asignacion.deletedAt = null;
    }

    try {
      await this.usuarioRolRepository.save(asignacion);

      return {
        message: `Asignación ${nuevoEstado === 'ACTIVO' ? 'activada' : 'inactivada'} correctamente`,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar estado de asignación. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo cambiar el estado de la asignación',
      );
    }
  }

  /*
  Nombre del método: desactivarVarios
  Descripción: Desactiva varias asignaciones de roles de un usuario.
               Registra la fecha y el usuario responsable de la operación.
               Conserva los registros mediante eliminación lógica.
  Parámetros:
    - usuarioId: Identificador del usuario.
    - dto: Lista de roles a desactivar.
    - idUsuario: Usuario responsable de la operación.
  Respuestas posibles:
    - 200: Roles desactivados correctamente.
    - 404: Usuario o asignaciones no encontradas.
    - 409: Una o varias asignaciones ya están inactivas.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async desactivarVarios(
    usuarioId: string,
    dto: DesactivarVariosUsuarioRolDto,
    idUsuario: string,
  ): Promise<UsuarioRolMessageResponse> {
    return this.usuarioRolRepository.manager.transaction(async (manager) => {
      const usuarioRepo = manager.getRepository(Usuario);
      const asignacionRepo = manager.getRepository(UsuarioRol);

      const usuario = await usuarioRepo.findOne({
        where: { id: usuarioId },
      });

      if (!usuario) {
        throw new NotFoundException(
          'No existe un usuario con ese identificador',
        );
      }

      const asignaciones = await asignacionRepo.find({
        where: {
          usuario_id: usuarioId,
          rol_id: In(dto.roles),
          estado: 'ACTIVO',
          deletedAt: IsNull(),
        },
      });

      if (asignaciones.length !== dto.roles.length) {
        throw new ConflictException(
          'Una o varias asignaciones no existen o ya están inactivas',
        );
      }

      const fechaActual = new Date();

      for (const asignacion of asignaciones) {
        asignacion.estado = 'INACTIVO';
        asignacion.deletedAt = fechaActual;
        asignacion._user_delete = idUsuario;
        asignacion._user_update = null;
      }

      await asignacionRepo.save(asignaciones);

      return {
        message: 'Roles desactivados correctamente para el usuario',
      };
    });
  }
}
