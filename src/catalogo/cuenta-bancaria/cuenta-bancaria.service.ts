/**
 * Módulo: Catálogos - Cuentas Bancarias
 * Archivo: cuenta-bancaria.service.ts
 * Descripción:
 * Contiene la lógica de negocio para el registro, consulta,
 * actualización y administración de cuentas bancarias.
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
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { CuentaBancaria } from './entities/cuenta-bancaria.entity';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

import { CreateCuentaBancariaDto } from './dto/create-cuenta-bancaria.dto';
import { UpdateCuentaBancariaDto } from './dto/update-cuenta-bancaria.dto';
import { QueryCuentaBancariaDto } from './dto/query-cuenta-bancaria.dto';

import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import {
  CuentaBancariaCreateResponse,
  CuentaBancariaMessageResponse,
  CuentaBancariaResponse,
} from './interfaces/cuenta-bancaria-response.interface';
import { mapearRespuesta } from './util/map-response-cuenta-bancaria.util';
import { BancoService } from '../banco/banco.service';
import { DependenciaService } from '../dependencia/dependencia.service';

/**
 * Servicio encargado de gestionar las operaciones
 * del catálogo de cuentas bancarias.
 *
 * Desarrollado por: Missael Apaza
 */
@Injectable()
export class CuentaBancariaService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza
   */
  private readonly logger = new Logger(CuentaBancariaService.name);

  /**
   * Inyecta los repositorios necesarios para gestionar
   * las cuentas bancarias y validar sus referencias.
   */
  constructor(
    @InjectRepository(CuentaBancaria)
    private readonly cuentaBancariaRepository: Repository<CuentaBancaria>,
    private readonly bancoService: BancoService,
    private readonly dependenciaService: DependenciaService,
  ) {}

  /**
   * Registra una nueva cuenta bancaria,
   * verificando sus referencias y unicidad.
   *
   * Desarrollado por: Missael Apaza
   */
  async crear(
    dto: CreateCuentaBancariaDto,
    id_usuario: string,
  ): Promise<CuentaBancariaCreateResponse> {
    this.logger.log(
      `Iniciando creación de CuentaBancaria. Banco: ${dto.id_banco}, Nro: ${dto.nro_cuenta}, Usuario: ${id_usuario}`,
    );

    // Valida que el banco exista delegando al BancoService.
    await this.bancoService.validarBanco(dto.id_banco);

    // Valida la dependencia solo si fue enviada.
    if (dto.id_dependencia) {
      this.logger.debug(
        `Validando dependencia asociada: ${dto.id_dependencia}`,
      );
      await this.dependenciaService.validarDependencia(dto.id_dependencia);
    }

    // Comprueba duplicidad de la cuenta por banco + número.
    const existente = await this.cuentaBancariaRepository.findOne({
      where: {
        id_banco: dto.id_banco,
        nro_cuenta: dto.nro_cuenta,
      },
    });

    if (existente) {
      this.logger.warn(
        `Conflicto al crear CuentaBancaria: ya existe cuenta ${dto.nro_cuenta} para el banco ${dto.id_banco}`,
      );
      throw new ConflictException(
        'El número de cuenta ya se encuentra registrado para este banco.',
      );
    }

    // Prepara la entidad asociando los datos del usuario creador.
    const cuenta = this.cuentaBancariaRepository.create({
      id_banco: dto.id_banco,
      nro_cuenta: dto.nro_cuenta,
      nombre_cuenta: dto.nombre_cuenta,
      id_dependencia: dto.id_dependencia ?? null,
      tipo: dto.tipo,
      estado: 'ACTIVO',
      _created_at: new Date(),
      _updated_at: new Date(),
      _user_created: id_usuario,
      usuario_creador: { idUsuario: id_usuario } as Usuario,
    });

    try {
      const guardada = await this.cuentaBancariaRepository.save(cuenta);

      this.logger.log(
        `CuentaBancaria creada correctamente. ID: ${guardada.id_cuenta}, Nro: ${guardada.nro_cuenta}, Usuario: ${id_usuario}`,
      );

      return {
        message: 'La cuenta bancaria fue registrada correctamente.',
        id: guardada.id_cuenta,
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al crear CuentaBancaria. Banco: ${dto.id_banco}, Nro: ${dto.nro_cuenta}`,
        );
        throw new ConflictException(
          'El número de cuenta ya se encuentra registrado para este banco.',
        );
      }

      this.logger.error(
        `Error al registrar la cuenta bancaria. Banco: ${dto.id_banco}, Nro: ${dto.nro_cuenta}, Usuario: ${id_usuario}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Ocurrió un error al registrar la cuenta bancaria.',
      );
    }
  }

  /**
   * Obtiene el listado paginado de cuentas bancarias
   * aplicando búsqueda, filtros y ordenamiento.
   *
   * Desarrollado por: Missael Apaza
   */
  async listar(
    query: QueryCuentaBancariaDto,
  ): Promise<PaginatedResponse<CuentaBancariaResponse>> {
    this.logger.log(
      `Listando CuentasBancarias. Página: ${query.page}, Límite: ${query.limit}, Search: ${query.search ?? 'N/A'}, Estado: ${query.status ?? 'ACTIVO'}, Banco: ${query.id_banco ?? 'N/A'}, Dependencia: ${query.id_dependencia ?? 'N/A'}, Tipo: ${query.tipo ?? 'N/A'}`,
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
      id_banco,
      id_dependencia,
      tipo,
    } = query;

    if (startDate && endDate && startDate > endDate) {
      this.logger.warn(
        `Rango de fechas inválido al listar CuentasBancarias: startDate ${startDate} > endDate ${endDate}`,
      );
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const camposOrdenamiento: Record<string, string> = {
      nro_cuenta: 'cuenta.nro_cuenta',
      nombre_cuenta: 'cuenta.nombre_cuenta',
      tipo: 'cuenta.tipo',
      createdAt: 'cuenta._created_at',
      updatedAt: 'cuenta._updated_at',
    };

    const campoOrdenamiento =
      camposOrdenamiento[sortBy] ?? 'cuenta._created_at';

    const queryBuilder = this.cuentaBancariaRepository
      .createQueryBuilder('cuenta')
      .leftJoinAndSelect('cuenta.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect('cuenta.usuario_actualizador', 'usuario_actualizador');

    if (search) {
      this.logger.debug(`Aplicando filtro de búsqueda: "${search}"`);
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('cuenta.nro_cuenta ILIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('cuenta.nombre_cuenta ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('cuenta.tipo ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    // Mismo patrón de 3 ramas que DependenciaService.
    if (status && status !== 'TODOS') {
      this.logger.debug(`Aplicando filtro estado: ${status}`);
      queryBuilder.andWhere('cuenta.estado = :estado', {
        estado: status,
      });
    } else if (!status) {
      this.logger.debug('Aplicando filtro estado por defecto: ACTIVO');
      queryBuilder.andWhere('cuenta.estado = :estado', {
        estado: 'ACTIVO',
      });
    } else {
      this.logger.debug('Consultando cuentas bancarias de todos los estados');
    }

    if (id_banco) {
      this.logger.debug(`Aplicando filtro id_banco: ${id_banco}`);
      queryBuilder.andWhere('cuenta.id_banco = :id_banco', {
        id_banco,
      });
    }

    if (id_dependencia) {
      this.logger.debug(`Aplicando filtro id_dependencia: ${id_dependencia}`);
      queryBuilder.andWhere('cuenta.id_dependencia = :id_dependencia', {
        id_dependencia,
      });
    }

    if (tipo) {
      this.logger.debug(`Aplicando filtro tipo: ${tipo}`);
      queryBuilder.andWhere('cuenta.tipo = :tipo', { tipo });
    }

    if (startDate) {
      this.logger.debug(`Aplicando filtro startDate: ${startDate}`);
      queryBuilder.andWhere('cuenta._created_at >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      this.logger.debug(`Aplicando filtro endDate: ${endDate}`);
      queryBuilder.andWhere(
        "cuenta._created_at < (:endDate::date + INTERVAL '1 day')",
        { endDate },
      );
    }

    try {
      const [registros, total] = await queryBuilder
        .orderBy(campoOrdenamiento, sortOrder ?? 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Listado de CuentasBancarias obtenido. Total: ${total}, Página: ${page}/${totalPages || 1}, Items devueltos: ${registros.length}`,
      );

      return {
        items: registros.map((registro) => mapearRespuesta(registro)),
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
        `Error al listar CuentasBancarias. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Busca una cuenta bancaria mediante su identificador UUID.
   * Si no existe, genera una excepción de recurso no encontrado.
   *
   * Desarrollado por: Missael Apaza
   */
  async buscarPorId(id: string): Promise<CuentaBancariaResponse> {
    this.logger.log(`Buscando CuentaBancaria por ID: ${id}`);

    const cuenta = await this.cuentaBancariaRepository
      .createQueryBuilder('cuenta')
      .leftJoinAndSelect('cuenta.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect('cuenta.usuario_actualizador', 'usuario_actualizador')
      .where('cuenta.id_cuenta = :id', { id })
      .getOne();

    if (!cuenta) {
      this.logger.warn(`CuentaBancaria no encontrada con ID: ${id}`);
      throw new NotFoundException(
        'No se encontró la cuenta bancaria solicitada.',
      );
    }

    this.logger.log(`CuentaBancaria encontrada. ID: ${id}`);
    return mapearRespuesta(cuenta);
  }

  /**
   * Actualiza la información de una cuenta bancaria.
   * Verifica su estado, referencias y unicidad cuando corresponda.
   *
   * Desarrollado por: Missael Apaza
   */
  async actualizar(
    id: string,
    dto: UpdateCuentaBancariaDto,
    id_usuario: string,
  ): Promise<CuentaBancariaMessageResponse> {
    this.logger.log(
      `Iniciando actualización de CuentaBancaria. ID: ${id}, Usuario: ${id_usuario}`,
    );

    const cuenta = await this.cuentaBancariaRepository.findOne({
      where: { id_cuenta: id },
    });

    if (!cuenta) {
      this.logger.warn(
        `No se encontró CuentaBancaria para actualizar. ID: ${id}`,
      );
      throw new NotFoundException(
        'No se encontró la cuenta bancaria solicitada.',
      );
    }

    if (cuenta.estado !== 'ACTIVO') {
      this.logger.warn(
        `Intento de actualización sobre CuentaBancaria inactiva. ID: ${id}, Estado: ${cuenta.estado}`,
      );
      throw new BadRequestException(
        'No se puede actualizar una cuenta bancaria inactiva.',
      );
    }

    const nuevoBanco = dto.id_banco ?? cuenta.id_banco;
    const nuevoNumero = dto.nro_cuenta ?? cuenta.nro_cuenta;

    if (dto.id_banco !== undefined) {
      this.logger.debug(`Validando nuevo banco: ${dto.id_banco}`);
      await this.bancoService.validarBanco(dto.id_banco);
    }

    if (dto.id_dependencia !== undefined && dto.id_dependencia !== null) {
      this.logger.debug(`Validando nueva dependencia: ${dto.id_dependencia}`);
      await this.dependenciaService.validarDependencia(dto.id_dependencia);
    }

    // Solo valida unicidad si cambia banco o número.
    if (nuevoBanco !== cuenta.id_banco || nuevoNumero !== cuenta.nro_cuenta) {
      this.logger.debug(
        `Cambio de identidad bancaria detectado. Banco: ${cuenta.id_banco} → ${nuevoBanco}, Nro: ${cuenta.nro_cuenta} → ${nuevoNumero}`,
      );

      const existente = await this.cuentaBancariaRepository
        .createQueryBuilder('cuenta')
        .where('cuenta.id_banco = :id_banco', {
          id_banco: nuevoBanco,
        })
        .andWhere('cuenta.nro_cuenta = :nro_cuenta', {
          nro_cuenta: nuevoNumero,
        })
        .andWhere('cuenta.id_cuenta != :id', { id })
        .getOne();

      if (existente) {
        this.logger.warn(
          `Conflicto al actualizar CuentaBancaria: ya existe cuenta ${nuevoNumero} para el banco ${nuevoBanco}. ID actual: ${id}`,
        );
        throw new ConflictException(
          'El número de cuenta ya se encuentra registrado para este banco.',
        );
      }
    }

    if (dto.id_banco !== undefined) {
      cuenta.id_banco = dto.id_banco;
    }

    if (dto.nro_cuenta !== undefined) {
      cuenta.nro_cuenta = dto.nro_cuenta;
    }

    if (dto.nombre_cuenta !== undefined) {
      cuenta.nombre_cuenta = dto.nombre_cuenta;
    }

    if (dto.id_dependencia !== undefined) {
      cuenta.id_dependencia = dto.id_dependencia;
    }

    if (dto.tipo !== undefined) {
      cuenta.tipo = dto.tipo;
    }

    cuenta._updated_at = new Date();
    cuenta._user_update = id_usuario;
    cuenta.usuario_actualizador = {
      idUsuario: id_usuario,
    } as Usuario;

    try {
      await this.cuentaBancariaRepository.save(cuenta);

      this.logger.log(
        `CuentaBancaria actualizada correctamente. ID: ${id}, Usuario: ${id_usuario}`,
      );

      return {
        message: 'La cuenta bancaria fue actualizada correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al actualizar CuentaBancaria. ID: ${id}, Banco: ${nuevoBanco}, Nro: ${nuevoNumero}`,
        );
        throw new ConflictException(
          'El número de cuenta ya se encuentra registrado para este banco.',
        );
      }

      this.logger.error(
        `Error al actualizar la cuenta bancaria. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Ocurrió un error al actualizar la cuenta bancaria.',
      );
    }
  }

  /**
   * Alterna el estado de una cuenta bancaria entre ACTIVO e INACTIVO.
   * Actualiza los datos de auditoría y registra o limpia la información
   * correspondiente a la inactivación del registro.
   *
   * Desarrollado por: Missael Apaza
   */
  async cambiarEstado(
    id: string,
    id_usuario: string,
  ): Promise<CuentaBancariaMessageResponse> {
    this.logger.log(
      `Iniciando cambio de estado de CuentaBancaria. ID: ${id}, Usuario: ${id_usuario}`,
    );

    const cuenta = await this.cuentaBancariaRepository.findOne({
      where: { id_cuenta: id },
    });

    if (!cuenta) {
      this.logger.warn(
        `No se encontró CuentaBancaria para cambiar estado. ID: ${id}`,
      );
      throw new NotFoundException(
        'No se encontró la cuenta bancaria solicitada.',
      );
    }

    const estadoAnterior = cuenta.estado;
    cuenta.estado = cuenta.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    cuenta._updated_at = new Date();
    cuenta._user_update = id_usuario;
    cuenta.usuario_actualizador = {
      idUsuario: id_usuario,
    } as Usuario;

    if (cuenta.estado === 'INACTIVO') {
      cuenta._deleted_at = new Date();
      cuenta._user_delete = id_usuario;
      cuenta.usuario_eliminador = {
        idUsuario: id_usuario,
      } as Usuario;
    } else {
      cuenta._deleted_at = null;
      cuenta._user_delete = null;
      cuenta.usuario_eliminador = null;
    }

    try {
      await this.cuentaBancariaRepository.save(cuenta);

      this.logger.log(
        `Estado de CuentaBancaria cambiado correctamente. ID: ${id}, Estado anterior: ${estadoAnterior}, Estado nuevo: ${cuenta.estado}, Usuario: ${id_usuario}`,
      );

      return {
        message: `Registro de la cuenta bancaria ${cuenta.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
      };
    } catch (error) {
      this.logger.error(
        `Error al cambiar el estado de la cuenta bancaria. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Ocurrió un error al cambiar el estado de la cuenta bancaria.',
      );
    }
  }
}
