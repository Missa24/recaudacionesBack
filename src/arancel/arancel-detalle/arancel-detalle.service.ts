import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import {
  And,
  FindOptionsWhere,
  ILike,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { CreateArancelDetalleDto } from './dto/create-arancel-detalle.dto';
import { QueryArancelDetalleDto } from './dto/query-arancel-detalle.dto';
import { UpdateArancelDetalleDto } from './dto/update-arancel-detalle.dto';
import { ArancelDetalle } from './entities/arancel-detalle.entity';
import {
  ArancelDetalleMessageResponse,
  ArancelDetalleResponse,
} from './interface/arancel-detalle-response.interface';
import { mapearRespuestaArancelDetalle } from './util/map-response-arancel-detalle.util';

@Injectable()
export class ArancelDetalleService {
  private readonly logger = new Logger(ArancelDetalleService.name);

  constructor(
    @InjectRepository(ArancelDetalle)
    private readonly arancelDetalleRepository: Repository<ArancelDetalle>,
  ) {}

  async crear(
    dto: CreateArancelDetalleDto,
    idUsuario: string,
  ): Promise<ArancelDetalleMessageResponse> {
    const detalle = this.arancelDetalleRepository.create({
      ...dto,
      usuario_creador: { idUsuario } as Usuario,
    });
    try {
      await this.arancelDetalleRepository.save(detalle);
      return { message: 'Arancel detalle registrado correctamente.' };
    } catch (error: unknown) {
      this.logger.error(
        'Error al crear el arancel detalle.',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('No se pudo guardar el registro.');
    }
  }

  async listar(
    query: QueryArancelDetalleDto,
  ): Promise<PaginatedResponse<ArancelDetalleResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortOrder,
      arancel_gral_id,
      tipo_tramite_id,
    } = query;
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const filtros: FindOptionsWhere<ArancelDetalle> = {};
    if (status && status !== 'TODOS') filtros.estado = status;
    else if (!status) filtros.estado = 'ACTIVO';
    if (arancel_gral_id) filtros.arancel_general_id = arancel_gral_id;
    if (tipo_tramite_id) filtros.tipo_tramite_id = tipo_tramite_id;
    if (startDate && endDate) {
      filtros._created_at = And(
        MoreThanOrEqual(new Date(`${startDate}T00:00:00.000`)),
        LessThan(
          new Date(new Date(`${endDate}T00:00:00.000`).getTime() + 86400000),
        ),
      );
    } else if (startDate) {
      filtros._created_at = MoreThanOrEqual(
        new Date(`${startDate}T00:00:00.000`),
      );
    } else if (endDate) {
      filtros._created_at = LessThan(
        new Date(new Date(`${endDate}T00:00:00.000`).getTime() + 86400000),
      );
    }

    const termino = search?.trim() ? `%${search.trim()}%` : undefined;
    const condiciones: FindOptionsWhere<ArancelDetalle>[] = termino
      ? [
          { ...filtros, nro_arancel_det: ILike(termino) },
          { ...filtros, descripcion: ILike(termino) },
        ]
      : [filtros];

    const [detalles, total] = await this.arancelDetalleRepository.findAndCount({
      where: condiciones,
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
      order: { _created_at: sortOrder ?? 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const totalPages = Math.ceil(total / limit);
    return {
      items: detalles.map(mapearRespuestaArancelDetalle),
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

  async buscarPorId(id: string): Promise<ArancelDetalleResponse> {
    const detalle = await this.arancelDetalleRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });
    if (!detalle) {
      throw new NotFoundException('No existe un arancel detalle con ese ID.');
    }
    return mapearRespuestaArancelDetalle(detalle);
  }

  async actualizar(
    id: string,
    dto: UpdateArancelDetalleDto,
    idUsuario: string,
  ): Promise<ArancelDetalleMessageResponse> {
    const detalle = await this.arancelDetalleRepository.findOne({
      where: { id },
    });
    if (!detalle) {
      throw new NotFoundException('No existe un arancel detalle con ese ID.');
    }
    if (detalle.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar un arancel detalle inactivo.',
      );
    }

    Object.assign(detalle, dto);
    detalle._updated_at = new Date();
    detalle._user_update = idUsuario;
    detalle.usuario_actualizador = { idUsuario } as Usuario;
    await this.arancelDetalleRepository.save(detalle);
    return { message: 'Arancel detalle actualizado correctamente.' };
  }

  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<ArancelDetalleMessageResponse> {
    const detalle = await this.arancelDetalleRepository.findOne({
      where: { id },
    });
    if (!detalle) {
      throw new NotFoundException('No existe un arancel detalle con ese ID.');
    }
    detalle.estado = detalle.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (detalle.estado === 'INACTIVO') {
      detalle._deleted_at = new Date();
      detalle._user_delete = idUsuario;
      detalle._updated_at = null;
      detalle._user_update = null;
    } else {
      detalle._deleted_at = null;
      detalle._user_delete = null;
      detalle._updated_at = new Date();
      detalle._user_update = idUsuario;
    }
    await this.arancelDetalleRepository.save(detalle);
    return { message: 'Estado del arancel detalle cambiado correctamente.' };
  }
}
