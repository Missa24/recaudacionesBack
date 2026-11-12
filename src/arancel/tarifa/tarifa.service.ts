import {
  BadRequestException,
  ConflictException,
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
  IsNull,
  LessThan,
  MoreThan,
  MoreThanOrEqual,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { QueryTarifaDto } from './dto/query-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { Tarifa } from './entities/tarifa.entity';
import {
  TarifaMessageResponse,
  TarifaResponse,
} from './interface/tarifa-response.interface';
import { mapearRespuestaTarifa } from './util/map-response-tarifa.util';
import { ArancelDetalleService } from '../arancel-detalle/arancel-detalle.service';
import { validarVigencia } from './util/validar-vigencia-tarifa.util';
import { validarMonto } from './util/validar-monto-tarifa.util';
import { validarReferencia } from './util/validar-referencia-tarifa.util';

@Injectable()
export class TarifaService {
  private readonly logger = new Logger(TarifaService.name);

  constructor(
    @InjectRepository(Tarifa)
    private readonly tarifaRepository: Repository<Tarifa>,

    private readonly arancelDetalleService: ArancelDetalleService,
  ) {}

  async crear(
    dto: CreateTarifaDto,
    idUsuario: string,
  ): Promise<TarifaMessageResponse> {
    // Validaciones generales
    validarVigencia(dto.vigente_desde, dto.vigente_hasta);
    validarMonto(dto.monto);
    validarReferencia(dto.referencia_aprobacion);

    // Validación del arancel detalle
    await this.arancelDetalleService.validarArancelDetalleActivo(
      dto.arancel_det_id,
    );

    // Buscar vigencias superpuestas mediante ORM
    const vigenteHasta = dto.vigente_hasta ?? null;

    const condiciones: FindOptionsWhere<Tarifa>[] =
      vigenteHasta === null
        ? [
            {
              arancel_det_id: dto.arancel_det_id,
              vigente_hasta: IsNull(),
            },
            {
              arancel_det_id: dto.arancel_det_id,
              vigente_hasta: MoreThan(dto.vigente_desde),
            },
          ]
        : [
            {
              arancel_det_id: dto.arancel_det_id,
              vigente_desde: LessThan(vigenteHasta),
              vigente_hasta: IsNull(),
            },
            {
              arancel_det_id: dto.arancel_det_id,
              vigente_desde: LessThan(vigenteHasta),
              vigente_hasta: MoreThan(dto.vigente_desde),
            },
          ];

    const tarifaExistente = await this.tarifaRepository.findOne({
      where: condiciones,
    });

    if (tarifaExistente) {
      throw new ConflictException(
        'Ya existe una tarifa para este arancel con una vigencia superpuesta.',
      );
    }

    const ahora = new Date();

    const tarifa = this.tarifaRepository.create({
      ...dto,
      vigente_hasta: vigenteHasta,
      estado: 'ACTIVO',
      createdAt: ahora,
      updatedAt: ahora,
      usuario_creador: { id: idUsuario } as Usuario,
    });

    try {
      await this.tarifaRepository.save(tarifa);

      return {
        message: 'Tarifa registrada correctamente.',
      };
    } catch (error: unknown) {
      this.manejarErrorBD(error, 'Error al crear una tarifa.');

      throw new InternalServerErrorException('No se pudo guardar el registro.');
    }
  }

  async listar(
    query: QueryTarifaDto,
  ): Promise<PaginatedResponse<TarifaResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortOrder,
      arancel_det_id,
      vigente_desde,
      vigente_hasta,
    } = query;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const filtros: FindOptionsWhere<Tarifa> = {};

    if (status && status !== 'TODOS') {
      filtros.estado = status;
    } else if (!status) {
      filtros.estado = 'ACTIVO';
    }

    if (arancel_det_id) {
      filtros.arancel_det_id = arancel_det_id;
    }

    if (vigente_desde) {
      filtros.vigente_desde = vigente_desde;
    }

    if (vigente_hasta) {
      filtros.vigente_hasta = vigente_hasta;
    }

    if (startDate && endDate) {
      filtros.createdAt = And(
        MoreThanOrEqual(new Date(`${startDate}T00:00:00.000`)),
        LessThan(
          new Date(new Date(`${endDate}T00:00:00.000`).getTime() + 86400000),
        ),
      );
    } else if (startDate) {
      filtros.createdAt = MoreThanOrEqual(
        new Date(`${startDate}T00:00:00.000`),
      );
    } else if (endDate) {
      filtros.createdAt = LessThan(
        new Date(new Date(`${endDate}T00:00:00.000`).getTime() + 86400000),
      );
    }

    if (search?.trim()) {
      filtros.referencia_aprobacion = ILike(`%${search.trim()}%`);
    }

    const [tarifas, total] = await this.tarifaRepository.findAndCount({
      where: [filtros],
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
      order: { createdAt: sortOrder ?? 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: tarifas.map(mapearRespuestaTarifa),
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

  async buscarPorId(id: string): Promise<TarifaResponse> {
    const tarifa = await this.tarifaRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!tarifa) {
      throw new NotFoundException('No existe una tarifa con ese ID.');
    }

    return mapearRespuestaTarifa(tarifa);
  }

  async actualizar(
    id: string,
    dto: UpdateTarifaDto,
    idUsuario: string,
  ): Promise<TarifaMessageResponse> {
    const tarifa = await this.tarifaRepository.findOne({
      where: { id },
    });

    if (!tarifa) {
      throw new NotFoundException('No existe una tarifa con ese ID.');
    }

    if (tarifa.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar una tarifa inactiva.',
      );
    }

    // Obtener los valores finales, combinando los datos actuales y el DTO
    const vigenteDesde = dto.vigente_desde ?? tarifa.vigente_desde;

    const vigenteHasta =
      dto.vigente_hasta === undefined
        ? tarifa.vigente_hasta
        : dto.vigente_hasta;

    const arancelDetalleId = dto.arancel_det_id ?? tarifa.arancel_det_id;

    const monto = dto.monto ?? tarifa.monto;

    const referencia =
      dto.referencia_aprobacion ?? tarifa.referencia_aprobacion;

    // Validaciones generales
    validarVigencia(vigenteDesde, vigenteHasta);
    validarMonto(monto);
    validarReferencia(referencia);

    // Validar arancel detalle si se está modificando
    if (dto.arancel_det_id !== undefined) {
      await this.arancelDetalleService.validarArancelDetalleActivo(
        dto.arancel_det_id,
      );
    }

    // Buscar vigencias superpuestas, excluyendo el registro actual
    const condiciones: FindOptionsWhere<Tarifa>[] =
      vigenteHasta === null
        ? [
            {
              arancel_det_id: arancelDetalleId,
              vigente_hasta: IsNull(),
              id: Not(id),
            },
            {
              arancel_det_id: arancelDetalleId,
              vigente_hasta: MoreThan(vigenteDesde),
              id: Not(id),
            },
          ]
        : [
            {
              arancel_det_id: arancelDetalleId,
              vigente_desde: LessThan(vigenteHasta),
              vigente_hasta: IsNull(),
              id: Not(id),
            },
            {
              arancel_det_id: arancelDetalleId,
              vigente_desde: LessThan(vigenteHasta),
              vigente_hasta: MoreThan(vigenteDesde),
              id: Not(id),
            },
          ];

    const tarifaExistente = await this.tarifaRepository.findOne({
      where: condiciones,
    });

    if (tarifaExistente) {
      throw new ConflictException(
        'Ya existe una tarifa para este arancel con una vigencia superpuesta.',
      );
    }

    Object.assign(tarifa, dto);

    const ahora = new Date();

    tarifa.updatedAt = ahora;
    tarifa._user_update = idUsuario;
    tarifa.usuario_actualizador = { id: idUsuario } as Usuario;

    try {
      await this.tarifaRepository.save(tarifa);

      return {
        message: 'Tarifa actualizada correctamente.',
      };
    } catch (error: unknown) {
      this.manejarErrorBD(error, 'Error al actualizar una tarifa.');

      throw new InternalServerErrorException(
        'No se pudo actualizar el registro.',
      );
    }
  }

  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<TarifaMessageResponse> {
    const tarifa = await this.tarifaRepository.findOne({
      where: { id },
    });

    if (!tarifa) {
      throw new NotFoundException('No existe una tarifa con ese ID.');
    }

    const ahora = new Date();

    if (tarifa.estado === 'ACTIVO') {
      tarifa.estado = 'INACTIVO';
      tarifa.deletedAt = ahora;
      tarifa._user_delete = idUsuario;
      tarifa.usuario_eliminador = { id: idUsuario } as Usuario;
    } else {
      // Antes de reactivar, comprobar que no exista otra tarifa
      // con una vigencia superpuesta.
      const condiciones: FindOptionsWhere<Tarifa>[] =
        tarifa.vigente_hasta === null
          ? [
              {
                arancel_det_id: tarifa.arancel_det_id,
                vigente_hasta: IsNull(),
                id: Not(id),
              },
              {
                arancel_det_id: tarifa.arancel_det_id,
                vigente_hasta: MoreThan(tarifa.vigente_desde),
                id: Not(id),
              },
            ]
          : [
              {
                arancel_det_id: tarifa.arancel_det_id,
                vigente_desde: LessThan(tarifa.vigente_hasta),
                vigente_hasta: IsNull(),
                id: Not(id),
              },
              {
                arancel_det_id: tarifa.arancel_det_id,
                vigente_desde: LessThan(tarifa.vigente_hasta),
                vigente_hasta: MoreThan(tarifa.vigente_desde),
                id: Not(id),
              },
            ];

      const tarifaExistente = await this.tarifaRepository.findOne({
        where: condiciones,
      });

      if (tarifaExistente) {
        throw new ConflictException(
          'No se puede reactivar la tarifa porque existe otra tarifa con una vigencia superpuesta.',
        );
      }

      tarifa.estado = 'ACTIVO';
      tarifa.deletedAt = null;
      tarifa._user_delete = null;
      tarifa.usuario_eliminador = null;
    }

    tarifa.updatedAt = ahora;
    tarifa._user_update = idUsuario;
    tarifa.usuario_actualizador = { id: idUsuario } as Usuario;

    try {
      await this.tarifaRepository.save(tarifa);

      return {
        message: 'Estado de la tarifa cambiado correctamente.',
      };
    } catch (error: unknown) {
      this.manejarErrorBD(error, 'Error al cambiar el estado de la tarifa.');

      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del registro.',
      );
    }
  }

  private manejarErrorBD(error: unknown, mensaje: string): void {
    this.logger.error(
      mensaje,
      error instanceof Error ? error.stack : String(error),
    );

    if (error instanceof QueryFailedError) {
      const driverError = (
        error as QueryFailedError & {
          driverError: { code?: string };
        }
      ).driverError;

      if (driverError?.code === '23505' || driverError?.code === '23P01') {
        throw new ConflictException(
          'El registro ya existe o presenta una vigencia superpuesta.',
        );
      }
    }
  }
}
