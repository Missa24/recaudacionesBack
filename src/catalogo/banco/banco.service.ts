/**
 * Módulo: Catálogo - Banco
 * Archivo: banco.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de los valores de Banco.
 * Gestiona registros manuales, sincronización externa, consultas,
 * actualizaciones y cambios de estado, incluyendo el control de auditoría.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Banco } from './entities/banco.entity';
import {
  And,
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import {
  BancoMessageResponse,
  BancoResponse,
} from './interface/banco-response.interface';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { mapearRespuesta } from './util/map-response-banco.util';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';
import { QueryBancoDto } from './dto/query-banco.dto';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';

/**
 * Servicio: BancoService
 * Descripción:
 * Implementa las operaciones de negocio para administrar los registros de Banco,
 * utilizando TypeORM para interactuar con la base de datos.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class BancoService {
  private readonly logger = new Logger(BancoService.name);

  constructor(
    @InjectRepository(Banco)
    private readonly bancoRepository: Repository<Banco>,
  ) {}

  /**
   * Registra manualmente un nuevo valor del Banco.
   * Verifica que no exista otro registro para el mismo código
   * y asocia al usuario responsable de la creación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */

  async crear(
    dto: CreateBancoDto,
    idUsuario: string,
  ): Promise<BancoMessageResponse> {
    // Comprueba si ya existe un registro con el nombre proporcionado.
    const existe = await this.bancoRepository.findOne({
      where: {
        nombre: dto.nombre,
      },
    });
    if (existe) {
      throw new ConflictException('Ya existe un Banco con ese mismo nombre');
    }
    // Prepara la entidad asociando los datos del usuario creador
    const banco = this.bancoRepository.create({
      ...dto,
      usuario_creador: { idUsuario },
    });
    try {
      await this.bancoRepository.save(banco);
      return {
        message: 'Banco registrado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException('Ya existe un Banco para ese nombre');
      }
      this.logger.error(
        `Error al crear un Banco. Nombre: ${dto.nombre}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('No se pudo guardar el registro');
    }
  }
  /**
   * Obtiene los registros de Dependencia aplicando filtros, búsqueda,
   * ordenamiento y paginación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async listar(
    query: QueryBancoDto,
  ): Promise<PaginatedResponse<BancoResponse>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query;

    // Validar rango de fechas
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    // Campos permitidos para ordenar
    const camposOrdenamiento: Record<string, keyof Banco> = {
      createdAt: '_created_at',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy] ?? '_created_at';

    // Construir filtros
    const filtros: FindOptionsWhere<Banco> = {};

    // Filtro por estado
    if (status && status !== 'TODOS') {
      filtros.estado = status;
    } else if (!status) {
      filtros.estado = 'ACTIVO';
    }

    // Filtro por rango de fechas (Bolivia)
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

    // Construir condiciones de búsqueda
    const condiciones: FindOptionsWhere<Banco>[] = [];

    if (search?.trim()) {
      condiciones.push({
        ...filtros,
        nombre: ILike(`%${search.trim()}%`),
      });
    } else {
      condiciones.push(filtros);
    }

    try {
      const [bancos, total] = await this.bancoRepository.findAndCount({
        where: condiciones,
        relations: {
          usuario_creador: true,
          usuario_actualizador: true,
        },
        order: {
          [campoOrdenamiento]: sortOrder ?? 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        items: bancos.map((banco) => mapearRespuesta(banco)),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error al listar bancos. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }
  /**
   * Busca un registro de Banco mediante su identificador único.
   * Incluye los nombres de usuario asociados a su creación y actualización.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorId(id: string): Promise<BancoResponse> {
    const banco = await this.bancoRepository.findOne({
      where: { id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!banco) {
      throw new NotFoundException('No existe un Banco con ese Id');
    }

    return mapearRespuesta(banco);
  }

  /**
   * Busca un registro de Banco por un código específico.
   * Solo considera registros activos y que no hayan sido eliminados.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorNombre(nombre: string): Promise<BancoResponse> {
    const banco = await this.bancoRepository.findOne({
      where: {
        nombre,
        estado: 'ACTIVO',
        _deleted_at: IsNull(),
      },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!banco) {
      throw new NotFoundException('No existe un Banco activo para ese nombre');
    }

    return mapearRespuesta(banco);
  }

  /**
   * Actualiza parcialmente un registro de Banco existente.
   * Verifica su existencia, estado y posibles duplicados de código.
   * También actualiza los campos de auditoría correspondientes.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async actualizar(
    id: string,
    dto: UpdateBancoDto,
    idUsuario: string,
  ): Promise<BancoMessageResponse> {
    const banco = await this.bancoRepository.findOne({
      where: { id: id },
    });

    if (!banco) {
      throw new NotFoundException('No se encontro el Banco solicitado');
    }

    if (banco.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar un banco inactiva.',
      );
    }

    Object.assign(banco, dto);
    banco._updated_at = new Date();
    banco._user_update = idUsuario;
    banco.usuario_actualizador = { idUsuario } as Usuario;

    try {
      await this.bancoRepository.save(banco);
      return {
        message: 'Banco actualizado correctamente.',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        throw new ConflictException('Ya existe una dependencia con ese código');
      }

      this.logger.error(
        `Error al actualizar Banco. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
  /**
   * Cambia el estado de un registro de una Dependencia
   * entre ACTIVO e INACTIVO.
   * Al desactivar, registra los datos de eliminación lógica.
   * Al reactivar, limpia dichos datos y registra la actualización.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */

  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<BancoMessageResponse> {
    const banco = await this.bancoRepository.findOne({
      where: { id: id },
    });

    if (!banco) {
      throw new NotFoundException('No existe un Banco con esa identificacion');
    }

    const estadoAnterior = banco.estado;
    const nuevoEstado = banco.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    banco.estado = nuevoEstado;
    if (nuevoEstado === 'INACTIVO') {
      banco._user_delete = idUsuario;
      banco._deleted_at = new Date();
      banco._user_update = null;
      banco._updated_at = null;
    } else {
      banco._user_update = idUsuario;
      banco._updated_at = new Date();
      banco._user_delete = null;
      banco._deleted_at = null;
    }

    try {
      await this.bancoRepository.save(banco);
      return {
        message: 'Estado del Banco cambiado correctamente',
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar el estado de la Banco. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del registro',
      );
    }
  }

  async validarBanco(id_banco: string): Promise<void> {
    const banco = await this.bancoRepository.findOne({
      where: { id: id_banco },
    });

    if (!banco) {
      throw new NotFoundException('No se encontró el banco solicitado.');
    }

    if (banco.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'El banco seleccionado se encuentra inactivo.',
      );
    }
  }
}
