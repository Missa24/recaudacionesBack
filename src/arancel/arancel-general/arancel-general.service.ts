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
import { CreateArancelGeneralDto } from './dto/create-arancel-general.dto';
import { QueryArancelGeneralDto } from './dto/query-arancel-general.dto';
import { UpdateArancelGeneralDto } from './dto/update-arancel-general.dto';
import { ArancelGeneral } from './entities/arancel-general.entity';
import {
  ArancelGeneralMessageResponse,
  ArancelGeneralResponse,
} from './interface/arancel-general-response.interface';
import { mapearRespuestaArancelGeneral } from './util/map-response-arancel-general.util';
import { DependenciaService } from 'src/catalogo/dependencia/dependencia.service';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { CuentaBancariaService } from 'src/catalogo/cuenta-bancaria/cuenta-bancaria.service';

@Injectable()
export class ArancelGeneralService {
  private readonly logger = new Logger(ArancelGeneralService.name);

  constructor(
    @InjectRepository(ArancelGeneral)
    private readonly arancelRepository: Repository<ArancelGeneral>,
    private readonly dependenciaService: DependenciaService,
    private readonly cuentaBancariaService: CuentaBancariaService,
  ) {}

  async crear(
    dto: CreateArancelGeneralDto,
    idUsuario: string,
  ): Promise<ArancelGeneralMessageResponse> {
    try {
      // Validar dependencia.
      await this.dependenciaService.validarDependencia(dto.dependencia_id);

      // Validar cuenta bancaria, si fue proporcionada.
      if (dto.cuenta_destino_id) {
        await this.cuentaBancariaService.validarCuentaBancaria(
          dto.cuenta_destino_id,
        );
      }

      // Verificar número de arancel duplicado.
      const existe = await this.arancelRepository.findOne({
        where: { nro_arancel_gral: dto.nro_arancel_gral },
      });

      if (existe) {
        throw new ConflictException(
          'Ya existe un Arancel General con ese número de arancel.',
        );
      }

      // Crear registro.
      const arancel = this.arancelRepository.create({
        ...dto,
        usuario_creador: { id: idUsuario } as Usuario,
      });

      await this.arancelRepository.save(arancel);

      return {
        message: 'Arancel general registrado correctamente.',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe un Arancel General con ese número de arancel.',
        );
      }

      this.logger.error(
        'Error al crear el arancel general.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo guardar el Arancel General.',
      );
    }
  }

  async listar(
    query: QueryArancelGeneralDto,
  ): Promise<PaginatedResponse<ArancelGeneralResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortOrder,
      dependencia_id,
    } = query;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const filtros: FindOptionsWhere<ArancelGeneral> = {};
    if (status && status !== 'TODOS') {
      filtros.estado = status;
    } else if (!status) {
      filtros.estado = 'ACTIVO';
    }
    if (dependencia_id) filtros.dependencia_id = dependencia_id;

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
    const condiciones: FindOptionsWhere<ArancelGeneral>[] = termino
      ? [
          { ...filtros, nro_arancel_gral: ILike(termino) },
          { ...filtros, descripcion: ILike(termino) },
        ]
      : [filtros];

    const [aranceles, total] = await this.arancelRepository.findAndCount({
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
      items: aranceles.map(mapearRespuestaArancelGeneral),
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

  async buscarPorId(id: string): Promise<ArancelGeneralResponse> {
    const arancel = await this.arancelRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });
    if (!arancel) {
      throw new NotFoundException('No existe un arancel general con ese ID.');
    }
    return mapearRespuestaArancelGeneral(arancel);
  }

  async actualizar(
    id: string,
    dto: UpdateArancelGeneralDto,
    idUsuario: string,
  ): Promise<ArancelGeneralMessageResponse> {
    try {
      // Buscar el arancel general.
      const arancel = await this.arancelRepository.findOne({
        where: { id },
      });

      if (!arancel) {
        throw new NotFoundException('No existe un arancel general con ese ID.');
      }

      if (arancel.estado !== 'ACTIVO') {
        throw new BadRequestException(
          'No se puede actualizar un arancel general inactivo.',
        );
      }

      // Validar dependencia si se proporciona.
      if (dto.dependencia_id) {
        await this.dependenciaService.validarDependencia(dto.dependencia_id);
      }

      // Validar cuenta bancaria si se proporciona.
      if (dto.cuenta_destino_id) {
        await this.cuentaBancariaService.validarCuentaBancaria(
          dto.cuenta_destino_id,
        );
      }

      // Verificar número de arancel duplicado.
      if (dto.nro_arancel_gral) {
        const existe = await this.arancelRepository.findOne({
          where: { nro_arancel_gral: dto.nro_arancel_gral },
        });

        if (existe && existe.id !== id) {
          throw new ConflictException(
            'Ya existe otro Arancel General con ese número de arancel.',
          );
        }
      }

      // Actualizar datos.
      Object.assign(arancel, dto);

      arancel.updatedAt = new Date();
      arancel._user_update = idUsuario;
      arancel.usuario_actualizador = { id: idUsuario } as Usuario;

      await this.arancelRepository.save(arancel);

      return {
        message: 'Arancel general actualizado correctamente.',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException(
          'Ya existe otro Arancel General con ese número de arancel.',
        );
      }

      this.logger.error(
        'Error al actualizar el arancel general.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'No se pudo actualizar el Arancel General.',
      );
    }
  }

  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<ArancelGeneralMessageResponse> {
    const arancel = await this.arancelRepository.findOne({ where: { id } });
    if (!arancel) {
      throw new NotFoundException('No existe un arancel general con ese ID.');
    }

    arancel.estado = arancel.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (arancel.estado === 'INACTIVO') {
      arancel.deletedAt = new Date();
      arancel._user_delete = idUsuario;
      arancel.updatedAt = null;
      arancel._user_update = null;
    } else {
      arancel.deletedAt = null;
      arancel._user_delete = null;
      arancel.updatedAt = new Date();
      arancel._user_update = idUsuario;
    }

    await this.arancelRepository.save(arancel);
    return {
      message: `Registro del arancel general ${arancel.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
    };
  }

  // Funcion para validar la existencia de un ArancelGeneral
  // Desarrollado por: Missael Apaza
  // Fecha: 11/11/2026
  async validarArancelGeneral(id: string): Promise<void> {
    const arancel = await this.arancelRepository.findOne({
      where: { id },
    });

    if (!arancel) {
      throw new NotFoundException(
        'No se encontró el arancel general solicitado.',
      );
    }

    if (arancel.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'El arancel general seleccionado se encuentra inactivo.',
      );
    }
  }
}
