/**
 * Módulo: Seguridad - Rol
 * Archivo: rol.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de roles del sistema.
 * Gestiona registros, consultas, actualizaciones y cambios de estado,
 * incluyendo validaciones, eliminación lógica y control de auditoría.
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
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';

import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { QueryRolDto } from './dto/query-rol.dto';

import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';

import { mapearRespuesta } from './util/map-response-rol.util';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import {
  RolMessageResponse,
  RolResponse,
} from './interfaces/rol-response.interface';

/**
 * Servicio: RolService
 * Descripción:
 * Implementa las operaciones de negocio para administrar los roles,
 * utilizando exclusivamente métodos y operadores del ORM TypeORM.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
@Injectable()
export class RolService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   */
  private readonly logger = new Logger(RolService.name);

  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  /*
  Nombre del método: crear
  Descripción: Registra un nuevo rol. Verifica que no exista otro registro
               con el mismo código y asocia al usuario creador.
  Parámetros:
    - dto: CreateRolDto (codigo, descripcion)
    - idUsuario: string (usuario que crea)
  Respuestas posibles:
    - 201: Rol registrado correctamente.
    - 409: Ya existe un rol con ese código.
    - 500: No se pudo guardar el registro.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async crear(
    dto: CreateRolDto,
    idUsuario: string,
  ): Promise<RolMessageResponse> {
    // Comprueba si ya existe un registro con el mismo código.
    const existe = await this.rolRepository.findOne({
      where: { codigo: dto.codigo },
    });

    if (existe) {
      throw new ConflictException('Ya existe un rol registrado con ese código');
    }

    // Prepara la entidad asociando al usuario creador.
    const rol = this.rolRepository.create({
      ...dto,
      estado: 'ACTIVO',
      usuario_creador: { id: idUsuario },
    });

    try {
      await this.rolRepository.save(rol);

      return {
        message: 'Rol registrado correctamente',
      };
    } catch (error: unknown) {
      // Controla posibles duplicados producidos durante el guardado.
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe un rol registrado con ese código',
        );
      }

      this.logger.error(
        `Error al crear un rol. Código: ${dto.codigo}, Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('No se pudo guardar el registro');
    }
  }

  /*
  Nombre del método: listar
  Descripción: Obtiene los roles aplicando filtros, búsqueda,
               ordenamiento y paginación.
  Parámetros:
    - query: QueryRolDto (page, limit, sortBy, sortOrder, search, status)
  Respuestas posibles:
    - 200: Listado paginado de roles.
    - 400: Campo de ordenamiento no válido.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async listar(query: QueryRolDto): Promise<PaginatedResponse<RolResponse>> {
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
      createdAt: '_created_at',
      codigo: 'codigo',
      descripcion: 'descripcion',
      estado: 'estado',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy];

    if (!campoOrdenamiento) {
      throw new BadRequestException(
        'El campo de ordenamiento solicitado no es válido.',
      );
    }

    // Construir filtros.
    const where: FindOptionsWhere<Rol> = {
      deletedAt: IsNull(),
    };

    // Filtro por estado.
    if (status && status !== 'TODOS') {
      where.estado = status;
    } else if (!status) {
      where.estado = 'ACTIVO';
    }

    // Filtro de búsqueda.
    if (search) {
      Object.assign(where, [
        {
          ...where,
          codigo: ILike(`%${search}%`),
        },
        {
          ...where,
          descripcion: ILike(`%${search}%`),
        },
      ]);
    }

    // Paginación.
    const skip = (page - 1) * limit;

    try {
      const [registros, total] = await this.rolRepository.findAndCount({
        where,
        relations: {
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

      const items: RolResponse[] = registros.map((registro) =>
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
    } catch (error: unknown) {
      this.logger.error(
        `Error al listar roles. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /*
  Nombre del método: buscarPorId
  Descripción: Busca un rol por su identificador único e incluye
               los usuarios responsables de creación, actualización
               y eliminación.
  Parámetros:
    - id: string (identificador del rol)
  Respuestas posibles:
    - 200: Registro encontrado.
    - 404: No existe un rol con ese identificador.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async buscarPorId(id: string): Promise<RolResponse> {
    const rol = await this.rolRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
        usuario_eliminador: true,
      },
    });

    if (!rol) {
      throw new NotFoundException('No existe un rol con ese identificador');
    }

    this.logger.log(`Rol encontrado. ID: ${id}, Código: ${rol.codigo}`);

    return mapearRespuesta(rol);
  }

  /*
  Nombre del método: actualizar
  Descripción: Actualiza parcialmente un rol existente. Verifica
               su existencia, estado activo, eliminación lógica
               y posibles duplicados de código.
  Parámetros:
    - id: string (identificador del rol)
    - dto: UpdateRolDto (campos a actualizar)
    - idUsuario: string (usuario que actualiza)
  Respuestas posibles:
    - 200: Rol actualizado correctamente.
    - 404: No existe un rol con ese identificador.
    - 409: Rol inactivo o código duplicado.
    - 500: No se pudo actualizar el registro.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async actualizar(
    id: string,
    dto: UpdateRolDto,
    idUsuario: string,
  ): Promise<RolMessageResponse> {
    const rol = await this.rolRepository.findOne({
      where: { id },
    });

    if (!rol) {
      throw new NotFoundException('No existe un rol con ese identificador');
    }

    // Impide modificar registros inactivos o eliminados.
    if (rol.estado !== 'ACTIVO' || rol.deletedAt) {
      throw new ConflictException('No se puede actualizar un rol inactivo');
    }

    // Verifica que el nuevo código no esté asignado a otro rol.
    if (dto.codigo && dto.codigo !== rol.codigo) {
      const codigoDuplicado = await this.rolRepository.findOne({
        where: { codigo: dto.codigo },
      });

      if (codigoDuplicado) {
        throw new ConflictException(
          'Ya existe otro rol registrado con ese código',
        );
      }
    }

    // Aplica únicamente los campos recibidos.
    Object.assign(rol, dto);

    // Actualiza la información de auditoría.
    rol._user_update = idUsuario;
    rol.updatedAt = new Date();

    try {
      await this.rolRepository.save(rol);

      return {
        message: 'Rol actualizado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe otro rol registrado con ese código',
        );
      }

      this.logger.error(
        `Error al actualizar rol. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo actualizar el registro',
      );
    }
  }

  /*
  Nombre del método: cambiarEstado
  Descripción: Cambia el estado de un rol entre ACTIVO e INACTIVO.
               Al desactivar registra la eliminación lógica y al
               reactivar limpia los datos de eliminación.
  Parámetros:
    - id: string (identificador del rol)
    - idUsuario: string (usuario que realiza el cambio)
  Respuestas posibles:
    - 200: Rol activado o inactivado correctamente.
    - 404: No existe un rol con ese identificador.
    - 500: No se pudo cambiar el estado.
  Fecha de creación: 2026-11-11
  Autor: Missael Apaza
  */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<RolMessageResponse> {
    const rol = await this.rolRepository.findOne({
      where: { id },
    });

    if (!rol) {
      throw new NotFoundException('No existe un rol con ese identificador');
    }

    const estadoAnterior = rol.estado;

    // Determina el estado contrario al actual.
    const nuevoEstado = rol.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    rol.estado = nuevoEstado;

    if (nuevoEstado === 'INACTIVO') {
      // Registra quién y cuándo realizó la desactivación.
      rol._user_delete = idUsuario;
      rol.deletedAt = new Date();
      rol._user_update = null;
      rol.updatedAt = null;
    } else {
      // Al reactivar, limpia los datos de eliminación lógica.
      rol._user_update = idUsuario;
      rol.updatedAt = new Date();
      rol._user_delete = null;
      rol.deletedAt = null;
    }

    try {
      await this.rolRepository.save(rol);

      return {
        message: `Rol ${rol.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar estado de rol. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del registro',
      );
    }
  }

  async validarRol(id: string): Promise<Rol> {
    const rol = await this.rolRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!rol) {
      throw new NotFoundException(
        'No existe un rol disponible con ese identificador',
      );
    }

    if (rol.estado !== 'ACTIVO') {
      throw new ConflictException('No se puede asignar un rol inactivo');
    }

    return rol;
  }
}
