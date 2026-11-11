import { BadRequestException, ConflictException } from "@nestjs/common";
import {
  And,
  FindOperator,
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";
import type { QueryRolModuloPermisoDto } from '../dto/query-rol-modulo-permiso.dto';
import { PaginatedResponse } from "../../../shared/interface/paginated-response.interface";
import { esErrorDuplicado } from "../../../shared/util/errores-duplicados.util";

/**
 * Módulo: Seguridad / rol-modulo-permiso
 * Archivo: asignaciones.util.ts
 * Descripción:
 *   Validaciones, fechas y paginación del módulo. No ejecuta consultas ni modifica datos.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */

/** Valida UUID y normaliza su escritura; evita duplicados por mayúsculas en los DTOs. */
export function uuid(valor: string): string {
  if (
    typeof valor !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      valor,
    )
  ) {
    throw new BadRequestException("Debe proporcionar un UUID válido.");
  }
  return valor.toLowerCase();
}

/** Normaliza una selección y prohíbe repetir IDs antes de escribir. */
export function idsUnicos(valores: string[], permitirVacio = true): string[] {
  if (
    !Array.isArray(valores) ||
    valores.length > 100 ||
    (!permitirVacio && !valores.length)
  ) {
    throw new BadRequestException(
      "Debe enviar una lista válida de hasta 100 UUID.",
    );
  }
  const ids = valores.map(uuid);
  if (new Set(ids).size !== ids.length)
    throw new BadRequestException("La lista contiene UUID repetidos.");
  return ids;
}

/** Escapa comodines; la búsqueda coincide con texto literal. */
export function escaparLike(valor: string): string {
  return valor.replace(/[\\%_]/g, "\\$&");
}

/** Configuración validada; los servicios deciden si las fechas pertenecen al padre o a la asignación. */
export function prepararQuery(query: QueryRolModuloPermisoDto) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const status = query.status ?? "ACTIVO";
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "DESC";
  const dateField = query.dateField ?? "createdAt";
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger((page - 1) * limit) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  )
    throw new BadRequestException(
      "Paginación inválida: page >= 1 y limit entre 1 y 100.",
    );
  if (!["ACTIVO", "INACTIVO", "TODOS"].includes(status))
    throw new BadRequestException("status debe ser ACTIVO, INACTIVO o TODOS.");
  if (sortBy !== "createdAt" && sortBy !== "updatedAt")
    throw new BadRequestException("sortBy debe ser createdAt o updatedAt.");
  if (sortOrder !== "ASC" && sortOrder !== "DESC")
    throw new BadRequestException("sortOrder debe ser ASC o DESC.");
  if (dateField !== "createdAt" && dateField !== "updatedAt")
    throw new BadRequestException("dateField debe ser createdAt o updatedAt.");
  if (query.search !== undefined && typeof query.search !== "string")
    throw new BadRequestException("search debe ser un texto.");
  const search = (query.search ?? "").trim();
  if (search.length > 100)
    throw new BadRequestException("search admite hasta 100 caracteres.");
  const inicio = query.startDate
    ? convertirFechaFiltro(query.startDate, false)
    : null;
  const fin = query.endDate ? convertirFechaFiltro(query.endDate, true) : null;
  if (
    inicio &&
    fin &&
    (fin.exclusivo ? inicio.valor >= fin.valor : inicio.valor > fin.valor)
  )
    throw new BadRequestException(
      "startDate no puede ser posterior a endDate.",
    );
  const fecha =
    inicio && fin
      ? And(
          MoreThanOrEqual(inicio.valor),
          fin.exclusivo ? LessThan(fin.valor) : LessThanOrEqual(fin.valor),
        )
      : inicio
        ? MoreThanOrEqual(inicio.valor)
        : fin
          ? fin.exclusivo
            ? LessThan(fin.valor)
            : LessThanOrEqual(fin.valor)
          : undefined;
  return { page, limit, status, sortBy, sortOrder, dateField, search, fecha };
}

/** Filtro de búsqueda exacta de usuario por UUID, username o CI. */
export function filtroIdentificadorUsuario(valor: string): {
  idUsuario?: string;
  username?: FindOperator<string>;
  ci?: string;
} {
  if (typeof valor !== "string")
    throw new BadRequestException("Identificador inválido.");
  const texto = valor.trim();
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      texto,
    )
  )
    return { idUsuario: uuid(texto) };
  if (/^[0-9]{1,30}$/.test(texto)) return { ci: texto };
  if (
    texto.length >= 3 &&
    texto.length <= 50 &&
    /^[a-z]+(\.[a-z]+)*$/.test(texto)
  )
    return { username: ILike(escaparLike(texto)) };
  throw new BadRequestException(
    "Debe proporcionar un UUID, username o CI válido.",
  );
}

/** Filtro administrativo de estado y eliminación. */
export function filtroAsignacion<T>(status: string): FindOptionsWhere<T> {
  return {
    deletedAt: IsNull(),
    ...(status === "TODOS" ? {} : { estado: status }),
  } as FindOptionsWhere<T>;
}

/** Construye los metadatos compartidos por todos los listados. */
export function paginar<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
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

/** Elimina duplicados concurrentes como HTTP 409; los demás errores se conservan. */
export function relanzarError(error: unknown): never {
  if (esErrorDuplicado(error))
    throw new ConflictException(
      "La asignación ya existe. Vuelva a consultar sus datos.",
    );
  throw error;
}

/** Rango de fechas: días completos de Bolivia e instantes ISO con zona explícita. */
export function convertirFechaFiltro(
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
      throw new BadRequestException("La fecha enviada no es válida.");
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
      "La fecha debe ser AAAA-MM-DD o una fecha ISO con zona horaria.",
    );
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    throw new BadRequestException("La fecha enviada no es válida.");
  }

  return {
    valor,
    exclusivo: false,
  };
}
