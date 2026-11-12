/**

Módulo: Seguridad - RolModuloPermiso
Archivo: rol-modulo-permiso.service.ts
Descripción:
Gestiona las asignaciones de permisos entre roles y módulos.
Utiliza el repositorio propio de RolModuloPermiso y los servicios
de Rol, Modulo y Permiso para consultar y validar sus registros.
Implementa:
Creación de asignaciones.
Consulta y búsqueda.
Listado con filtros y paginación.
Consulta del catálogo de permisos.
Consulta de permisos por rol.
Asignación múltiple de permisos.
Reemplazo de permisos.
Actualización y cambio de estado.

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
import { In, IsNull, Repository } from 'typeorm';

import { RolModuloPermiso } from './entities/rol-modulo-permiso.entity';
import { Rol } from '../rol/entities/rol.entity';
import { Modulo } from '../modulo/entities/modulo.entity';
import { Permiso } from '../permiso/entities/permiso.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

import { RolService } from '../rol/rol.service';
import { ModuloService } from '../modulo/modulo.service';
import { PermisoService } from '../permiso/permiso.service';

import { CreateRolModuloPermisoDto } from './dto/create-rol-modulo-permiso.dto';
import { UpdateRolModuloPermisoDto } from './dto/update-rol-modulo-permiso.dto';
import { QueryRolModuloPermisoDto } from './dto/query-rol-modulo-permiso.dto';
import { ReemplazarPermisosRolModuloDto } from './dto/reemplazar-permisos-rol-modulo.dto';
import { AsignarPermisosRolModuloDto } from './dto/asignar-permisos-rol-modulo.dto';

import {
  RolModuloPermisoResponse,
  RolModuloPermisoMessageResponse,
  CatalogoPermisosResponse,
  RolModulosPermisosResponse,
} from './interface/rol-modulo-permiso-response.interface';

import {
  mapearCatalogoPermisos,
  mapearRespuesta,
  mapearRolModulosPermisos,
} from './util/map-response-rol-modulo-permiso.util';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';

@Injectable()
export class RolModuloPermisoService {
  private readonly logger = new Logger(RolModuloPermisoService.name);

  constructor(
    @InjectRepository(RolModuloPermiso)
    private readonly asignacionRepository: Repository<RolModuloPermiso>,

    private readonly rolService: RolService,
    private readonly moduloService: ModuloService,
    private readonly permisoService: PermisoService,
  ) {}

  /**
   * Nombre del método: crear
   * Descripción:
   * Registra una asignación de permiso para un rol dentro de un módulo.
   * Validaciones:
   * Comprueba que el rol, módulo y permiso existan.
   * Comprueba que los tres registros estén activos.
   * Evita registrar combinaciones duplicadas.
   * @param dto Datos de la asignación.
   * @param idUsuario Identificador del usuario que realiza la operación.
   */
  async crear(
    dto: CreateRolModuloPermisoDto,
    idUsuario: string,
  ): Promise<RolModuloPermisoMessageResponse> {
    const [rol, modulo, permiso] = await Promise.all([
      this.rolService.validarRol(dto.rol_id),
      this.moduloService.validarModulo(dto.modulo_id),
      this.permisoService.validarPermisos([dto.permiso_id]).then((p) => p[0]),
    ]);

    const existe = await this.asignacionRepository.findOne({
      where: {
        rol_id: rol.id,
        modulo_id: modulo.id,
        permiso_id: permiso.id,
      },
    });

    if (existe) {
      throw new ConflictException(
        'Esta combinación de rol, módulo y permiso ya está registrada',
      );
    }

    const asignacion = this.asignacionRepository.create({
      rol_id: rol.id,
      modulo_id: modulo.id,
      permiso_id: permiso.id,
      rol: { id: rol.id } as Rol,
      modulo: { id: modulo.id } as Modulo,
      permiso: { id: permiso.id } as Permiso,
      usuario_creador: { id: idUsuario } as Usuario,
      userCreatedId: idUsuario,
    });

    try {
      await this.asignacionRepository.save(asignacion);

      return {
        message: 'Permiso asignado al rol y módulo correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Esta combinación de rol, módulo y permiso ya está registrada',
        );
      }

      this.logger.error(
        'Error al crear la asignación',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo realizar la asignación del permiso',
      );
    }
  }

  /**
   * Nombre del método: listar
   * Descripción:
   * Obtiene las asignaciones aplicando filtros, búsqueda,
   * ordenamiento y paginación mediante ORM.
   * @param query Parámetros de búsqueda y paginación.
   */
  async listar(
    query: QueryRolModuloPermisoDto,
  ): Promise<PaginatedResponse<RolModuloPermisoResponse>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      status,
      search,
      rol_id,
      modulo_id,
      permiso_id,
    } = query;

    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      estado: 'estado',
    };

    const campo = camposOrdenamiento[sortBy];

    if (!campo) {
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido',
      );
    }

    try {
      const asignaciones = await this.asignacionRepository.find({
        relations: {
          rol: true,
          modulo: true,
          permiso: true,
          usuario_creador: true,
          usuario_actualizador: true,
        },
        where: {
          ...(status && status !== 'TODOS'
            ? { estado: status }
            : !status
              ? { estado: 'ACTIVO' }
              : {}),
          ...(rol_id ? { rol_id } : {}),
          ...(modulo_id ? { modulo_id } : {}),
          ...(permiso_id ? { permiso_id } : {}),
        },
        order: {
          [campo]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      let registros = asignaciones;

      if (search) {
        const termino = search.toLowerCase();

        registros = registros.filter((item) =>
          [
            item.rol?.codigo,
            item.rol?.descripcion,
            item.modulo?.nombre,
            item.modulo?.codigo,
            item.permiso?.codigo,
            item.permiso?.descripcion,
          ].some((valor) => valor?.toLowerCase().includes(termino)),
        );
      }

      const total = search
        ? registros.length
        : await this.asignacionRepository.count({
            where: {
              ...(status && status !== 'TODOS'
                ? { estado: status }
                : !status
                  ? { estado: 'ACTIVO' }
                  : {}),
              ...(rol_id ? { rol_id } : {}),
              ...(modulo_id ? { modulo_id } : {}),
              ...(permiso_id ? { permiso_id } : {}),
            },
          });

      const totalPages = Math.ceil(total / limit);

      return {
        items: registros.map(mapearRespuesta),
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
        'Error al listar asignaciones',
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Nombre del método: buscarPorId
   * Descripción:
   * Busca una asignación por su identificador e incluye
   * las relaciones necesarias para construir la respuesta.
   * @param id Identificador de la asignación.
   */
  async buscarPorId(id: string): Promise<RolModuloPermisoResponse> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
      relations: {
        rol: true,
        modulo: true,
        permiso: true,
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'No existe una asignación con ese identificador',
      );
    }

    return mapearRespuesta(asignacion);
  }

  /**
   * Nombre del método: buscarPorRol
   * Descripción:
   * Obtiene todas las asignaciones activas correspondientes
   * a un rol determinado.
   * @param rolId Identificador del rol.
   */
  async buscarPorRol(rolId: string): Promise<RolModuloPermisoResponse[]> {
    await this.rolService.validarRol(rolId);

    const asignaciones = await this.asignacionRepository.find({
      where: {
        rol_id: rolId,
        estado: 'ACTIVO',
      },
      relations: {
        rol: true,
        modulo: true,
        permiso: true,
        usuario_creador: true,
        usuario_actualizador: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return asignaciones.map(mapearRespuesta);
  }

  /**
   * Nombre del método: buscarPorRolYModulo
   * Descripción:
   * Obtiene las asignaciones activas de un rol dentro
   * de un módulo específico.
   */
  async buscarPorRolYModulo(
    rolId: string,
    moduloId: string,
  ): Promise<RolModuloPermisoResponse[]> {
    await Promise.all([
      this.rolService.validarRol(rolId),
      this.moduloService.validarModulo(moduloId),
    ]);

    const asignaciones = await this.asignacionRepository.find({
      where: {
        rol_id: rolId,
        modulo_id: moduloId,
        estado: 'ACTIVO',
      },
      relations: {
        rol: true,
        modulo: true,
        permiso: true,
        usuario_creador: true,
        usuario_actualizador: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return asignaciones.map(mapearRespuesta);
  }

  /**
   * Nombre del método: obtenerCatalogo
   * Descripción:
   * Obtiene los módulos y permisos activos disponibles
   * para realizar asignaciones.
   */
  async obtenerCatalogo(): Promise<CatalogoPermisosResponse> {
    const [modulos, permisos] = await Promise.all([
      this.moduloService.obtenerModulosActivos(),
      this.permisoService.obtenerPermisosActivos(),
    ]);

    return mapearCatalogoPermisos(modulos, permisos);
  }

  /**
   * Nombre del método: obtenerPorRol
   * Descripción:
   * Obtiene los módulos y permisos activos asignados a un rol.
   * Agrupa las asignaciones por módulo.
   * @param rolId Identificador del rol.
   */
  async obtenerPorRol(rolId: string): Promise<RolModulosPermisosResponse> {
    const rol = await this.rolService.validarRol(rolId);

    const asignaciones = await this.asignacionRepository.find({
      where: {
        rol_id: rolId,
        estado: 'ACTIVO',
        deletedAt: IsNull(),
        rol: {
          estado: 'ACTIVO',
          deletedAt: IsNull(),
        },
        modulo: {
          estado: 'ACTIVO',
          deletedAt: IsNull(),
        },
        permiso: {
          estado: 'ACTIVO',
          deletedAt: IsNull(),
        },
      },
      relations: {
        rol: true,
        modulo: true,
        permiso: true,
      },
      order: {
        modulo: { nombre: 'ASC' },
        permiso: { codigo: 'ASC' },
      },
    });

    return mapearRolModulosPermisos(asignaciones, rol);
  }

  /**
   * Nombre del método: asignarPermisos
   * Descripción:
   * Asigna uno o varios permisos a un rol dentro de un módulo.
   * Las asignaciones existentes e inactivas se reactivan.
   * Las asignaciones activas no se duplican.
   * @param rolId Identificador del rol.
   * @param moduloId Identificador del módulo.
   * @param dto Lista de permisos que se asignarán.
   * @param idUsuario Usuario responsable de la operación.
   */
  async asignarPermisos(
    rolId: string,
    moduloId: string,
    dto: AsignarPermisosRolModuloDto,
    idUsuario: string,
  ): Promise<RolModuloPermisoMessageResponse> {
    try {
      const [rol, modulo, permisos] = await Promise.all([
        this.rolService.validarRol(rolId),
        this.moduloService.validarModulo(moduloId),
        this.permisoService.validarPermisos(dto.permisos),
      ]);

      const existentes = await this.asignacionRepository.find({
        where: {
          rol_id: rol.id,
          modulo_id: modulo.id,
          permiso_id: In(permisos.map((p) => p.id)),
        },
      });

      const existentesMap = new Map(
        existentes.map((item) => [item.permiso_id, item]),
      );

      const registros: RolModuloPermiso[] = [];

      for (const permiso of permisos) {
        const existente = existentesMap.get(permiso.id);

        if (existente) {
          if (existente.estado === 'ACTIVO' && existente.deletedAt === null) {
            continue;
          }

          existente.estado = 'ACTIVO';
          existente.deletedAt = null;
          existente.userDeletedId = null;
          existente.userUpdateId = idUsuario;

          registros.push(existente);
        } else {
          registros.push(
            this.asignacionRepository.create({
              rol_id: rol.id,
              modulo_id: modulo.id,
              permiso_id: permiso.id,
              rol: { id: rol.id } as Rol,
              modulo: { id: modulo.id } as Modulo,
              permiso: { id: permiso.id } as Permiso,
              estado: 'ACTIVO',
              deletedAt: null,
              userCreatedId: idUsuario,
            }),
          );
        }
      }

      if (registros.length) {
        await this.asignacionRepository.save(registros);
      }

      return {
        message: 'Permisos asignados correctamente al rol y módulo',
      };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(
        `Error al asignar permisos. Rol: ${rolId}, Módulo: ${moduloId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudieron asignar los permisos',
      );
    }
  }

  /**
   * Nombre del método: reemplazarPermisos
   * Descripción:
   * Reemplaza completamente los permisos de un módulo para un rol.
   * Los permisos recibidos quedan activos.
   * Los permisos anteriores que no estén en la lista se inactivan.
   * Una lista vacía desactiva todas las asignaciones del módulo.
   * @param rolId Identificador del rol.
   * @param moduloId Identificador del módulo.
   * @param dto Nueva lista completa de permisos.
   * @param idUsuario Usuario responsable de la operación.
   */
  async reemplazarPermisos(
    rolId: string,
    moduloId: string,
    dto: ReemplazarPermisosRolModuloDto,
    idUsuario: string,
  ): Promise<RolModuloPermisoMessageResponse> {
    try {
      const [rol, modulo, permisos] = await Promise.all([
        this.rolService.validarRol(rolId),
        this.moduloService.validarModulo(moduloId),
        dto.permisos.length
          ? this.permisoService.validarPermisos(dto.permisos)
          : Promise.resolve([]),
      ]);

      const existentes = await this.asignacionRepository.find({
        where: {
          rol_id: rol.id,
          modulo_id: modulo.id,
        },
      });

      const existentesMap = new Map(
        existentes.map((item) => [item.permiso_id, item]),
      );

      const solicitados = new Set(permisos.map((p) => p.id));
      const registros: RolModuloPermiso[] = [];

      // Inactiva las asignaciones que ya no fueron seleccionadas.
      for (const asignacion of existentes) {
        if (
          asignacion.estado === 'ACTIVO' &&
          !solicitados.has(asignacion.permiso_id)
        ) {
          asignacion.estado = 'INACTIVO';
          asignacion.deletedAt = new Date();
          asignacion.userDeletedId = idUsuario;
          asignacion.userUpdateId = idUsuario;

          registros.push(asignacion);
        }
      }

      // Reactiva las asignaciones existentes o crea las nuevas.
      for (const permiso of permisos) {
        const existente = existentesMap.get(permiso.id);

        if (existente) {
          if (existente.estado !== 'ACTIVO' || existente.deletedAt !== null) {
            existente.estado = 'ACTIVO';
            existente.deletedAt = null;
            existente.userDeletedId = null;
            existente.userUpdateId = idUsuario;

            registros.push(existente);
          }
        } else {
          registros.push(
            this.asignacionRepository.create({
              rol_id: rol.id,
              modulo_id: modulo.id,
              permiso_id: permiso.id,
              rol: { id: rol.id } as Rol,
              modulo: { id: modulo.id } as Modulo,
              permiso: { id: permiso.id } as Permiso,
              estado: 'ACTIVO',
              deletedAt: null,
              userCreatedId: idUsuario,
            }),
          );
        }
      }

      if (registros.length) {
        await this.asignacionRepository.save(registros);
      }

      return {
        message: 'Permisos del módulo reemplazados correctamente',
      };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(
        `Error al reemplazar permisos. Rol: ${rolId}, Módulo: ${moduloId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudieron reemplazar los permisos del módulo',
      );
    }
  }

  /**
   * Nombre del método: actualizar
   * Descripción:
   * Actualiza una asignación existente.
   * Valida las referencias y evita combinaciones duplicadas.
   * @param id Identificador de la asignación.
   * @param dto Datos que se actualizarán.
   * @param idUsuario Usuario responsable de la operación.
   */
  async actualizar(
    id: string,
    dto: UpdateRolModuloPermisoDto,
    idUsuario: string,
  ): Promise<RolModuloPermisoMessageResponse> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'No existe una asignación con ese identificador',
      );
    }

    if (asignacion.estado !== 'ACTIVO') {
      throw new ConflictException(
        'No se puede actualizar una asignación inactiva',
      );
    }

    const nuevoRolId = dto.rol_id ?? asignacion.rol_id;
    const nuevoModuloId = dto.modulo_id ?? asignacion.modulo_id;
    const nuevoPermisoId = dto.permiso_id ?? asignacion.permiso_id;

    const [rol, modulo, permiso] = await Promise.all([
      this.rolService.validarRol(nuevoRolId),
      this.moduloService.validarModulo(nuevoModuloId),
      this.permisoService.validarPermisos([nuevoPermisoId]).then((p) => p[0]),
    ]);

    const duplicado = await this.asignacionRepository.findOne({
      where: {
        rol_id: rol.id,
        modulo_id: modulo.id,
        permiso_id: permiso.id,
      },
    });

    if (duplicado && duplicado.id !== id) {
      throw new ConflictException(
        'Esta combinación de rol, módulo y permiso ya está registrada',
      );
    }

    Object.assign(asignacion, {
      rol_id: rol.id,
      modulo_id: modulo.id,
      permiso_id: permiso.id,
      rol: { id: rol.id } as Rol,
      modulo: { id: modulo.id } as Modulo,
      permiso: { id: permiso.id } as Permiso,
      userUpdateId: idUsuario,
      usuario_actualizador: { id: idUsuario } as Usuario,
    });

    try {
      await this.asignacionRepository.save(asignacion);

      return {
        message: 'Asignación de permiso actualizada correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Esta combinación de rol, módulo y permiso ya está registrada',
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

  /**
   * Nombre del método: cambiarEstado
   * Descripción:
   * Alterna el estado de una asignación entre ACTIVO e INACTIVO.
   * Registra los datos de auditoría correspondientes.
   * @param id Identificador de la asignación.
   * @param idUsuario Usuario responsable de la operación.
   */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<RolModuloPermisoMessageResponse> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'No existe una asignación con ese identificador',
      );
    }

    const nuevoEstado = asignacion.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    if (nuevoEstado === 'ACTIVO') {
      await Promise.all([
        this.rolService.validarRol(asignacion.rol_id),
        this.moduloService.validarModulo(asignacion.modulo_id),
        this.permisoService.validarPermisos([asignacion.permiso_id]),
      ]);

      asignacion.userUpdateId = idUsuario;
      asignacion.deletedAt = null;
      asignacion.userDeletedId = null;
      asignacion.usuario_eliminador = null;
    } else {
      asignacion.userDeletedId = idUsuario;
      asignacion.deletedAt = new Date();
      asignacion.userUpdateId = null;
      asignacion.usuario_actualizador = null;
    }

    asignacion.estado = nuevoEstado;

    try {
      await this.asignacionRepository.save(asignacion);

      return {
        message: `Asignación ${
          nuevoEstado === 'ACTIVO' ? 'activada' : 'inactivada'
        } correctamente`,
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
}
