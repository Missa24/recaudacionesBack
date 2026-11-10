/**
 * Módulo: Catálogo - Banco
 * Archivo: banco.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de los valores de Banco.
 * Gestiona registros manuales, sincronización externa, consultas,
 * actualizaciones y cambios de estado, incluyendo el control de auditoría.
 *
 * Desarrollado por: Missael Apaza
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
import { Brackets, Repository } from 'typeorm';
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
 * Desarrollado por: Missael Apaza
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
   * Desarrollado por: Missael Apaza
   */

  async crear(
    dto: CreateBancoDto,
    idUsuario: string,
  ): Promise<BancoMessageResponse> {
    this.logger.log(
      `Iniciando creación de Banco. Banco: ${dto.nombre}, Usuario: ${idUsuario}`,
    );

    // Comprueba si ya existe un registro con el nombre proporcionado.
    const existe = await this.bancoRepository.findOne({
      where: {
        nombre: dto.nombre,
      },
    });
    if (existe) {
      this.logger.warn(
        `Conflicto al crear Banco: ya existe registro con el nombre ${dto.nombre}`,
      );
      throw new ConflictException('Ya existe un Banco con ese mismo nombre');
    }
    // Prepara la entidad asociando los datos del usuario creador
    const banco = this.bancoRepository.create({
      ...dto,
      usuario_creador: { idUsuario },
    });
    try {
      const guardada = await this.bancoRepository.save(banco);
      this.logger.log(`Banco creada correctamente. ID: ${guardada.id}`);
      return {
        message: 'Banco registrado correctamente',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al crear Banco. nombre: ${dto.nombre}`,
        );
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
   * Desarrollado por: Missael Apaza
   */

  async listar(
    query: QueryBancoDto,
  ): Promise<PaginatedResponse<BancoResponse>> {
    this.logger.log(
      `Listando Dependencias. Página: ${query.page}, Límite: ${query.limit}, Search: ${query.search ?? 'N/A'}, Estado: ${query.status ?? 'ACTIVO'}`,
    );

    const {
      page,
      limit,
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query;

    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'banco._created_at',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy] ?? 'banco._created_at';

    const queryBuilder = this.bancoRepository
      .createQueryBuilder('banco')
      .leftJoinAndSelect('banco.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect('banco.usuario_actualizador', 'usuario_actualizador');

    if (search) {
      this.logger.debug(`Aplicando filtro de búsqueda: "${search}"`);
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('banco.nombre ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }
    // Aplicar filtro de estado, mostrando activos por defecto.
    if (status && status !== 'TODOS') {
      this.logger.debug(`Aplicando filtro estado: ${status}`);
      queryBuilder.andWhere('banco.estado = :estado', {
        estado: status,
      });
    } else if (!status) {
      this.logger.debug('Aplicando filtro estado por defecto: ACTIVO');
      queryBuilder.andWhere('banco.estado = :estado', {
        estado: 'ACTIVO',
      });
    } else {
      this.logger.debug('Consultando bancos de todos los estados');
    }

    if (startDate) {
      this.logger.debug(`Aplicando filtro startDate: ${startDate}`);
      queryBuilder.andWhere('banco._created_at >= :startDate', {
        startDate: `${startDate} 00:00:00`,
      });
    }

    if (endDate) {
      this.logger.debug(`Aplicando filtro endDate: ${endDate}`);
      queryBuilder.andWhere('banco._created_at <= :endDate', {
        endDate: `${endDate} 23:59:59.999`,
      });
    }

    try {
      const [bancos, total] = await queryBuilder
        .orderBy(campoOrdenamiento, sortOrder ?? 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Listado de Bancos obtenido. Total: ${total}, Página: ${page}/${totalPages || 1}, Items devueltos: ${bancos.length}`,
      );

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
        `Error al listar Dependencias. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
  /**
   * Busca un registro de Banco mediante su identificador único.
   * Incluye los nombres de usuario asociados a su creación y actualización.
   *
   * Desarrollado por: Missael Apaza
   */
  async buscarPorId(id: string): Promise<BancoResponse> {
    this.logger.log(`Buscando Banco por ID: ${id}`);
    const banco = await this.bancoRepository
      .createQueryBuilder('banco')
      .leftJoin('banco.usuario_creador', 'creador')
      .leftJoin('banco.usuario_actualizador', 'actualizador')
      .select([
        'banco.id',
        'banco.nombre',
        'banco.codigo_bc',
        'banco.estado',
        'creador.username',
        'actualizador.username',
      ])
      .where('banco.id = :id', { id })
      .getOne();

    if (!banco) {
      this.logger.warn(`Banco no encontrado con ID: ${id}`);
      throw new NotFoundException('No existe un Banco con ese Id');
    }
    this.logger.log(`Banco encontrado. ID: ${id}`);
    return mapearRespuesta(banco);
  }

  /**
   * Busca un registro de Banco por un código específico.
   * Solo considera registros activos y que no hayan sido eliminados.
   *
   * Desarrollado por: Missael Apaza
   */
  async buscarPorNombre(nombre: string): Promise<BancoResponse> {
    this.logger.log(`Buscando Dependencia por nombre: ${nombre}`);
    const banco = await this.bancoRepository
      .createQueryBuilder('banco')
      .leftJoin('banco.usuario_creador', 'creador')
      .leftJoin('banco.usuario_actualizador', 'actualizador')
      .select([
        'banco.id',
        'banco.nombre',
        'banco.codigo_bc',
        'banco.estado',
        'creador.username',
        'actualizador.username',
      ])
      .where('banco.nombre = :nombre', { nombre })
      .andWhere('banco.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('banco._deleted_at IS NULL')
      .getOne();

    if (!banco) {
      this.logger.warn(`Banco activa no encontrada para el nombre: ${nombre}`);
      throw new NotFoundException('No existe un Banco activo para ese nombre');
    }

    this.logger.log(`Banco encontrada por nombre: ${nombre}`);
    return mapearRespuesta(banco);
  }

  /**
   * Actualiza parcialmente un registro de Banco existente.
   * Verifica su existencia, estado y posibles duplicados de código.
   * También actualiza los campos de auditoría correspondientes.
   *
   * Desarrollado por: Missael Apaza
   */
  async actualizar(
    id: string,
    dto: UpdateBancoDto,
    idUsuario: string,
  ): Promise<BancoMessageResponse> {
    this.logger.log(
      `Iniciando actualización de Banco. ID: ${id}, Usuario: ${idUsuario}`,
    );
    const banco = await this.bancoRepository.findOne({
      where: { id: id },
    });

    if (!banco) {
      this.logger.warn(`No se encontró Banco para actualizar. ID: ${id}`);
      throw new NotFoundException('No se encontro el Banco solicitado');
    }

    if (banco.estado !== 'ACTIVO') {
      this.logger.warn(
        `Intento de actualización sobre Banco inactiva. ID: ${id}, Estado: ${banco.estado}`,
      );
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
      this.logger.log(
        `Banco actualizada correctamente. ID: ${id}, Usuario: ${idUsuario}`,
      );
      return {
        message: 'Banco actualizado correctamente.',
      };
    } catch (error: unknown) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(`Error de duplicado al actualizar Banco. ID: ${id}`);
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
   * Desarrollado por: Missael Apaza
   */

  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<BancoMessageResponse> {
    this.logger.log(
      `Iniciando cambio de estado de Banco. ID: ${id}, Usuario: ${idUsuario}`,
    );
    const banco = await this.bancoRepository.findOne({
      where: { id: id },
    });

    if (!banco) {
      this.logger.warn(
        `No se encontró un Banco para cambiar estado. ID: ${id}`,
      );
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
      this.logger.log(
        `Estado de Banco cambiado correctamente. ID: ${id}, Estado anterior: ${estadoAnterior}, Estado nuevo: ${nuevoEstado}, Usuario: ${idUsuario}`,
      );
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
