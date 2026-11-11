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
import { Rol } from '../rol/entities/rol.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateUsuarioRolDto } from './dto/create-usuario-rol.dto';
import { QueryUsuarioRolDto } from './dto/query-usuario-rol.dto';
import { UpdateUsuarioRolDto } from './dto/update-usuario-rol.dto';
import { UsuarioRol } from './entities/usuario-rol.entity';
import {
  UsuarioRolMessageResponse,
  UsuarioRolResponse,
} from './interface/usuario-rol-response.interface';
import { mapearRespuestaUsuarioRol } from './util/map-response-usuario-rol.util';

@Injectable()
export class UsuarioRolService {
  private readonly logger = new Logger(UsuarioRolService.name);

  constructor(
    @InjectRepository(UsuarioRol)
    private readonly asignacionRepository: Repository<UsuarioRol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async crear(
    dto: CreateUsuarioRolDto,
    idUsuarioResponsable: string,
  ): Promise<UsuarioRolMessageResponse> {
    await this.validarReferencias(dto.id_usuario, dto.id_rol);
    await this.validarDuplicado(dto.id_usuario, dto.id_rol);

    const asignacion = this.asignacionRepository.create({
      id: randomUUID(),
      idUsuario: dto.id_usuario,
      idRol: dto.id_rol,
      estado: 'ACTIVO',
      userCreated: idUsuarioResponsable,
      usuarioCreador: this.usuarioRepository.create({
        idUsuario: idUsuarioResponsable,
      }),
    });

    try {
      await this.asignacionRepository.save(asignacion);
      return { message: 'Asignación de rol registrada correctamente.' };
    } catch (error: unknown) {
      this.logger.error(
        'Error al crear la asignación de rol.',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('No se pudo guardar el registro.');
    }
  }

  async listar(
    query: QueryUsuarioRolDto,
  ): Promise<PaginatedResponse<UsuarioRolResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      id_usuario,
      id_rol,
    } = query;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const consulta = this.asignacionRepository
      .createQueryBuilder('asignacion')
      .leftJoinAndSelect('asignacion.usuario', 'usuario')
      .leftJoinAndSelect('asignacion.rol', 'rol')
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
    if (id_usuario) {
      consulta.andWhere('asignacion.idUsuario = :id_usuario', { id_usuario });
    }
    if (id_rol) {
      consulta.andWhere('asignacion.idRol = :id_rol', { id_rol });
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
          qb.where('usuario.username ILIKE :termino', { termino })
            .orWhere('usuario.nombres ILIKE :termino', { termino })
            .orWhere('usuario.ci ILIKE :termino', { termino })
            .orWhere('rol.nombre ILIKE :termino', { termino })
            .orWhere('rol.codigo ILIKE :termino', { termino });
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
        items: asignaciones.map(mapearRespuestaUsuarioRol),
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
        `Error al listar asignaciones de rol. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async buscarPorId(id: string): Promise<UsuarioRolResponse> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
        rol: true,
        usuarioCreador: true,
        usuarioActualizador: true,
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'No existe una asignación de rol con ese ID.',
      );
    }
    return mapearRespuestaUsuarioRol(asignacion);
  }

  async actualizar(
    id: string,
    dto: UpdateUsuarioRolDto,
    idUsuarioResponsable: string,
  ): Promise<UsuarioRolMessageResponse> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'No existe una asignación de rol con ese ID.',
      );
    }
    if (asignacion.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar una asignación de rol inactiva.',
      );
    }

    const idUsuario = dto.id_usuario ?? asignacion.idUsuario;
    const idRol = dto.id_rol ?? asignacion.idRol;
    await this.validarReferencias(idUsuario, idRol);
    await this.validarDuplicado(idUsuario, idRol, id);

    asignacion.idUsuario = idUsuario;
    asignacion.idRol = idRol;
    asignacion.userUpdate = idUsuarioResponsable;
    asignacion.usuarioActualizador = this.usuarioRepository.create({
      idUsuario: idUsuarioResponsable,
    });

    try {
      await this.asignacionRepository.save(asignacion);
      return { message: 'Asignación de rol actualizada correctamente.' };
    } catch (error: unknown) {
      this.logger.error(
        `Error al actualizar la asignación de rol. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'No se pudo actualizar el registro.',
      );
    }
  }

  async cambiarEstado(
    id: string,
    idUsuarioResponsable: string,
  ): Promise<UsuarioRolMessageResponse> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'No existe una asignación de rol con ese ID.',
      );
    }

    const activar = asignacion.estado !== 'ACTIVO';
    if (activar) {
      await this.validarReferencias(asignacion.idUsuario, asignacion.idRol);
    }
    asignacion.estado = activar ? 'ACTIVO' : 'INACTIVO';
    asignacion.deletedAt = activar ? null : new Date();
    asignacion.userDeleted = activar ? null : idUsuarioResponsable;
    asignacion.userUpdate = activar ? idUsuarioResponsable : null;
    asignacion.usuarioActualizador = activar
      ? this.usuarioRepository.create({ idUsuario: idUsuarioResponsable })
      : null;

    try {
      await this.asignacionRepository.save(asignacion);
      return {
        message: 'Estado de la asignación de rol cambiado correctamente.',
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar el estado de la asignación de rol. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del registro.',
      );
    }
  }

  private async validarReferencias(
    idUsuario: string,
    idRol: string,
  ): Promise<void> {
    const [usuario, rol] = await Promise.all([
      this.usuarioRepository.findOneBy({ idUsuario }),
      this.rolRepository.findOneBy({ id: idRol }),
    ]);

    if (!usuario || usuario.deletedAt) {
      throw new NotFoundException('No existe el usuario indicado.');
    }
    if (!rol) throw new NotFoundException('No existe el rol indicado.');
    if (usuario.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'El usuario indicado se encuentra inactivo.',
      );
    }
    if (rol.estado !== 'ACTIVO') {
      throw new BadRequestException('El rol indicado se encuentra inactivo.');
    }
  }

  private async validarDuplicado(
    idUsuario: string,
    idRol: string,
    idExcluir?: string,
  ): Promise<void> {
    const filtros: FindOptionsWhere<UsuarioRol> = { idUsuario, idRol };
    const consulta = this.asignacionRepository
      .createQueryBuilder('asignacion')
      .where(filtros);
    if (idExcluir) {
      consulta.andWhere('asignacion.id != :idExcluir', { idExcluir });
    }

    if (await consulta.getOne()) {
      throw new ConflictException(
        'Ya existe una asignación para ese usuario y rol.',
      );
    }
  }
}
