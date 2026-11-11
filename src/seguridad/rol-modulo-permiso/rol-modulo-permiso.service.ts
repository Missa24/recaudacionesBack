import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { Modulo } from '../modulo/entities/modulo.entity';
import { Permiso } from '../permiso/entities/permiso.entity';
import { Rol } from '../rol/entities/rol.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateRolModuloPermisoDto } from './dto/create-rol-modulo-permiso.dto';
import { QueryRolModuloPermisoDto } from './dto/query-rol-modulo-permiso.dto';
import { UpdateRolModuloPermisoDto } from './dto/update-rol-modulo-permiso.dto';
import { RolModuloPermiso } from './entities/rol-modulo-permiso.entity';
import {
  RolModuloPermisoMessageResponse,
  RolModuloPermisoResponse,
} from './interface/rol-modulo-permiso-response.interface';
import { mapearRespuestaRolModuloPermiso } from './util/map-response-rol-modulo-permiso.util';

@Injectable()
export class RolModuloPermisoService {
  private readonly logger = new Logger(RolModuloPermisoService.name);

  constructor(
    @InjectRepository(RolModuloPermiso)
    private readonly asignacionRepository: Repository<RolModuloPermiso>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Modulo)
    private readonly moduloRepository: Repository<Modulo>,
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async crear(
    dto: CreateRolModuloPermisoDto,
    idUsuario: string,
  ): Promise<RolModuloPermisoMessageResponse> {
    await this.validarReferencias(dto.id_rol, dto.id_modulo, dto.id_permiso);
    await this.validarDuplicado(dto.id_rol, dto.id_modulo, dto.id_permiso);

    const asignacion = this.asignacionRepository.create({
      id: randomUUID(),
      rol_id: dto.id_rol,
      modulo_id: dto.id_modulo,
      permiso_id: dto.id_permiso,
      estado: 'ACTIVO',
      userCreated: idUsuario,
      usuarioCreador: { idUsuario },
    });

    try {
      await this.asignacionRepository.save(asignacion);
      return { message: 'Asignación registrada correctamente.' };
    } catch (error: unknown) {
      this.logger.error(
        'Error al crear la asignación de rol, módulo y permiso.',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('No se pudo guardar el registro.');
    }
  }

  async listar(
    query: QueryRolModuloPermisoDto,
  ): Promise<PaginatedResponse<RolModuloPermisoResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      id_rol,
      id_modulo,
      id_permiso,
    } = query;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const consulta = this.asignacionRepository
      .createQueryBuilder('asignacion')
      .leftJoinAndSelect('asignacion.rol', 'rol')
      .leftJoinAndSelect('asignacion.modulo', 'modulo')
      .leftJoinAndSelect('asignacion.permiso', 'permiso')
      .leftJoinAndSelect('asignacion.usuarioCreador', 'usuario_creador')
      .leftJoinAndSelect(
        'asignacion.usuarioActualizador',
        'usuario_actualizador',
      );

    if (status && status !== 'TODOS') {
      consulta.andWhere('asignacion.estado = :status', { status });
    } else if (!status) {
      consulta.andWhere('asignacion.estado = :status', { status: 'ACTIVO' });
    }
    if (id_rol) {
      consulta.andWhere('asignacion.rol_id = :id_rol', { id_rol });
    }
    if (id_modulo) {
      consulta.andWhere('asignacion.modulo_id = :id_modulo', { id_modulo });
    }
    if (id_permiso) {
      consulta.andWhere('asignacion.permiso_id = :id_permiso', { id_permiso });
    }
    if (startDate) {
      consulta.andWhere('asignacion.createdAt >= :startDate', {
        startDate: new Date(`${startDate}T00:00:00.000`),
      });
    }
    if (endDate) {
      consulta.andWhere('asignacion.createdAt < :endDate', {
        endDate: new Date(
          new Date(`${endDate}T00:00:00.000`).getTime() + 86400000,
        ),
      });
    }
    if (search?.trim()) {
      const termino = `%${search.trim()}%`;
      consulta.andWhere(
        new Brackets((qb) => {
          qb.where('rol.nombre ILIKE :termino', { termino })
            .orWhere('rol.codigo ILIKE :termino', { termino })
            .orWhere('modulo.nombres ILIKE :termino', { termino })
            .orWhere('modulo.codigo ILIKE :termino', { termino })
            .orWhere('permiso.nombre ILIKE :termino', { termino })
            .orWhere('permiso.codigo ILIKE :termino', { termino });
        }),
      );
    }

    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'asignacion.createdAt',
      updatedAt: 'asignacion.updatedAt',
      estado: 'asignacion.estado',
    };

    try {
      const [asignaciones, total] = await consulta
        .orderBy(
          camposOrdenamiento[sortBy] ?? 'asignacion.createdAt',
          sortOrder ?? 'DESC',
        )
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);
      return {
        items: asignaciones.map(mapearRespuestaRolModuloPermiso),
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

  async buscarPorId(id: string): Promise<RolModuloPermisoResponse> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
      relations: {
        rol: true,
        modulo: true,
        permiso: true,
        usuarioCreador: true,
        usuarioActualizador: true,
      },
    });

    if (!asignacion) {
      throw new NotFoundException('No existe una asignación con ese ID.');
    }

    return mapearRespuestaRolModuloPermiso(asignacion);
  }

  async actualizar(
    id: string,
    dto: UpdateRolModuloPermisoDto,
    idUsuario: string,
  ): Promise<RolModuloPermisoMessageResponse> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException('No existe una asignación con ese ID.');
    }
    if (asignacion.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar una asignación inactiva.',
      );
    }

    const idRol = dto.id_rol ?? asignacion.rol_id;
    const idModulo = dto.id_modulo ?? asignacion.modulo_id;
    const idPermiso = dto.id_permiso ?? asignacion.permiso_id;
    await this.validarReferencias(idRol, idModulo, idPermiso);
    await this.validarDuplicado(idRol, idModulo, idPermiso, id);

    asignacion.rol_id = idRol;
    asignacion.modulo_id = idModulo;
    asignacion.permiso_id = idPermiso;
    asignacion.userUpdate = idUsuario;
    asignacion.usuarioActualizador = this.usuarioRepository.create({
      idUsuario,
    });

    try {
      await this.asignacionRepository.save(asignacion);
      return { message: 'Asignación actualizada correctamente.' };
    } catch (error: unknown) {
      this.logger.error(
        `Error al actualizar la asignación. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'No se pudo actualizar el registro.',
      );
    }
  }

  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<RolModuloPermisoMessageResponse> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException('No existe una asignación con ese ID.');
    }

    const activar = asignacion.estado !== 'ACTIVO';
    if (activar) {
      await this.validarReferencias(
        asignacion.rol_id,
        asignacion.modulo_id,
        asignacion.permiso_id,
      );
    }
    asignacion.estado = activar ? 'ACTIVO' : 'INACTIVO';
    asignacion.deletedAt = activar ? null : new Date();
    asignacion.userDeleted = activar ? null : idUsuario;
    asignacion.userUpdate = activar ? idUsuario : null;
    asignacion.usuarioActualizador = activar
      ? this.usuarioRepository.create({ idUsuario })
      : null;

    try {
      await this.asignacionRepository.save(asignacion);
      return { message: 'Estado de la asignación cambiado correctamente.' };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar el estado de la asignación. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del registro.',
      );
    }
  }

  private async validarReferencias(
    idRol: string,
    idModulo: string,
    idPermiso: string,
  ): Promise<void> {
    const [rol, modulo, permiso] = await Promise.all([
      this.rolRepository.findOneBy({ id: idRol }),
      this.moduloRepository.findOneBy({ id: idModulo }),
      this.permisoRepository.findOneBy({ id: idPermiso }),
    ]);

    if (!rol) throw new NotFoundException('No existe el rol indicado.');
    if (!modulo) throw new NotFoundException('No existe el módulo indicado.');
    if (!permiso) throw new NotFoundException('No existe el permiso indicado.');
    if (rol.estado !== 'ACTIVO') {
      throw new BadRequestException('El rol indicado se encuentra inactivo.');
    }
    if (modulo.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'El módulo indicado se encuentra inactivo.',
      );
    }
    if (permiso.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'El permiso indicado se encuentra inactivo.',
      );
    }
  }

  private async validarDuplicado(
    idRol: string,
    idModulo: string,
    idPermiso: string,
    idExcluir?: string,
  ): Promise<void> {
    const filtros: FindOptionsWhere<RolModuloPermiso> = {
      rol_id: idRol,
      modulo_id: idModulo,
      permiso_id: idPermiso,
    };
    const consulta = this.asignacionRepository
      .createQueryBuilder('asignacion')
      .where(filtros);
    if (idExcluir) {
      consulta.andWhere('asignacion.id != :idExcluir', { idExcluir });
    }

    if (await consulta.getOne()) {
      throw new ConflictException(
        'Ya existe una asignación para ese rol, módulo y permiso.',
      );
    }
  }
}
