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

  /*
  Nombre del método: crear
  Descripción: Registra manualmente un nuevo Banco. Verifica duplicidad por nombre
               y asocia al usuario creador.
  Parámetros:
    - dto: CreateBancoDto (datos del banco)
    - idUsuario: string (usuario que crea)
  Respuestas posibles:
    - 201: Banco registrado correctamente.
    - 409: Ya existe un Banco con ese mismo nombre.
    - 500: No se pudo guardar el registro.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
      usuario_creador: { id: idUsuario },
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

  /*
  Nombre del método: listar
  Descripción: Obtiene los registros de Banco aplicando filtros, búsqueda,
               ordenamiento y paginación.
  Parámetros:
    - query: QueryBancoDto (page, limit, search, status, startDate, endDate, sortBy, sortOrder)
  Respuestas posibles:
    - 200: Listado paginado de bancos.
    - 400: Rango de fechas inválido (startDate > endDate).
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
      createdAt: 'createdAt',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy] ?? 'createdAt';

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

  /*
  Nombre del método: buscarPorId
  Descripción: Busca un registro de Banco por su identificador único e incluye
               los usuarios de creación y actualización.
  Parámetros:
    - id: string (identificador del banco)
  Respuestas posibles:
    - 200: Registro encontrado.
    - 404: No existe un Banco con ese Id.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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

  /*
  Nombre del método: buscarPorNombre
  Descripción: Obtiene un registro de Banco correspondiente a un nombre específico,
               solo si está ACTIVO y no eliminado lógicamente.
  Parámetros:
    - nombre: string (nombre del banco a buscar)
  Respuestas posibles:
    - 200: Registro encontrado.
    - 404: No existe un Banco activo para ese nombre.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
  Notas adicionales: Se usa para la ruta `banco/nombre/:nombre` y debe declararse
                     antes de `:id` para que la ruta literal no sea capturada por
                     el parámetro genérico.
*/
  async buscarPorNombre(nombre: string): Promise<BancoResponse> {
    const banco = await this.bancoRepository.findOne({
      where: {
        nombre,
        estado: 'ACTIVO',
        deletedAt: IsNull(),
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

  /*
  Nombre del método: actualizar
  Descripción: Actualiza parcialmente un Banco existente. Verifica existencia y
               estado ACTIVO, y actualiza los campos de auditoría.
  Parámetros:
    - id: string (identificador del banco)
    - dto: UpdateBancoDto (campos a actualizar)
    - idUsuario: string (usuario que actualiza)
  Respuestas posibles:
    - 200: Banco actualizado correctamente.
    - 400: No se puede actualizar un banco inactivo.
    - 404: No se encontró el Banco solicitado.
    - 409: Ya existe un Banco con ese nombre/código.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
    banco.updatedAt = new Date();
    banco._user_update = idUsuario;
    banco.usuario_actualizador = { id: idUsuario } as Usuario;

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

  /*
  Nombre del método: cambiarEstado
  Descripción: Cambia el estado de un Banco entre ACTIVO e INACTIVO.
               Al desactivar registra eliminación lógica; al reactivar limpia
               esos datos y registra actualización.
  Parámetros:
    - id: string (identificador del banco)
    - idUsuario: string (usuario que realiza el cambio)
  Respuestas posibles:
    - 200: Estado del Banco cambiado correctamente.
    - 404: No existe un Banco con esa identificación.
    - 500: No se pudo cambiar el estado del registro.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
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
      banco.deletedAt = new Date();
      banco._user_update = null;
      banco.updatedAt = null;
    } else {
      banco._user_update = idUsuario;
      banco.updatedAt = new Date();
      banco._user_delete = null;
      banco.deletedAt = null;
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

  /*
  Nombre del método: validarBanco
  Descripción: Valida que un Banco exista y se encuentre ACTIVO. No retorna datos;
               lanza excepción si no cumple las condiciones.
  Parámetros:
    - banco_id: string (identificador del banco a validar)
  Respuestas posibles:
    - 200: Banco válido (sin retorno).
    - 400: El banco seleccionado se encuentra inactivo.
    - 404: No se encontró el banco solicitado.
  Fecha de creación: 2026-11-10
  Autor: Missael Apaza
*/
  async validarBanco(banco_id: string): Promise<void> {
    const banco = await this.bancoRepository.findOne({
      where: { id: banco_id },
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
