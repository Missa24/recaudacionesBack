import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DataSource,
  EntityManager,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
} from "typeorm";
import { Rol } from "../rol/entities/rol.entity";
import { Modulo } from "../modulo/entities/modulo.entity";
import { Permiso } from "../permiso/entities/permiso.entity";
import { RolModuloPermiso } from "../rol-modulo-permiso/entities/rol-modulo-permiso.entity";
import { PaginatedResponse } from "../../shared/interface/paginated-response.interface";
import {
  MensajeIdResponse,
  MensajeIdsResponse,
  RolConModulos,
  RolModuloPermisoListadoResponse,
} from "./interfaces/rol-modulo-permiso-response.interface";
import {
  escaparLike,
  filtroAsignacion,
  idsUnicos,
  paginar,
  prepararQuery,
  relanzarError,
  uuid,
} from "./util/asignaciones.util";
import {
  mapRolModulos,
} from "./util/map-response-rol-modulo-permiso.util";
import {
  AsignarModulosPermisosDto,
  ModuloPermisosDto,
} from "./dto/asignar-modulos-permisos.dto";
import { ActualizarModulosPermisosDto } from "./dto/actualizar-modulos-permisos.dto";
import { QueryRolModuloPermisoDto } from "./dto/query-rol-modulo-permiso.dto";

/**
 * Módulo: Seguridad / Rol Módulo Permiso
 * Archivo: rol-modulo-permiso.service.ts
 * Descripción:
 *   Configura accesos por rol sin consultas duplicadas de usuarios ni QueryBuilder.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */
@Injectable()
export class RolModuloPermisoService {
  constructor(private readonly dataSource: DataSource) {}

  /*
  Nombre del método: asignarModulosPermisos
  Método HTTP relacionado: POST
  Endpoint: /api/rol-modulo-permiso

  Descripción:
    Agrega módulos y sus permisos a un rol sin quitar accesos actuales.

  Parámetros:
    - dto: Rol y módulos con permisos.
    - responsable: UUID del actor.

  Respuestas posibles:
    - 201: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Registra al responsable. Las operaciones múltiples son transaccionales.
    El estado corresponde a la asignación, no a los catálogos.
  */
  async asignarModulosPermisos(
    dto: AsignarModulosPermisosDto,
    responsable: string,
  ): Promise<MensajeIdsResponse> {
    return this.guardarAccesos(
      uuid(dto.idRol),
      this.normalizarSeleccion(dto.modulos, false),
      uuid(responsable),
      false,
    );
  }

  /*
  Nombre del método: listarRolesConModulosPermisos
  Método HTTP relacionado: GET
  Endpoint: /api/rol-modulo-permiso

  Descripción:
    Pagina asignaciones. El primer id es la PK de rol_modulo_permiso.
    search busca por nombre o código del rol.

  Parámetros:
    - query: Paginación, estado y fechas de la asignación.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Devuelve únicamente los campos definidos en las interfaces.
    Excluye asignaciones eliminadas, salvo las reactivadas al asignar.
  */
  async listarRolesConModulosPermisos(
    query: QueryRolModuloPermisoDto,
  ): Promise<PaginatedResponse<RolModuloPermisoListadoResponse>> {
    const q = prepararQuery(query);

    // Cada elemento corresponde a una fila de rol_modulo_permiso.
    const base: FindOptionsWhere<RolModuloPermiso> = {
      ...filtroAsignacion<RolModuloPermiso>(q.status),
      rol: { deleted_at: IsNull() },
      modulo: { deleted_at: IsNull() },
      permiso: { deleted_at: IsNull() },
    };
    if (q.fecha) base[q.dateField] = q.fecha;

    const patron = ILike(`%${escaparLike(q.search)}%`);
    const where: FindOptionsWhere<RolModuloPermiso> | FindOptionsWhere<RolModuloPermiso>[] = q.search
      ? [
          { ...base, rol: { deleted_at: IsNull(), nombre: patron } },
          { ...base, rol: { deleted_at: IsNull(), codigo: patron } },
        ]
      : base;

    const order: FindOptionsOrder<RolModuloPermiso> = q.sortBy === 'updatedAt'
      ? { updatedAt: q.sortOrder, id: 'ASC' }
      : { createdAt: q.sortOrder, id: 'ASC' };

    const [asignaciones, total] = await this.dataSource
      .getRepository(RolModuloPermiso)
      .findAndCount({
        where,
        relations: { rol: true, modulo: true, permiso: true },
        order,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      });

    const items: RolModuloPermisoListadoResponse[] = asignaciones.map(a => ({
      // PK de la combinación rol, módulo y permiso.
      id: a.id,
      rol: { id: a.idRol, nombre: a.rol.nombre },
      modulo: { id: a.idModulo, nombres: a.modulo.nombres },
      permiso: { id: a.idPermiso, codigo: a.permiso.codigo },
      estado: a.estado,
    }));

    return paginar(items, total, q.page, q.limit);
  }

  /*
  Nombre del método: buscarRolConModulosPermisos
  Método HTTP relacionado: GET
  Endpoint: /api/rol-modulo-permiso/rol/:valor

  Descripción:
    Consulta un rol por UUID o código y agrupa sus módulos y permisos.

  Parámetros:
    - valor: UUID o código.
    - query: Estado, búsqueda de módulos/permisos y fechas de asignación; no pagina el detalle.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Devuelve únicamente los campos definidos en las interfaces.
    Excluye asignaciones eliminadas, salvo las reactivadas al asignar.
  */
  async buscarRolConModulosPermisos(
    valor: string,
    query: QueryRolModuloPermisoDto,
  ): Promise<RolConModulos> {
    const texto = valor.trim();
    const esUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        texto,
      );
    if (!esUUID && !/^[A-Za-z0-9_]{1,40}$/.test(texto))
      throw new BadRequestException(
        "Debe proporcionar un UUID o código válido.",
      );
    const rol = await this.dataSource
      .getRepository(Rol)
      .findOne({
        where: {
          ...(esUUID
            ? { id: uuid(texto) }
            : { codigo: ILike(escaparLike(texto)) }),
          deleted_at: IsNull(),
        },
      });
    if (!rol) throw new NotFoundException("No se encontró el rol solicitado.");
    const q = prepararQuery(query);
    const base: FindOptionsWhere<RolModuloPermiso> = {
      ...filtroAsignacion<RolModuloPermiso>(q.status),
      idRol: rol.id,
      modulo: { deleted_at: IsNull() },
      permiso: { deleted_at: IsNull() },
    };
    if (q.fecha) base[q.dateField] = q.fecha;
    const patron = ILike(`%${escaparLike(q.search)}%`);
    const where = q.search
      ? [
          { ...base, modulo: { deleted_at: IsNull(), nombres: patron } },
          { ...base, modulo: { deleted_at: IsNull(), codigo: patron } },
          { ...base, permiso: { deleted_at: IsNull(), nombre: patron } },
          { ...base, permiso: { deleted_at: IsNull(), codigo: patron } },
        ]
      : base;
    const order: FindOptionsOrder<RolModuloPermiso> =
      q.sortBy === "updatedAt"
        ? { updatedAt: q.sortOrder, id: "ASC" }
        : { createdAt: q.sortOrder, id: "ASC" };
    const accesos = await this.dataSource
      .getRepository(RolModuloPermiso)
      .find({ where, relations: { modulo: true, permiso: true }, order });
    return mapRolModulos(rol, accesos);
  }

  /*
  Nombre del método: actualizarModulosPermisosDeRol
  Método HTTP relacionado: PATCH
  Endpoint: /api/rol-modulo-permiso/rol/:idRol/accesos

  Descripción:
    Guarda la configuración completa del rol; retira combinaciones omitidas. [] quita todos los accesos.

  Parámetros:
    - idRol: UUID del rol.
    - dto: Selección completa agrupada por módulo.
    - responsable: UUID del actor.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Registra al responsable. Las operaciones múltiples son transaccionales.
    El estado corresponde a la asignación, no a los catálogos.
  */
  async actualizarModulosPermisosDeRol(
    idRol: string,
    dto: ActualizarModulosPermisosDto,
    responsable: string,
  ): Promise<MensajeIdsResponse> {
    return this.guardarAccesos(
      uuid(idRol),
      this.normalizarSeleccion(dto.modulos, true),
      uuid(responsable),
      true,
    );
  }

  /*
  Nombre del método: quitarAsignacion
  Método HTTP relacionado: PATCH
  Endpoint: /api/rol-modulo-permiso/:id/quitar

  Descripción:
    Retira lógicamente una combinación rol, módulo y permiso.

  Parámetros:
    - id: UUID de la asignación.
    - responsable: UUID del actor.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Registra al responsable. Las operaciones múltiples son transaccionales.
    El estado corresponde a la asignación, no a los catálogos.
  */
  async quitarAsignacion(
    id: string,
    responsable: string,
  ): Promise<MensajeIdResponse> {
    return this.modificarAsignacion(uuid(id), uuid(responsable), true);
  }

  /*
  Nombre del método: cambiarEstado
  Método HTTP relacionado: PATCH
  Endpoint: /api/rol-modulo-permiso/:id/estado

  Descripción:
    Alterna alta/baja de una combinación. Para reactivar verifica los tres catálogos.

  Parámetros:
    - id: UUID de la asignación.
    - responsable: UUID del actor.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Registra al responsable. Las operaciones múltiples son transaccionales.
    El estado corresponde a la asignación, no a los catálogos.
  */
  async cambiarEstado(
    id: string,
    responsable: string,
  ): Promise<MensajeIdResponse> {
    return this.modificarAsignacion(uuid(id), uuid(responsable), false);
  }

  /*
  Nombre del método: guardarAccesos
  Método HTTP relacionado: POST / PATCH
  Endpoint: /api/rol-modulo-permiso

  Descripción:
    Método interno. Bloquea el rol y guarda su configuración de forma atómica.

  Parámetros:
    - idRol, selección, responsable y reemplazar: Datos normalizados.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Registra al responsable. Las operaciones múltiples son transaccionales.
    El estado corresponde a la asignación, no a los catálogos.
  */
  private async guardarAccesos(
    idRol: string,
    seleccion: ModuloPermisosDto[],
    responsable: string,
    reemplazar: boolean,
  ): Promise<MensajeIdsResponse> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const rol = await this.bloquearRol(manager, idRol);
        if (seleccion.length && rol.estado !== "ACTIVO")
          throw new BadRequestException(
            "El rol debe estar ACTIVO para asignar accesos.",
          );
        await this.validarCatalogos(manager, seleccion);
        const repo = manager.getRepository(RolModuloPermiso);
        const existentes = await repo.find({ where: { idRol } });
        const claves = new Set<string>();
        const cambios: RolModuloPermiso[] = [];
        const ids: string[] = [];
        for (const modulo of seleccion)
          for (const idPermiso of modulo.idsPermisos) {
            const idModulo = modulo.idModulo;
            claves.add(`${idModulo}:${idPermiso}`);
            let asignacion = existentes.find(
              (a) => a.idModulo === idModulo && a.idPermiso === idPermiso,
            );
            if (!asignacion) {
              asignacion = repo.create({
                id: randomUUID(),
                idRol,
                idModulo,
                idPermiso,
                estado: "ACTIVO",
                userCreated: responsable,
                userUpdate: null,
                deletedAt: null,
                userDeleted: null,
              });
              cambios.push(asignacion);
            } else if (
              asignacion.estado !== "ACTIVO" ||
              asignacion.deletedAt !== null
            ) {
              asignacion.estado = "ACTIVO";
              asignacion.deletedAt = null;
              asignacion.userDeleted = null;
              asignacion.userUpdate = responsable;
              cambios.push(asignacion);
            }
            ids.push(asignacion.id);
          }
        if (reemplazar)
          for (const asignacion of existentes) {
            if (
              !claves.has(`${asignacion.idModulo}:${asignacion.idPermiso}`) &&
              asignacion.deletedAt === null
            ) {
              asignacion.deletedAt = new Date();
              asignacion.userDeleted = responsable;
              asignacion.userUpdate = responsable;
              asignacion.estado = "INACTIVO";
              cambios.push(asignacion);
              ids.push(asignacion.id);
            }
          }
        if (cambios.length) await repo.save(cambios);
        return {
          message: reemplazar
            ? "Módulos y permisos del rol actualizados correctamente."
            : "Módulos y permisos asignados correctamente.",
          ids,
        };
      });
    } catch (error) {
      return relanzarError(error);
    }
  }

  /*
  Nombre del método: modificarAsignacion
  Método HTTP relacionado: PATCH
  Endpoint: /api/rol-modulo-permiso/:id

  Descripción:
    Método interno. Retira o alterna el estado sin afectar las demás combinaciones.

  Parámetros:
    - id, responsable y quitar: Identidad y operación.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    - 409: Conflicto de asignación.
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Registra al responsable. Las operaciones múltiples son transaccionales.
    El estado corresponde a la asignación, no a los catálogos.
  */
  private async modificarAsignacion(
    id: string,
    responsable: string,
    quitar: boolean,
  ): Promise<MensajeIdResponse> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RolModuloPermiso);
      const inicial = await repo.findOne({
        where: { id, deletedAt: IsNull() },
      });
      if (!inicial)
        throw new NotFoundException("No se encontró la asignación de acceso.");
      const rol = await this.bloquearRol(manager, inicial.idRol);
      const asignacion = await repo.findOne({
        where: { id, deletedAt: IsNull() },
      });
      if (!asignacion)
        throw new NotFoundException("No se encontró la asignación de acceso.");
      let message: string;
      if (quitar) {
        asignacion.deletedAt = new Date();
        asignacion.userDeleted = responsable;
        asignacion.estado = "INACTIVO";
        message = "Asignación retirada correctamente.";
      } else {
        if (!["ACTIVO", "INACTIVO"].includes(asignacion.estado))
          throw new BadRequestException("El estado actual no es válido.");
        if (asignacion.estado === "INACTIVO") {
          if (rol.estado !== "ACTIVO")
            throw new BadRequestException("El rol debe estar ACTIVO.");
          await this.validarCatalogos(manager, [
            {
              idModulo: asignacion.idModulo,
              idsPermisos: [asignacion.idPermiso],
            },
          ]);
        }
        asignacion.estado =
          asignacion.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
        message = `Asignación dada de ${asignacion.estado === "ACTIVO" ? "alta" : "baja"} correctamente.`;
      }
      asignacion.userUpdate = responsable;
      await repo.save(asignacion);
      return { message, id: asignacion.id };
    });
  }

  /*
  Nombre del método: normalizarSeleccion
  Método HTTP relacionado: Interno
  Endpoint: /api/rol-modulo-permiso

  Descripción:
    Normaliza UUID y rechaza módulos repetidos o listas de permisos vacías.

  Parámetros:
    - modulos: Selección del formulario.
    - permitirVacio: Indica si [] retira todos los accesos.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Devuelve únicamente los campos definidos en las interfaces.
    Excluye asignaciones eliminadas, salvo las reactivadas al asignar.
  */
  private normalizarSeleccion(
    modulos: ModuloPermisosDto[],
    permitirVacio: boolean,
  ): ModuloPermisosDto[] {
    if (
      !Array.isArray(modulos) ||
      modulos.length > 100 ||
      (!permitirVacio && !modulos.length)
    )
      throw new BadRequestException(
        "Debe enviar una selección válida de módulos.",
      );
    idsUnicos(modulos.map((m) => m?.idModulo));
    return modulos.map((m) => ({
      idModulo: uuid(m.idModulo),
      idsPermisos: idsUnicos(m.idsPermisos, false),
    }));
  }

  /*
  Nombre del método: bloquearRol
  Método HTTP relacionado: Interno
  Endpoint: /api/rol-modulo-permiso

  Descripción:
    Bloquea el rol para serializar modificaciones simultáneas de sus accesos.

  Parámetros:
    - manager: Transacción actual.
    - id: UUID del rol.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Devuelve únicamente los campos definidos en las interfaces.
    Excluye asignaciones eliminadas, salvo las reactivadas al asignar.
  */
  private async bloquearRol(manager: EntityManager, id: string): Promise<Rol> {
    const rol = await manager
      .getRepository(Rol)
      .findOne({
        where: { id, deleted_at: IsNull() },
        lock: { mode: "pessimistic_write" },
      });
    if (!rol) throw new NotFoundException("No se encontró el rol solicitado.");
    return rol;
  }

  /*
  Nombre del método: validarCatalogos
  Método HTTP relacionado: Interno
  Endpoint: /api/rol-modulo-permiso

  Descripción:
    Valida módulos y permisos en dos consultas, evitando una consulta por combinación.

  Parámetros:
    - manager: Transacción actual.
    - seleccion: Módulos y permisos enviados.

  Respuestas posibles:
    - 200: Operación realizada correctamente.
    - 400: Datos o parámetros inválidos.
    - 401: No autorizado, cuando se habilita el guard JWT.
    - 404: Registro relacionado no encontrado.
    
    - 500: Error interno del servidor.

  Fecha de creación: 2026-11-11
  Autor: Oscar Canchari

  Notas adicionales:
    Devuelve únicamente los campos definidos en las interfaces.
    Excluye asignaciones eliminadas, salvo las reactivadas al asignar.
  */
  private async validarCatalogos(
    manager: EntityManager,
    seleccion: ModuloPermisosDto[],
  ): Promise<void> {
    if (!seleccion.length) return;
    const idsModulos = seleccion.map((m) => m.idModulo);
    const idsPermisos = [...new Set(seleccion.flatMap((m) => m.idsPermisos))];
    const modulos = await manager
      .getRepository(Modulo)
      .find({ where: { id: In(idsModulos), deleted_at: IsNull() } });
    const permisos = await manager
      .getRepository(Permiso)
      .find({ where: { id: In(idsPermisos), deleted_at: IsNull() } });
    if (
      modulos.length !== idsModulos.length ||
      permisos.length !== idsPermisos.length
    )
      throw new NotFoundException(
        "Uno o varios módulos o permisos no existen.",
      );
    if (
      modulos.some((m) => m.estado !== "ACTIVO") ||
      permisos.some((p) => p.estado !== "ACTIVO")
    )
      throw new BadRequestException(
        "Los módulos y permisos seleccionados deben estar ACTIVOS.",
      );
  }
}
