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
import { CreateTipoTramiteCatalogoDto } from './dto/create-tipo-tramite-catalogo.dto';
import { QueryTipoTramiteCatalogoDto } from './dto/query-tipo-tramite-catalogo.dto';
import { UpdateTipoTramiteCatalogoDto } from './dto/update-tipo-tramite-catalogo.dto';
import { TipoTramiteCatalogo } from './entities/tipo-tramite-catalogo.entity';
import {
  TipoTramiteCatalogoMessageResponse,
  TipoTramiteCatalogoResponse,
} from './interface/tipo-tramite-catalogo-response.interface';
import { mapearRespuestaTipoTramiteCatalogo } from './util/map-response-tipo-tramite-catalogo.util';

@Injectable()
export class TipoTramiteCatalogoService {
  private readonly logger = new Logger(TipoTramiteCatalogoService.name);

  constructor(
    @InjectRepository(TipoTramiteCatalogo)
    private readonly tipoTramiteRepository: Repository<TipoTramiteCatalogo>,
  ) {}

  async crear(
    dto: CreateTipoTramiteCatalogoDto,
    idUsuario: string,
  ): Promise<TipoTramiteCatalogoMessageResponse> {
    const tipo = this.tipoTramiteRepository.create({
      ...dto,
      usuario_creador: { idUsuario } as Usuario,
    });
    try {
      await this.tipoTramiteRepository.save(tipo);
      return { message: 'Tipo de trámite registrado correctamente.' };
    } catch (error: unknown) {
      this.logger.error(
        'Error al crear el tipo de trámite.',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('No se pudo guardar el registro.');
    }
  }

  async listar(
    query: QueryTipoTramiteCatalogoDto,
  ): Promise<PaginatedResponse<TipoTramiteCatalogoResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortOrder,
      dependencia_ejecutora_id,
      codigo,
      nombre,
    } = query;
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const filtros: FindOptionsWhere<TipoTramiteCatalogo> = {};
    if (status && status !== 'TODOS') filtros.estado = status;
    else if (!status) filtros.estado = 'ACTIVO';
    if (dependencia_ejecutora_id) {
      filtros.dependencia_ejecutora_id = dependencia_ejecutora_id;
    }
    if (codigo) filtros.codigo = ILike(`%${codigo.trim()}%`);
    if (nombre) filtros.nombre = ILike(`%${nombre.trim()}%`);
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
    const condiciones: FindOptionsWhere<TipoTramiteCatalogo>[] = termino
      ? [
          { ...filtros, codigo: ILike(termino) },
          { ...filtros, nombre: ILike(termino) },
          { ...filtros, descripcion: ILike(termino) },
          { ...filtros, tipo_vut: ILike(termino) },
        ]
      : [filtros];
    const [tipos, total] = await this.tipoTramiteRepository.findAndCount({
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
      items: tipos.map(mapearRespuestaTipoTramiteCatalogo),
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

  async buscarPorId(id: string): Promise<TipoTramiteCatalogoResponse> {
    const tipo = await this.tipoTramiteRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });
    if (!tipo) {
      throw new NotFoundException('No existe un tipo de trámite con ese ID.');
    }
    return mapearRespuestaTipoTramiteCatalogo(tipo);
  }

  async actualizar(
    id: string,
    dto: UpdateTipoTramiteCatalogoDto,
    idUsuario: string,
  ): Promise<TipoTramiteCatalogoMessageResponse> {
    const tipo = await this.tipoTramiteRepository.findOne({ where: { id } });
    if (!tipo) {
      throw new NotFoundException('No existe un tipo de trámite con ese ID.');
    }
    if (tipo.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar un tipo de trámite inactivo.',
      );
    }
    Object.assign(tipo, dto);
    tipo._updated_at = new Date();
    tipo._user_update = idUsuario;
    tipo.usuario_actualizador = { idUsuario } as Usuario;
    await this.tipoTramiteRepository.save(tipo);
    return { message: 'Tipo de trámite actualizado correctamente.' };
  }

  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<TipoTramiteCatalogoMessageResponse> {
    const tipo = await this.tipoTramiteRepository.findOne({ where: { id } });
    if (!tipo) {
      throw new NotFoundException('No existe un tipo de trámite con ese ID.');
    }
    tipo.estado = tipo.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (tipo.estado === 'INACTIVO') {
      tipo._deleted_at = new Date();
      tipo._user_delete = idUsuario;
      tipo._updated_at = null;
      tipo._user_update = null;
    } else {
      tipo._deleted_at = null;
      tipo._user_delete = null;
      tipo._updated_at = new Date();
      tipo._user_update = idUsuario;
    }
    await this.tipoTramiteRepository.save(tipo);
    return { message: 'Estado del tipo de trámite cambiado correctamente.' };
  }
}
