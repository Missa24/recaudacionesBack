/**
 * Módulo: Catálogos - Cuentas Bancarias
 * Archivo: cuenta-bancaria.service.ts
 * Descripción:
 * Contiene la lógica de negocio para el registro, consulta,
 * actualización y administración de cuentas bancarias.
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
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOptionsWhere,
  ILike,
  LessThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

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
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class CuentaBancariaService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
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
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async crear(
    dto: CreateCuentaBancariaDto,
    id_usuario: string,
  ): Promise<CuentaBancariaCreateResponse> {
    // Valida que el banco exista delegando al BancoService.
    await this.bancoService.validarBanco(dto.id_banco);

    // Valida la dependencia solo si fue enviada.
    if (dto.id_dependencia) {
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

      return {
        message: 'La cuenta bancaria fue registrada correctamente.',
        id: guardada.id_cuenta,
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
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
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async listar(
    query: QueryCuentaBancariaDto,
  ): Promise<PaginatedResponse<CuentaBancariaResponse>> {
    const {
      page = 1,
      limit = 10,
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

    // Validar rango de fechas
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    // Campos permitidos para ordenar
    const camposOrdenamiento: Record<string, keyof CuentaBancaria> = {
      nro_cuenta: 'nro_cuenta',
      nombre_cuenta: 'nombre_cuenta',
      tipo: 'tipo',
      createdAt: '_created_at',
      updatedAt: '_updated_at',
    };

    const campoOrdenamiento = camposOrdenamiento[sortBy] ?? '_created_at';

    // Construir filtros comunes
    const filtros: FindOptionsWhere<CuentaBancaria> = {};

    // Filtro por estado
    if (status && status !== 'TODOS') {
      filtros.estado = status;
    } else if (!status) {
      filtros.estado = 'ACTIVO';
    }

    // Filtro por banco
    if (id_banco) {
      filtros.id_banco = id_banco;
    }

    // Filtro por dependencia
    if (id_dependencia) {
      filtros.id_dependencia = id_dependencia;
    }

    // Filtro por tipo
    if (tipo) {
      filtros.tipo = tipo;
    }

    // Filtro por rango de fechas (horario Bolivia)
    if (startDate && endDate) {
      filtros._created_at = And(
        MoreThanOrEqual(new Date(`${startDate}T00:00:00.000`)),
        LessThan(new Date(`${endDate}T23:59:59.999`)),
      );
    } else if (startDate) {
      filtros._created_at = MoreThanOrEqual(
        new Date(`${startDate}T00:00:00.000`),
      );
    } else if (endDate) {
      filtros._created_at = LessThan(new Date(`${endDate}T23:59:59.999`));
    }

    // Construir condiciones OR para búsqueda general
    const condiciones: FindOptionsWhere<CuentaBancaria>[] = [];

    if (search?.trim()) {
      const busqueda = ILike(`%${search.trim()}%`);

      condiciones.push(
        { ...filtros, nro_cuenta: busqueda },
        { ...filtros, nombre_cuenta: busqueda },
        { ...filtros, tipo: busqueda },
      );
    } else {
      condiciones.push(filtros);
    }

    try {
      const [registros, total] =
        await this.cuentaBancariaRepository.findAndCount({
          where: condiciones,
          relations: {
            usuario_creador: true,
            usuario_actualizador: true,
            banco: true,
            dependencia: true,
          },
          order: {
            [campoOrdenamiento]: sortOrder ?? 'DESC',
          },
          skip: (page - 1) * limit,
          take: limit,
        });

      const totalPages = Math.ceil(total / limit);

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
        `Error al listar cuentas bancarias. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  /**
   * Busca una cuenta bancaria mediante su identificador UUID.
   * Si no existe, genera una excepción de recurso no encontrado.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorId(id: string): Promise<CuentaBancariaResponse> {
    const cuenta = await this.cuentaBancariaRepository.findOne({
      where: { id_cuenta: id },
      relations: {
        usuario_creador: true,
        usuario_actualizador: true,
      },
    });

    if (!cuenta) {
      throw new NotFoundException(
        'No se encontró la cuenta bancaria solicitada.',
      );
    }

    return mapearRespuesta(cuenta);
  }

  /**
   * Actualiza la información de una cuenta bancaria.
   * Verifica su estado, referencias y unicidad cuando corresponda.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async actualizar(
    id: string,
    dto: UpdateCuentaBancariaDto,
    id_usuario: string,
  ): Promise<CuentaBancariaMessageResponse> {
    const cuenta = await this.cuentaBancariaRepository.findOne({
      where: { id_cuenta: id },
    });

    if (!cuenta) {
      throw new NotFoundException(
        'No se encontró la cuenta bancaria solicitada.',
      );
    }

    if (cuenta.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'No se puede actualizar una cuenta bancaria inactiva.',
      );
    }

    const nuevoBanco = dto.id_banco ?? cuenta.id_banco;
    const nuevoNumero = dto.nro_cuenta ?? cuenta.nro_cuenta;

    if (dto.id_banco !== undefined) {
      await this.bancoService.validarBanco(dto.id_banco);
    }

    if (dto.id_dependencia !== undefined && dto.id_dependencia !== null) {
      await this.dependenciaService.validarDependencia(dto.id_dependencia);
    }

    // Solo valida unicidad si cambia banco o número.
    if (nuevoBanco !== cuenta.id_banco || nuevoNumero !== cuenta.nro_cuenta) {
      const existente = await this.cuentaBancariaRepository.findOne({
        where: {
          id_banco: nuevoBanco,
          nro_cuenta: nuevoNumero,
          id_cuenta: Not(id),
        },
      });

      if (existente) {
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

      return {
        message: 'La cuenta bancaria fue actualizada correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
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
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async cambiarEstado(
    id: string,
    id_usuario: string,
  ): Promise<CuentaBancariaMessageResponse> {
    const cuenta = await this.cuentaBancariaRepository.findOne({
      where: { id_cuenta: id },
    });

    if (!cuenta) {
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
