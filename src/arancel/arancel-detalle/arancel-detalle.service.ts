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
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { ArancelGeneralService } from '../arancel-general/arancel-general.service';
import { TipoTramiteCatalogoService } from '../tipo-tramite-catalogo/tipo-tramite-catalogo.service';

@Injectable()
export class ArancelDetalleService {
  private readonly logger = new Logger(ArancelDetalleService.name);

  constructor(
    @InjectRepository(ArancelDetalle)
    private readonly arancelDetalleRepository: Repository<ArancelDetalle>,
    private readonly arancelGeneralService: ArancelGeneralService,
    private readonly tipoTramiteCatalogoService: TipoTramiteCatalogoService,
  ) {}

  async crear(
    dto: CreateArancelDetalleDto,
    idUsuario: string,
  ): Promise<ArancelDetalleMessageResponse> {
    try {
      // Validar que el arancel general exista y esté activo.
      await this.arancelGeneralService.validarArancelGeneral(
        dto.arancel_general_id,
      );

      // Validar que el tipo de trámite exista y esté activo.
      await this.tipoTramiteCatalogoService.validarTipoTramiteActivo(
        dto.tipo_tramite_id,
      );

      // Verificar que el número de arancel no esté registrado.
      const existe = await this.arancelDetalleRepository.findOne({
        where: {
          nro_arancel_det: dto.nro_arancel_det,
        },
      });

      if (existe) {
        throw new ConflictException(
          'El número de arancel ya se encuentra registrado.',
        );
      }

      const detalle = this.arancelDetalleRepository.create({
        ...dto,
        monto_variable: dto.monto_variable ?? false,
        usuario_creador: { id: idUsuario } as Usuario,
      });

      await this.arancelDetalleRepository.save(detalle);

      return {
        message: 'Arancel detalle registrado correctamente.',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'El número de arancel ya se encuentra registrado.',
        );
      }

      this.logger.error(
        'Error al crear el arancel detalle.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo registrar el arancel detalle.',
      );
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
      order: { createdAt: sortOrder ?? 'DESC' },
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
    try {
      const detalle = await this.arancelDetalleRepository.findOne({
        where: { id },
      });

      if (!detalle) {
        throw new NotFoundException(
          'No existe un arancel detalle con el ID proporcionado.',
        );
      }

      if (detalle.estado !== 'ACTIVO') {
        throw new BadRequestException(
          'No se puede actualizar un arancel detalle inactivo.',
        );
      }

      // Evitar valores nulos en campos obligatorios.
      if (
        ('arancel_general_id' in dto && dto.arancel_general_id == null) ||
        ('tipo_tramite_id' in dto && dto.tipo_tramite_id == null) ||
        ('nro_arancel_det' in dto && dto.nro_arancel_det == null) ||
        ('descripcion' in dto && dto.descripcion == null) ||
        ('monto_variable' in dto && dto.monto_variable == null)
      ) {
        throw new BadRequestException(
          'Los campos obligatorios no pueden contener valores nulos.',
        );
      }

      // Validar el arancel general si fue enviado.
      if (dto.arancel_general_id !== undefined) {
        await this.arancelGeneralService.validarArancelGeneral(
          dto.arancel_general_id,
        );
      }

      // Validar el tipo de trámite si fue enviado.
      if (dto.tipo_tramite_id !== undefined) {
        await this.tipoTramiteCatalogoService.validarTipoTramiteActivo(
          dto.tipo_tramite_id,
        );
      }

      // Verificar que el número no pertenezca a otro detalle.
      if (dto.nro_arancel_det !== undefined) {
        const existe = await this.arancelDetalleRepository.findOne({
          where: {
            nro_arancel_det: dto.nro_arancel_det,
          },
        });

        if (existe && existe.id !== id) {
          throw new ConflictException(
            'El número de arancel ya está registrado en otro detalle.',
          );
        }
      }

      Object.assign(detalle, dto);

      detalle.updatedAt = new Date();
      detalle._user_update = idUsuario;
      detalle.usuario_actualizador = { id: idUsuario } as Usuario;

      await this.arancelDetalleRepository.save(detalle);

      return {
        message: 'Arancel detalle actualizado correctamente.',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'El número de arancel ya se encuentra registrado.',
        );
      }

      this.logger.error(
        'Error al actualizar el arancel detalle.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo actualizar el arancel detalle.',
      );
    }
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
      detalle.deletedAt = new Date();
      detalle._user_delete = idUsuario;
      detalle.updatedAt = null;
      detalle._user_update = null;
    } else {
      detalle.deletedAt = null;
      detalle._user_delete = null;
      detalle.updatedAt = new Date();
      detalle._user_update = idUsuario;
    }
    await this.arancelDetalleRepository.save(detalle);
    return { message: 'Estado del arancel detalle cambiado correctamente.' };
  }

  async validarArancelDetalleActivo(id: string): Promise<void> {
    const detalle = await this.arancelDetalleRepository.findOne({
      where: { id },
    });

    if (!detalle) {
      throw new NotFoundException(
        'No se encontró el arancel detalle solicitado.',
      );
    }

    if (detalle.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'El arancel detalle seleccionado se encuentra inactivo.',
      );
    }
  }
}
