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
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { QueryPermisoDto } from './dto/query-permiso.dto';
import { Permiso } from './entities/permiso.entity';
import {
  PermisoCreateResponse,
  PermisoDetalleResponse,
  PermisoEstadoResponse,
  PermisoListadoResponse,
} from './interfaces/permiso-response.interface';
import {
  mapResponsePermisoDetalle,
  mapResponsePermisoListado,
} from './util/map-response-permiso.util';

/**
 * Lógica de permiso. Utiliza Repository de TypeORM, sin QueryBuilder.
 * Desarrollado por: Oscar Canchari.
 */
@Injectable()
export class PermisoService {
  private readonly logger = new Logger(PermisoService.name);

  constructor(
    @InjectRepository(Permiso)
    private readonly repositorio: Repository<Permiso>,
  ) {}

  /** POST /api/permiso: valida unicidad, asigna estado y registra al responsable. */
  async crear(
    dto: CreatePermisoDto,
    responsable: string,
  ): Promise<PermisoCreateResponse> {
    const nombre = this.exigirTexto(dto.nombre, 'nombre').trim();
    const codigo = this.exigirTexto(dto.codigo, 'codigo').trim().toUpperCase();
    await this.verificarDuplicados(nombre, codigo);
    const registro = this.repositorio.create({
      nombre: nombre,
      codigo,
      descripcion: dto.descripcion?.trim() ?? null,
      estado: 'ACTIVO',
      user_created: responsable,
      user_update: null,
      user_deleted: null,
      deleted_at: null,
    });
    try {
      const guardado = await this.repositorio.save(registro);
      this.logger.log(`Permiso creado: ${guardado.id}`);
      return { message: 'Permiso creado correctamente.', id: guardado.id };
    } catch (error) {
      this.manejarErrorDuplicado(error);
      throw error;
    }
  }

  /**
   * GET /api/permiso: pagina y busca por nombre o código.
   * Combina estado y fechas en cada condición OR de búsqueda.
   * Los días sin hora se interpretan en Bolivia (UTC-04:00).
   */
  async listar(
    query: QueryPermisoDto,
  ): Promise<PaginatedResponse<PermisoListadoResponse>> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
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
    const status = query.status ?? 'ACTIVO';
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';
    const dateField = query.dateField ?? 'createdAt';
    if (!['ACTIVO', 'INACTIVO', 'TODOS'].includes(status))
      throw new BadRequestException(
        'status debe ser ACTIVO, INACTIVO o TODOS.',
      );
    if (!['createdAt', 'updatedAt'].includes(sortBy))
      throw new BadRequestException('sortBy debe ser createdAt o updatedAt.');
    if (sortOrder !== 'ASC' && sortOrder !== 'DESC')
      throw new BadRequestException('sortOrder debe ser ASC o DESC.');
    if (dateField !== 'createdAt' && dateField !== 'updatedAt')
      throw new BadRequestException(
        'dateField debe ser createdAt o updatedAt.',
      );

    const filtro: FindOptionsWhere<Permiso> = { deleted_at: IsNull() };
    if (status !== 'TODOS') filtro.estado = status;
    const inicio = query.startDate
      ? this.convertirFechaFiltro(query.startDate, false)
      : null;
    const fin = query.endDate
      ? this.convertirFechaFiltro(query.endDate, true)
      : null;
    if (
      inicio &&
      fin &&
      (fin.exclusivo ? inicio.valor >= fin.valor : inicio.valor > fin.valor)
    ) {
      throw new BadRequestException(
        'startDate no puede ser posterior a endDate.',
      );
    }
    // Traducir los nombres públicos a las propiedades reales de la entidad.
    const campoFecha = dateField === 'createdAt' ? 'created_at' : 'updated_at';
    if (inicio && fin)
      filtro[campoFecha] = And(
        MoreThanOrEqual(inicio.valor),
        fin.exclusivo ? LessThan(fin.valor) : LessThanOrEqual(fin.valor),
      );
    else if (inicio) filtro[campoFecha] = MoreThanOrEqual(inicio.valor);
    else if (fin)
      filtro[campoFecha] = fin.exclusivo
        ? LessThan(fin.valor)
        : LessThanOrEqual(fin.valor);

    const search = (query.search ?? '').trim();
    if (search.length > 100)
      throw new BadRequestException(
        'La búsqueda no debe superar 100 caracteres.',
      );
    let where: FindOptionsWhere<Permiso> | FindOptionsWhere<Permiso>[] = filtro;
    if (search) {
      const patron = `%${this.escaparLike(search)}%`;
      where = [
        { ...filtro, nombre: ILike(patron) },
        { ...filtro, codigo: ILike(patron) },
      ];
    }
    // El UUID desempata para mantener estable el orden de las páginas.
    const order: FindOptionsOrder<Permiso> =
      sortBy === 'updatedAt'
        ? { updated_at: sortOrder, id: 'ASC' }
        : { created_at: sortOrder, id: 'ASC' };
    const [registros, total] = await this.repositorio.findAndCount({
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nombre: true,
        codigo: true,
        estado: true,
        user_created: true,
        created_at: true,
      },
    });
    const totalPages = Math.ceil(total / limit);
    return {
      items: registros.map(mapResponsePermisoListado),
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

  /** GET /api/permiso/buscar/:valor: consulta exacta por UUID o código. */
  async buscarPorIdentificador(valor: string): Promise<PermisoDetalleResponse> {
    const identificador = this.exigirTexto(valor, 'identificador').trim();
    const esUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identificador,
      );
    if (!esUUID && !/^[A-Za-z0-9_]{1,40}$/.test(identificador))
      throw new BadRequestException(
        'Debe proporcionar un UUID o código válido.',
      );
    const where: FindOptionsWhere<Permiso> = esUUID
      ? { id: identificador, deleted_at: IsNull() }
      : {
          codigo: ILike(this.escaparLike(identificador)),
          deleted_at: IsNull(),
        };
    const registro = await this.repositorio.findOne({ where });
    if (!registro) throw new NotFoundException('Permiso no encontrado.');
    return mapResponsePermisoDetalle(registro);
  }

  /** PATCH /api/permiso/:id: actualiza solo campos permitidos y excluye el propio ID al validar duplicados. */
  async editar(
    id: string,
    dto: UpdatePermisoDto,
    responsable: string,
  ): Promise<PermisoDetalleResponse> {
    const registro = await this.obtenerRegistro(id);
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
    const permitidos = new Set(['nombre', 'codigo', 'descripcion']);
    const invalido = Object.keys(dto).find((campo) => !permitidos.has(campo));
    if (invalido)
      throw new BadRequestException(`El campo ${invalido} no está permitido.`);
    const nombre =
      dto.nombre !== undefined
        ? this.exigirTexto(dto.nombre, 'nombre').trim()
        : undefined;
    const codigo =
      dto.codigo !== undefined
        ? this.exigirTexto(dto.codigo, 'codigo').trim().toUpperCase()
        : undefined;
    await this.verificarDuplicados(nombre, codigo, id);
    if (nombre !== undefined) registro.nombre = nombre;
    if (codigo !== undefined) registro.codigo = codigo;
    if (dto.descripcion !== undefined)
      registro.descripcion =
        dto.descripcion === null ? null : dto.descripcion.trim();
    registro.user_update = responsable;
    try {
      const actualizado = await this.repositorio.save(registro);
      this.logger.log(`Permiso actualizado: ${id}`);
      return mapResponsePermisoDetalle(actualizado);
    } catch (error) {
      this.manejarErrorDuplicado(error);
      throw error;
    }
  }

  /** PATCH /api/permiso/:id/estado: alterna alta/baja sin recibir body. */
  async cambiarEstado(
    id: string,
    responsable: string,
  ): Promise<PermisoEstadoResponse> {
    const registro = await this.obtenerRegistro(id);
    if (registro.estado !== 'ACTIVO' && registro.estado !== 'INACTIVO')
      throw new BadRequestException('El estado actual no es válido.');
    registro.estado = registro.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    registro.user_update = responsable;
    await this.repositorio.save(registro);
    const accion = registro.estado === 'ACTIVO' ? 'alta' : 'baja';
    this.logger.log(`Permiso dado de ${accion}: ${id}`);
    return {
      message: `Permiso dado de ${accion} correctamente.`,
      id,
      estado: registro.estado,
    };
  }

  /** Recupera un registro existente que no haya sido eliminado lógicamente. */
  private async obtenerRegistro(id: string): Promise<Permiso> {
    const registro = await this.repositorio.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!registro) throw new NotFoundException('Permiso no encontrado.');
    return registro;
  }

  /** Valida nombre y código sin distinguir mayúsculas. Reserva también los valores eliminados. */
  private async verificarDuplicados(
    nombre?: string,
    codigo?: string,
    excluirId?: string,
  ): Promise<void> {
    const base: FindOptionsWhere<Permiso> = excluirId
      ? { id: Not(excluirId) }
      : {};
    if (
      nombre !== undefined &&
      (await this.repositorio.findOne({
        where: { ...base, nombre: ILike(this.escaparLike(nombre)) },
        withDeleted: true,
      }))
    ) {
      throw new ConflictException('Ya existe un permiso con ese nombre.');
    }
    if (
      codigo !== undefined &&
      (await this.repositorio.findOne({
        where: { ...base, codigo: ILike(this.escaparLike(codigo)) },
        withDeleted: true,
      }))
    ) {
      throw new ConflictException('Ya existe un permiso con ese código.');
    }
  }

  /** Impide null, tipos incorrectos y textos vacíos en campos obligatorios. */
  private exigirTexto(valor: unknown, campo: string): string {
    if (typeof valor !== 'string' || !valor.trim())
      throw new BadRequestException(
        `El campo ${campo} debe ser un texto no vacío.`,
      );
    return valor;
  }

  /** Traduce una violación UNIQUE de PostgreSQL a HTTP 409. */
  private manejarErrorDuplicado(error: unknown): void {
    if (esErrorDuplicado(error))
      throw new ConflictException(
        'Ya existe un permiso con ese nombre o código.',
      );
  }

  /** Escapa %, _ y barra invertida para buscar texto literal mediante ILIKE. */
  private escaparLike(valor: string): string {
    return valor.replace(/[\\%_]/g, '\\$&');
  }

  /** Convierte días de Bolivia y fechas ISO con zona; el fin de un día es exclusivo. */
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
}
