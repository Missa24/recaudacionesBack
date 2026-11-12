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
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { CreateRequisitoDto } from './dto/create-requisito.dto';
import { QueryRequisitoDto } from './dto/query-requisito.dto';
import { UpdateRequisitoDto } from './dto/update-requisito.dto';
import { ArancelRequisito } from './entities/requisito.entity';
import {
  RequisitoMessageResponse,
  RequisitoResponse,
} from './interface/requisito-response.interface';
import { mapearRespuestaRequisito } from './util/map-response-requisito.util';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { TipoTramiteCatalogoService } from '../tipo-tramite-catalogo/tipo-tramite-catalogo.service';
import { RequisitoService as RequisitoServiceCatalogo } from 'src/catalogo/requisito/requisito.service';

@Injectable()
export class RequisitoService {
  private readonly logger = new Logger(RequisitoService.name);

  constructor(
    @InjectRepository(ArancelRequisito)
    private readonly requisitoRepository: Repository<ArancelRequisito>,
    private readonly tipoTramiteCatalogoService: TipoTramiteCatalogoService,
    private readonly requisitoCatalogoService: RequisitoServiceCatalogo,
  ) {}

  async crear(
    dto: CreateRequisitoDto,
    idUsuario: string,
  ): Promise<RequisitoMessageResponse> {
    try {
      await this.tipoTramiteCatalogoService.validarTipoTramiteActivo(
        dto.tipo_tramite_id,
      );

      await this.requisitoCatalogoService.validarRequisitoActivo(
        dto.requisito_catalogo_id,
      );

      const existe = await this.requisitoRepository.findOne({
        where: {
          tipo_tramite_id: dto.tipo_tramite_id,
          requisito_catalogo_id: dto.requisito_catalogo_id,
        },
      });

      if (existe) {
        throw new ConflictException(
          'Este requisito ya está asignado al tipo de trámite seleccionado.',
        );
      }

      const requisito = this.requisitoRepository.create({
        ...dto,
        obligatorio: dto.obligatorio ?? true,
        orden: dto.orden ?? 1,
        usuario_creador: { idUsuario } as Usuario,
      });

      await this.requisitoRepository.save(requisito);

      return {
        message: 'Requisito de arancel registrado correctamente.',
      };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Este requisito ya está asignado al tipo de trámite seleccionado.',
        );
      }

      this.logger.error(
        'Error al crear el requisito de arancel.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('No se pudo guardar el registro.');
    }
  }

  async listar(
    query: QueryRequisitoDto,
  ): Promise<PaginatedResponse<RequisitoResponse>> {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortOrder,
      tipo_tramite_id,
      requisito_catalogo_id,
    } = query;
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const filtros: FindOptionsWhere<ArancelRequisito> = {};
    if (status && status !== 'TODOS') filtros.estado = status;
    else if (!status) filtros.estado = 'ACTIVO';
    if (tipo_tramite_id) filtros.tipo_tramite_id = tipo_tramite_id;
    if (requisito_catalogo_id) {
      filtros.requisito_catalogo_id = requisito_catalogo_id;
    }
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

    const [requisitos, total] = await this.requisitoRepository.findAndCount({
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
      items: requisitos.map(mapearRespuestaRequisito),
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

  async buscarPorId(id: string): Promise<RequisitoResponse> {
    const requisito = await this.requisitoRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });
    if (!requisito) {
      throw new NotFoundException(
        'No existe un requisito de arancel con ese ID.',
      );
    }
    return mapearRespuestaRequisito(requisito);
  }

  async actualizar(
    id: string,
    dto: UpdateRequisitoDto,
    idUsuario: string,
  ): Promise<RequisitoMessageResponse> {
    try {
      const requisito = await this.requisitoRepository.findOne({
        where: { id },
      });

      if (!requisito) {
        throw new NotFoundException(
          'No existe un requisito de arancel con ese ID.',
        );
      }

      if (requisito.estado !== 'ACTIVO') {
        throw new BadRequestException(
          'No se puede actualizar un requisito de arancel inactivo.',
        );
      }

      if (
        ('tipo_tramite_id' in dto && dto.tipo_tramite_id == null) ||
        ('requisito_catalogo_id' in dto && dto.requisito_catalogo_id == null)
      ) {
        throw new BadRequestException(
          'El tipo de trámite y el requisito del catálogo son obligatorios.',
        );
      }

      const tipoTramiteId = dto.tipo_tramite_id ?? requisito.tipo_tramite_id;

      const requisitoCatalogoId =
        dto.requisito_catalogo_id ?? requisito.requisito_catalogo_id;

      if (dto.tipo_tramite_id !== undefined) {
        await this.tipoTramiteCatalogoService.validarTipoTramiteActivo(
          dto.tipo_tramite_id,
        );
      }

      if (dto.requisito_catalogo_id !== undefined) {
        await this.requisitoCatalogoService.validarRequisitoActivo(
          dto.requisito_catalogo_id,
        );
      }

      const existe = await this.requisitoRepository.findOne({
        where: {
          tipo_tramite_id: tipoTramiteId,
          requisito_catalogo_id: requisitoCatalogoId,
        },
      });

      if (existe && existe.id !== id) {
        throw new ConflictException(
          'Este requisito ya está asignado al tipo de trámite seleccionado.',
        );
      }

      Object.assign(requisito, dto);

      requisito._updated_at = new Date();
      requisito._user_update = idUsuario;
      requisito.usuario_actualizador = { idUsuario } as Usuario;

      await this.requisitoRepository.save(requisito);

      return {
        message: 'Requisito de arancel actualizado correctamente.',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Este requisito ya está asignado al tipo de trámite seleccionado.',
        );
      }

      this.logger.error(
        'Error al actualizar el requisito de arancel.',
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
  ): Promise<RequisitoMessageResponse> {
    const requisito = await this.requisitoRepository.findOne({ where: { id } });
    if (!requisito) {
      throw new NotFoundException(
        'No existe un requisito de arancel con ese ID.',
      );
    }
    requisito.estado = requisito.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (requisito.estado === 'INACTIVO') {
      requisito._deleted_at = new Date();
      requisito._user_delete = idUsuario;
      requisito._updated_at = null;
      requisito._user_update = null;
    } else {
      requisito._deleted_at = null;
      requisito._user_delete = null;
      requisito._updated_at = new Date();
      requisito._user_update = idUsuario;
    }
    await this.requisitoRepository.save(requisito);
    return {
      message: `Registro del requisito de arancel ${requisito.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
    };
  }
}
