import { randomUUID } from 'node:crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  And,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { PaginatedResponse } from '../../shared/interface/paginated-response.interface';
import { esErrorDuplicado } from '../../shared/util/errores-duplicados.util';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { QueryUsuarioDto } from './dto/query-usuario.dto';

import { Usuario } from './entities/usuario.entity';

import {
  UsuarioCreateResponse,
  UsuarioDetalleResponse,
  UsuarioEstadoResponse,
  UsuarioListadoResponse,
} from './interfaces/usuario-response.interface';

import {
  mapResponseUsuarioDetalle,
  mapResponseUsuarioListado,
} from './util/map-response-usuario.util';

/**
 * Módulo: Seguridad / Usuario
 * Archivo: usuario.service.ts
 *
 * Descripción:
 * Gestiona la creación, listado paginado, edición
 * y alta/baja de usuarios.
 *
 * Utiliza TypeORM Repository sin QueryBuilder.
 *
 * Desarrollado por: Oscar Canchari
 */
@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /*
  Nombre del método: crear
  Método HTTP relacionado: POST
  Endpoint: /api/usuario

  Descripción:
    Registra un usuario nuevo.
    Verifica que username, email y CI sean únicos.

    CreateUsuarioDto valida el formato de los datos.
    El Service aplica las reglas de negocio.

  Parámetros:
    - dto: Datos del usuario.
    - idUsuarioResponsable: UUID del creador.

  Respuestas:
    - 201: Usuario creado.
    - 400: Datos inválidos.
    - 409: Datos duplicados.
    - 500: Error interno.

  Desarrollado por: Oscar Canchari
  */

  async crear(
    dto: CreateUsuarioDto,
    idUsuarioResponsable: string,
  ): Promise<UsuarioCreateResponse> {
    // El DTO ya valida los formatos.
    // No convertir username ni correo a minúsculas.
    const username = dto.username;
    const email = dto.email;
    const ci = dto.ci;

    // Verificar que los identificadores no estén duplicados.
    await this.verificarDuplicados({
      username,
      email,
      ci,
    });

    // Preparar la entidad con sus datos de auditoría.
    const usuario = this.usuarioRepository.create({
      idUsuario: randomUUID(),

      username,
      email,
      ci,

      nombres: dto.nombres.trim(),
      apellidoPaterno: dto.apellido_paterno.trim(),
      apellidoMaterno: dto.apellido_materno?.trim() ?? null,
      celular: dto.celular ?? null,

      estado: 'ACTIVO',

      ultimoAcceso: null,
      deletedAt: null,
      userCreated: idUsuarioResponsable,
      userUpdate: null,
      userDeleted: null,
    });

    try {
      // Guardar en la tabla seguridad.usuario.
      const guardado = await this.usuarioRepository.save(usuario);

      this.logger.log(`Usuario creado: ${guardado.idUsuario}`);

      return {
        message: 'Usuario creado correctamente.',
      };
    } catch (error) {
      this.manejarErrorDuplicado(error);
      throw error;
    }
  }

  /*
  Nombre del método: listar
  Método HTTP relacionado: GET
  Endpoint: /api/usuario

  Descripción:
    Lista usuarios con paginación y filtros
    definidos en QueryPaginatedDto.

    La búsqueda general se realiza SOLO por:
    - username
    - ci
    - email

    Permite combinar:
    - page
    - limit
    - search
    - status
    - sortBy
    - sortOrder
    - startDate
    - endDate
    - dateField

  Respuestas:
    - 200: Listado obtenido.
    - 400: Filtros inválidos.
    - 500: Error interno.

  Notas:
    - Se excluyen usuarios eliminados lógicamente.
    - status=TODOS no filtra por estado.
    - startDate y endDate filtran fechas.
    - findAndCount aplica paginación y obtiene total.
    - El mapper prepara la respuesta del listado.

  Desarrollado por: Oscar Canchari
  */

  async listar(
    query: QueryUsuarioDto,
  ): Promise<PaginatedResponse<UsuarioListadoResponse>> {
    // 1. Obtener los parámetros de paginación.
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    // 2. Obtener los parámetros de búsqueda y filtros.
    const search = (query.search ?? '').trim();
    const status = query.status ?? 'ACTIVO';

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const startDate = query.startDate;
    const endDate = query.endDate;
    const dateField = query.dateField ?? 'createdAt';

    // 3. Validar la paginación.
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw new BadRequestException(
        'page debe ser mayor o igual a 1 y limit debe estar entre 1 y 100.',
      );
    }

    // 4. Validar estado.
    if (status !== 'ACTIVO' && status !== 'INACTIVO' && status !== 'TODOS') {
      throw new BadRequestException(
        'status debe ser ACTIVO, INACTIVO o TODOS.',
      );
    }

    // 5. Validar el campo de ordenamiento.
    if (sortBy !== 'createdAt' && sortBy !== 'updatedAt') {
      throw new BadRequestException('sortBy debe ser createdAt o updatedAt.');
    }

    // 6. Validar la dirección del ordenamiento.
    if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
      throw new BadRequestException('sortOrder debe ser ASC o DESC.');
    }

    // 7. Validar el campo utilizado para filtrar fechas.
    if (dateField !== 'createdAt' && dateField !== 'updatedAt') {
      throw new BadRequestException(
        'dateField debe ser createdAt o updatedAt.',
      );
    }

    // 8. Crear el filtro base.
    const filtroBase: FindOptionsWhere<Usuario> = {
      deletedAt: IsNull(),
    };

    /*
     * 9. Filtrar por estado.
     *
     * ACTIVO: usuarios activos.
     * INACTIVO: usuarios inactivos.
     * TODOS: ambos estados, sin restringir por estado.
     */
    if (status !== 'TODOS') {
      filtroBase.estado = status;
    }

    /*
     * 10. Convertir el rango de fechas.
     *
     * Se admite:
     * - AAAA-MM-DD (día de Bolivia, UTC-04:00).
     * - ISO con zona horaria explícita.
     */
    const inicio = startDate
      ? this.convertirFechaFiltro(startDate, false)
      : null;

    const fin = endDate ? this.convertirFechaFiltro(endDate, true) : null;

    // 11. Validar el orden cronológico.
    if (inicio && fin) {
      const rangoInvalido = fin.exclusivo
        ? inicio.valor >= fin.valor
        : inicio.valor > fin.valor;

      if (rangoInvalido) {
        throw new BadRequestException(
          'startDate no puede ser posterior a endDate.',
        );
      }
    }

    /*
     * 12. Aplicar el rango de fechas.
     *
     * dateField=createdAt:
     *   filtra por created_at.
     *
     * dateField=updatedAt:
     *   filtra por updated_at.
     */
    if (inicio && fin) {
      filtroBase[dateField] = And(
        MoreThanOrEqual(inicio.valor),
        fin.exclusivo ? LessThan(fin.valor) : LessThanOrEqual(fin.valor),
      );
    } else if (inicio) {
      filtroBase[dateField] = MoreThanOrEqual(inicio.valor);
    } else if (fin) {
      filtroBase[dateField] = fin.exclusivo
        ? LessThan(fin.valor)
        : LessThanOrEqual(fin.valor);
    }

    /*
     * 13. Preparar las condiciones de búsqueda.
     *
     * Sin búsqueda se devuelven los registros
     * que cumplen los filtros generales.
     */
    let where: FindOptionsWhere<Usuario> | FindOptionsWhere<Usuario>[] =
      filtroBase;

    /*
     * 14. Buscar únicamente por:
     * - username
     * - ci
     * - email
     *
     * ILike permite coincidencias parciales sin
     * distinguir mayúsculas de minúsculas.
     *
     * TypeORM combina las tres condiciones con OR.
     *
     * Cada condición incluye estado, fechas
     * y eliminación lógica.
     */
    if (search) {
      if (search.length > 100) {
        throw new BadRequestException(
          'La búsqueda no debe superar 100 caracteres.',
        );
      }

      // Escapar caracteres especiales de ILIKE.
      const textoBusqueda = `%${this.escaparLike(search)}%`;

      where = [
        {
          ...filtroBase,
          username: ILike(textoBusqueda),
        },
        {
          ...filtroBase,
          ci: ILike(textoBusqueda),
        },
        {
          ...filtroBase,
          email: ILike(textoBusqueda),
        },
      ];
    }

    /*
     * 15. Aplicar ordenamiento.
     *
     * sortBy=createdAt ordena por fecha de creación.
     * sortBy=updatedAt ordena por fecha de actualización.
     *
     * idUsuario actúa como segundo criterio
     * para mantener un orden estable.
     */
    const order: FindOptionsOrder<Usuario> =
      sortBy === 'updatedAt'
        ? {
            updatedAt: sortOrder,
            idUsuario: 'ASC',
          }
        : {
            createdAt: sortOrder,
            idUsuario: 'ASC',
          };

    /*
     * 16. Ejecutar el listado.
     *
     * findAndCount obtiene:
     * - usuarios de la página solicitada.
     * - cantidad total de coincidencias.
     *
     * Se seleccionan los datos necesarios
     * para mapResponseUsuarioListado().
     */
    const [usuarios, total] = await this.usuarioRepository.findAndCount({
      select: {
        idUsuario: true,
        username: true,
        ci: true,
        email: true,
        nombres: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        estado: true,
        createdAt: true,
        userCreated: true,
      },
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    // 17. Calcular información de paginación.
    const totalPages = Math.ceil(total / limit);

    // 18. Devolver datos resumidos y paginación.
    return {
      items: usuarios.map(mapResponseUsuarioListado),
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

  /*
  Nombre del método: editar
  Método HTTP relacionado: PATCH
  Endpoint: /api/usuario/:id

  Descripción:
    Modifica parcialmente los datos personales
    del usuario utilizando UpdateUsuarioDto.

    No permite editar el estado ni los
    campos de auditoría desde el body.

  Parámetros:
    - id: UUID del usuario.
    - dto: Campos que se desean modificar.
    - idUsuarioResponsable: UUID del editor.

  Respuestas:
    - 200: Usuario actualizado.
    - 400: Datos inválidos.
    - 404: Usuario no encontrado.
    - 409: Datos duplicados.
    - 500: Error interno.

  Desarrollado por: Oscar Canchari
  */

  async editar(
    id: string,
    dto: UpdateUsuarioDto,
    idUsuarioResponsable: string,
  ): Promise<UsuarioDetalleResponse> {
    // 1. Buscar usuario no eliminado.
    const usuario = await this.usuarioRepository.findOne({
      where: {
        idUsuario: id,
        deletedAt: IsNull(),
      },
    });

    if (!usuario) {
      throw new NotFoundException('No se encontró el usuario solicitado.');
    }

    // 2. Verificar que exista al menos un campo.
    if (
      !dto ||
      typeof dto !== 'object' ||
      Array.isArray(dto) ||
      Object.keys(dto).length === 0
    ) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para actualizar.',
      );
    }

    // 3. Definir los únicos campos editables.
    const permitidos = new Set([
      'username',
      'email',
      'ci',
      'nombres',
      'apellido_paterno',
      'apellido_materno',
      'celular',
    ]);

    const campoInvalido = Object.keys(dto).find(
      (campo) => !permitidos.has(campo),
    );

    if (campoInvalido) {
      throw new BadRequestException(
        `El campo ${campoInvalido} no está permitido.`,
      );
    }

    /*
     * 4. Preparar los identificadores modificados.
     *
     * PartialType hace opcionales los campos.
     * El Service impide establecer null en
     * los identificadores obligatorios.
     */
    const username =
      dto.username !== undefined
        ? this.exigirTexto(dto.username, 'username')
        : undefined;

    const email =
      dto.email !== undefined
        ? this.exigirTexto(dto.email, 'email')
        : undefined;

    const ci =
      dto.ci !== undefined ? this.exigirTexto(dto.ci, 'ci') : undefined;

    // 5. Verificar duplicados excluyendo al usuario editado.
    await this.verificarDuplicados({ username, email, ci }, id);

    // 6. Actualizar los identificadores enviados.
    if (username !== undefined) {
      usuario.username = username;
    }

    if (email !== undefined) {
      usuario.email = email;
    }

    if (ci !== undefined) {
      usuario.ci = ci;
    }

    // 7. Actualizar nombres y apellidos.
    if (dto.nombres !== undefined) {
      usuario.nombres = this.exigirTexto(dto.nombres, 'nombres').trim();
    }

    if (dto.apellido_paterno !== undefined) {
      usuario.apellidoPaterno = this.exigirTexto(
        dto.apellido_paterno,
        'apellido_paterno',
      ).trim();
    }

    // El apellido materno puede enviarse como null.
    if (dto.apellido_materno !== undefined) {
      usuario.apellidoMaterno =
        dto.apellido_materno === null
          ? null
          : this.exigirTexto(dto.apellido_materno, 'apellido_materno').trim();
    }

    // El celular también puede enviarse como null.
    if (dto.celular !== undefined) {
      usuario.celular =
        dto.celular === null ? null : this.exigirTexto(dto.celular, 'celular');
    }

    // 8. Registrar responsable de actualización.
    usuario.userUpdate = idUsuarioResponsable;

    try {
      // 9. Guardar cambios.
      const actualizado = await this.usuarioRepository.save(usuario);

      this.logger.log(`Usuario actualizado: ${actualizado.idUsuario}`);

      // 10. Devolver datos actualizados.
      return mapResponseUsuarioDetalle(actualizado);
    } catch (error) {
      this.manejarErrorDuplicado(error);
      throw error;
    }
  }

  /*
  Nombre del método: cambiarEstado
  Método HTTP relacionado: PATCH
  Endpoint: /api/usuario/:id/estado

  Descripción:
    Cambia automáticamente el estado del usuario.

    ACTIVO -> INACTIVO (baja).
    INACTIVO -> ACTIVO (alta).

    No requiere body.

  Parámetros:
    - id: UUID del usuario.
    - idUsuarioResponsable: UUID del responsable.

  Respuestas:
    - 200: Estado actualizado.
    - 400: Estado actual inválido.
    - 404: Usuario no encontrado.
    - 500: Error interno.

  Desarrollado por: Oscar Canchari
  */

  async cambiarEstado(
    id: string,
    idUsuarioResponsable: string,
  ): Promise<UsuarioEstadoResponse> {
    // Buscar usuario no eliminado.
    const usuario = await this.usuarioRepository.findOne({
      where: {
        idUsuario: id,
        deletedAt: IsNull(),
      },
    });

    if (!usuario) {
      throw new NotFoundException('No se encontró el usuario solicitado.');
    }

    // Validar y alternar el estado.
    if (usuario.estado !== 'ACTIVO' && usuario.estado !== 'INACTIVO') {
      throw new BadRequestException(
        'El estado actual del usuario no es válido.',
      );
    }

    usuario.estado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    usuario.userUpdate = idUsuarioResponsable;

    await this.usuarioRepository.save(usuario);

    return {
      message: `Usuario dado de ${
        usuario.estado === 'ACTIVO' ? 'alta' : 'baja'
      } correctamente.`,
      idUsuario: usuario.idUsuario,
    };
  }
  /*
  Nombre del método: verificarDuplicados

  Descripción:
    Comprueba que username, email y CI no estén
    registrados por otro usuario.

    En edición, excluirId evita que un usuario
    se considere duplicado de sí mismo.

  Desarrollado por: Oscar Canchari
  */

  private async verificarDuplicados(
    datos: {
      username?: string;
      email?: string;
      ci?: string;
    },
    excluirId?: string,
  ): Promise<void> {
    // Excluir al usuario actual cuando se edita.
    const filtroBase: FindOptionsWhere<Usuario> = excluirId
      ? { idUsuario: Not(excluirId) }
      : {};

    // Comprobar username duplicado.
    if (datos.username !== undefined) {
      const existente = await this.usuarioRepository.findOne({
        where: {
          ...filtroBase,
          username: ILike(this.escaparLike(datos.username)),
        },
      });

      if (existente) {
        throw new ConflictException('Ya existe un usuario con ese username.');
      }
    }

    // Comprobar correo duplicado.
    if (datos.email !== undefined) {
      const existente = await this.usuarioRepository.findOne({
        where: {
          ...filtroBase,
          email: ILike(this.escaparLike(datos.email)),
        },
      });

      if (existente) {
        throw new ConflictException(
          'Ya existe un usuario con ese correo electrónico.',
        );
      }
    }

    // Comprobar CI duplicado.
    if (datos.ci !== undefined) {
      const existente = await this.usuarioRepository.findOne({
        where: {
          ...filtroBase,
          ci: datos.ci,
        },
      });

      if (existente) {
        throw new ConflictException(
          'Ya existe un usuario con ese carnet de identidad.',
        );
      }
    }
  }

  /*
  Nombre del método: exigirTexto

  Descripción:
    Verificación adicional para impedir enviar null,
    valores no textuales o cadenas vacías a campos
    que no deben quedar vacíos durante la edición.

    Las reglas de formato siguen perteneciendo al DTO.

  Desarrollado por: Oscar Canchari
  */

  private exigirTexto(valor: unknown, campo: string): string {
    if (typeof valor !== 'string' || valor.trim().length === 0) {
      throw new BadRequestException(
        `El campo ${campo} debe ser un texto no vacío.`,
      );
    }

    return valor;
  }

  /*
  Nombre del método: manejarErrorDuplicado

  Descripción:
    Convierte errores de unicidad de PostgreSQL
    en una excepción HTTP 409.

  Desarrollado por: Oscar Canchari
  */

  private manejarErrorDuplicado(error: unknown): void {
    if (esErrorDuplicado(error)) {
      throw new ConflictException(
        'Ya existe un usuario con ese username, correo o CI.',
      );
    }
  }

  /*
  Nombre del método: escaparLike

  Descripción:
    Escapa los caracteres especiales %, _ y \
    para que PostgreSQL los busque literalmente.

  Desarrollado por: Oscar Canchari
  */

  private escaparLike(valor: string): string {
    return valor.replace(/[\\%_]/g, '\\$&');
  }

  /*
  Nombre del método: convertirFechaFiltro

  Descripción:
    Convierte una fecha recibida desde QueryPaginatedDto
    a un valor Date que puede utilizar TypeORM.

    Para AAAA-MM-DD:
    - Inicio: 00:00 del día en Bolivia.
    - Fin: 00:00 del día siguiente, exclusivo.

    Para una fecha ISO con zona horaria:
    - Se utiliza el instante exacto enviado.
    - En endDate, ese instante es inclusivo.

  Parámetros:
    - fecha: Fecha enviada por query.
    - esFinal: Indica si corresponde a endDate.

  Desarrollado por: Oscar Canchari
  */

  private convertirFechaFiltro(
    fecha: string,
    esFinal: boolean,
  ): {
    valor: Date;
    exclusivo: boolean;
  } {
    // Comprobar si se envió únicamente AAAA-MM-DD.
    const soloDia = /^\d{4}-\d{2}-\d{2}$/.test(fecha);

    if (soloDia) {
      // Validar que la fecha exista realmente.
      const comprobacion = new Date(`${fecha}T00:00:00.000Z`);

      if (
        Number.isNaN(comprobacion.getTime()) ||
        comprobacion.toISOString().slice(0, 10) !== fecha
      ) {
        throw new BadRequestException('La fecha enviada no es válida.');
      }

      // Inicio del día en Bolivia, UTC-04:00.
      const inicioBolivia = new Date(`${fecha}T00:00:00-04:00`);

      if (esFinal) {
        // Incluir todo el último día.
        return {
          valor: new Date(inicioBolivia.getTime() + 24 * 60 * 60 * 1000),
          exclusivo: true,
        };
      }

      return {
        valor: inicioBolivia,
        exclusivo: false,
      };
    }

    /*
     * Para fechas con hora, exigir zona horaria
     * explícita para evitar diferencias por la zona
     * horaria del servidor.
     */
    if (!/(Z|[+-]\d{2}:\d{2})$/i.test(fecha)) {
      throw new BadRequestException(
        'La fecha debe ser AAAA-MM-DD o una fecha ISO con zona horaria.',
      );
    }

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
      throw new BadRequestException('La fecha enviada no es válida.');
    }

    return {
      valor,
      exclusivo: false,
    };
  }

  /*
  Nombre del método: buscarPorIdentificador
  Método HTTP relacionado: GET
  Endpoint: /api/usuario/buscar/:valor

  Descripción:
    Busca un usuario mediante uno de los siguientes datos:
    - UUID del usuario.
    - Username.
    - Carnet de identidad.

    El método identifica automáticamente el tipo de dato.

    No devuelve usuarios eliminados lógicamente.

  Parámetros:
    - valor: UUID, username o CI del usuario.

  Respuestas posibles:
    - 200: Usuario encontrado correctamente.
    - 400: Identificador inválido.
    - 401: No autorizado, validado en Controller.
    - 404: Usuario no encontrado.
    - 500: Error interno del servidor.

  Desarrollado por: Oscar Canchari
  Fecha: 11/11/2026

  Notas adicionales:
    Utiliza findOne de TypeORM.
    No utiliza QueryBuilder.
    Devuelve la información completa del usuario.
*/

  async buscarPorIdentificador(valor: string): Promise<UsuarioDetalleResponse> {
    // 1. Eliminar espacios al inicio y al final.
    const identificador = valor.trim();

    // 2. Validar que se haya enviado un identificador.
    if (!identificador) {
      throw new BadRequestException(
        'Debe proporcionar un UUID, username o CI.',
      );
    }

    // 3. Preparar el filtro de búsqueda.
    let where: FindOptionsWhere<Usuario>;

    /*
     * 4. Identificar si el valor tiene formato UUID.
     *
     * Ejemplo:
     * 550e8400-e29b-41d4-a716-446655440000
     */
    const esUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identificador,
      );

    /*
     * 5. Identificar si el valor es un CI.
     *
     * Se admiten solamente números.
     * Máximo 30 dígitos.
     */
    const esCI = /^[0-9]{1,30}$/.test(identificador);

    /*
     * 6. Identificar si el valor es un username.
     *
     * Solo letras minúsculas y puntos entre palabras.
     * Entre 3 y 50 caracteres.
     */
    const esUsername =
      identificador.length >= 3 &&
      identificador.length <= 50 &&
      /^[a-z]+(\.[a-z]+)*$/.test(identificador);

    // 7. Determinar qué campo utilizar para consultar.
    if (esUUID) {
      // Búsqueda por UUID.
      where = {
        idUsuario: identificador,
        deletedAt: IsNull(),
      };
    } else if (esCI) {
      // Búsqueda por carnet de identidad.
      where = {
        ci: identificador,
        deletedAt: IsNull(),
      };
    } else if (esUsername) {
      // Búsqueda exacta por username, sin distinguir mayúsculas.
      where = {
        username: ILike(identificador),
        deletedAt: IsNull(),
      };
    } else {
      throw new BadRequestException(
        'El identificador debe ser un UUID, username o CI válido.',
      );
    }

    // 8. Consultar la base de datos.
    const usuario = await this.usuarioRepository.findOne({
      where,
    });

    // 9. Verificar si existe el usuario.
    if (!usuario) {
      throw new NotFoundException(
        'No se encontró ningún usuario con el identificador proporcionado.',
      );
    }

    // 10. Devolver la información completa.
    return mapResponseUsuarioDetalle(usuario);
  }
}
