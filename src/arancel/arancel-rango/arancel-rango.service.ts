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
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { CreateArancelRangoDto } from './dto/create-arancel-rango.dto';
import { QueryArancelRangoDto } from './dto/query-arancel-rango.dto';
import { UpdateArancelRangoDto } from './dto/update-arancel-rango.dto';
import { ArancelRango } from './entities/arancel-rango.entity';
import {
  ArancelRangoMessageResponse,
  ArancelRangoResponse,
} from './interface/arancel-rango-response.interface';
import { mapearRespuestaArancelRango } from './util/map-response-arancel-rango.util';

@Injectable()
export class ArancelRangoService {
  private readonly logger = new Logger(ArancelRangoService.name);

  constructor(
    @InjectRepository(ArancelRango)
    private readonly arancelRangoRepository: Repository<ArancelRango>,
  ) {}

  async crear(
    dto: CreateArancelRangoDto,
    idUsuario: string,
  ): Promise<ArancelRangoMessageResponse> {
    this.validarLimites(dto.desde, dto.hasta);
    const rango = this.arancelRangoRepository.create({
      ...dto,
      usuario_creador: { idUsuario } as Usuario,
    });
    try {
      await this.arancelRangoRepository.save(rango);
      return { message: 'Arancel rango registrado correctamente.' };
    } catch (error: unknown) {
      this.logger.error(
        'Error al crear el arancel rango.',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('No se pudo guardar el registro.');
    }
  }

  async listar(
    query: QueryArancelRangoDto,
  ): Promise<PaginatedResponse<ArancelRangoResponse>> {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortOrder,
      arancel_det_id,
      tarifa_id,
    } = query;
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const filtros: FindOptionsWhere<ArancelRango> = {};
    if (status && status !== 'TODOS') filtros.estado = status;
    else if (!status) filtros.estado = 'ACTIVO';
    if (arancel_det_id) filtros.arancel_det_id = arancel_det_id;
    if (tarifa_id) filtros.tarifa_id = tarifa_id;
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

    const [rangos, total] = await this.arancelRangoRepository.findAndCount({
      where: [filtros],
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
      items: rangos.map(mapearRespuestaArancelRango),
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

  async buscarPorId(id: string): Promise<ArancelRangoResponse> {
    const rango = await this.arancelRangoRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });
    if (!rango) {
      throw new NotFoundException('No existe un arancel rango con ese ID.');
    }
    return mapearRespuestaArancelRango(rango);
  }

  async actualizar(
    id: string,
    dto: UpdateArancelRangoDto,
    idUsuario: string,
  ): Promise<ArancelRangoMessageResponse> {
    const rango = await this.arancelRangoRepository.findOne({ where: { id } });
    if (!rango) {
      throw new NotFoundException('No existe un arancel rango con ese ID.');
    }
    if (rango.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar un arancel rango inactivo.',
      );
    }
    this.validarLimites(
      dto.desde ?? rango.desde,
      dto.hasta === undefined ? rango.hasta : dto.hasta,
    );

    Object.assign(rango, dto);
    rango._updated_at = new Date();
    rango._user_update = idUsuario;
    rango.usuario_actualizador = { idUsuario } as Usuario;
    await this.arancelRangoRepository.save(rango);
    return { message: 'Arancel rango actualizado correctamente.' };
  }

  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<ArancelRangoMessageResponse> {
    const rango = await this.arancelRangoRepository.findOne({ where: { id } });
    if (!rango) {
      throw new NotFoundException('No existe un arancel rango con ese ID.');
    }
    rango.estado = rango.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (rango.estado === 'INACTIVO') {
      rango._deleted_at = new Date();
      rango._user_delete = idUsuario;
      rango._updated_at = null;
      rango._user_update = null;
    } else {
      rango._deleted_at = null;
      rango._user_delete = null;
      rango._updated_at = new Date();
      rango._user_update = idUsuario;
    }
    await this.arancelRangoRepository.save(rango);
    return { message: 'Estado del arancel rango cambiado correctamente.' };
  }

  private validarLimites(desde: number, hasta?: number | null): void {
    if (hasta !== null && hasta !== undefined && hasta < desde) {
      throw new BadRequestException(
        'El límite hasta no puede ser menor que el límite desde.',
      );
    }
  }
}
