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
import { CreateTipoTramiteCatalogoDto } from './dto/create-tipo-tramite-catalogo.dto';
import { QueryTipoTramiteCatalogoDto } from './dto/query-tipo-tramite-catalogo.dto';
import { UpdateTipoTramiteCatalogoDto } from './dto/update-tipo-tramite-catalogo.dto';
import { TipoTramiteCatalogo } from './entities/tipo-tramite-catalogo.entity';
import {
  TipoTramiteCatalogoMessageResponse,
  TipoTramiteCatalogoResponse,
} from './interface/tipo-tramite-catalogo-response.interface';
import { mapearRespuestaTipoTramiteCatalogo } from './util/map-response-tipo-tramite-catalogo.util';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { DependenciaService } from 'src/catalogo/dependencia/dependencia.service';

@Injectable()
export class TipoTramiteCatalogoService {
  private readonly logger = new Logger(TipoTramiteCatalogoService.name);

  constructor(
    @InjectRepository(TipoTramiteCatalogo)
    private readonly tipoTramiteRepository: Repository<TipoTramiteCatalogo>,
    private readonly dependenciaService: DependenciaService,
  ) {}

  async crear(
    dto: CreateTipoTramiteCatalogoDto,
    idUsuario: string,
  ): Promise<TipoTramiteCatalogoMessageResponse> {
    try {
      if (dto.dependencia_ejecutora_id) {
        await this.dependenciaService.validarDependencia(
          dto.dependencia_ejecutora_id,
        );
      }

      const existe = await this.tipoTramiteRepository.findOne({
        where: { codigo: dto.codigo },
      });

      if (existe) {
        throw new ConflictException(
          'Ya existe un tipo de trámite con ese código.',
        );
      }

      const tipo = this.tipoTramiteRepository.create({
        ...dto,
        usuario_creador: { id: idUsuario } as Usuario,
      });

      await this.tipoTramiteRepository.save(tipo);

      return {
        message: 'Tipo de trámite registrado correctamente.',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe un tipo de trámite con ese código.',
        );
      }

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
      order: { createdAt: sortOrder ?? 'DESC' },
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
    try {
      const tipo = await this.tipoTramiteRepository.findOne({
        where: { id },
      });

      if (!tipo) {
        throw new NotFoundException('No existe un tipo de trámite con ese ID.');
      }

      if (tipo.estado !== 'ACTIVO') {
        throw new BadRequestException(
          'No se puede actualizar un tipo de trámite inactivo.',
        );
      }

      if (dto.dependencia_ejecutora_id) {
        await this.dependenciaService.validarDependencia(
          dto.dependencia_ejecutora_id,
        );
      }

      if (dto.codigo !== undefined) {
        const existe = await this.tipoTramiteRepository.findOne({
          where: { codigo: dto.codigo },
        });

        if (existe && existe.id !== id) {
          throw new ConflictException(
            'Ya existe otro tipo de trámite con ese código.',
          );
        }
      }

      Object.assign(tipo, dto);

      tipo.updatedAt = new Date();
      tipo._user_update = idUsuario;
      tipo.usuario_actualizador = { id: idUsuario } as Usuario;

      await this.tipoTramiteRepository.save(tipo);

      return {
        message: 'Tipo de trámite actualizado correctamente.',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe otro tipo de trámite con ese código.',
        );
      }

      this.logger.error(
        'Error al actualizar el tipo de trámite.',
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
  ): Promise<TipoTramiteCatalogoMessageResponse> {
    const tipo = await this.tipoTramiteRepository.findOne({ where: { id } });
    if (!tipo) {
      throw new NotFoundException('No existe un tipo de trámite con ese ID.');
    }
    tipo.estado = tipo.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (tipo.estado === 'INACTIVO') {
      tipo.deletedAt = new Date();
      tipo._user_delete = idUsuario;
      tipo.updatedAt = null;
      tipo._user_update = null;
    } else {
      tipo.deletedAt = null;
      tipo._user_delete = null;
      tipo.updatedAt = new Date();
      tipo._user_update = idUsuario;
    }
    await this.tipoTramiteRepository.save(tipo);
    return {
      message: `Registro del tipo de tramite de catalogo ${tipo.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
    };
  }

  // Funcion para validar que existe un TipoTramiteActivo
  // Desarrollado por: Missael Apaza
  // Fecha: 11/11/2026
  async validarTipoTramiteActivo(id: string): Promise<void> {
    const tipo = await this.tipoTramiteRepository.findOne({
      where: { id },
    });

    if (!tipo) {
      throw new NotFoundException(
        'No se encontró el tipo de trámite solicitado.',
      );
    }

    if (tipo.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'El tipo de trámite seleccionado se encuentra inactivo.',
      );
    }
  }
}
