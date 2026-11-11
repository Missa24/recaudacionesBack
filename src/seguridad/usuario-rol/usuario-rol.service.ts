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
import { Usuario } from "../usuario/entities/usuario.entity";
import { Rol } from "../rol/entities/rol.entity";
import { UsuarioRol } from "../usuario-rol/entities/usuario-rol.entity";
import { RolModuloPermiso } from "../rol-modulo-permiso/entities/rol-modulo-permiso.entity";
import { PaginatedResponse } from "../../shared/interface/paginated-response.interface";
import {
  MensajeIdResponse,
  MensajeIdsResponse,
  UsuarioAccesos,
  UsuarioConRoles,
} from "./interfaces/usuario-rol-response.interface";
import {
  escaparLike,
  filtroAsignacion,
  filtroIdentificadorUsuario,
  idsUnicos,
  paginar,
  prepararQuery,
  relanzarError,
  uuid,
} from "./util/asignaciones.util";
import {
  mapAccesos,
  mapUsuarioRoles,
} from "./util/map-response-usuario-rol.util";
import { AsignarRolesDto } from "./dto/asignar-roles.dto";
import { ActualizarRolesDto } from "./dto/actualizar-roles.dto";
import { QueryUsuarioRolDto } from "./dto/query-usuario-rol.dto";

/**
 * Módulo: Seguridad / Usuario Rol
 * Archivo: usuario-rol.service.ts
 * Descripción:
 *   Gestiona roles por usuario y consulta accesos efectivos sin QueryBuilder.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */
@Injectable()
export class UsuarioRolService {
  constructor(private readonly dataSource: DataSource) {}

  /*
  Nombre del método: asignarRoles
  Método HTTP relacionado: POST
  Endpoint: /api/usuario-rol

  Descripción:
    Agrega roles sin retirar los actuales. Reactiva asignaciones inactivas o retiradas.

  Parámetros:
    - dto: Usuario y roles.
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
  async asignarRoles(
    dto: AsignarRolesDto,
    responsable: string,
  ): Promise<MensajeIdsResponse> {
    return this.guardarRoles(
      uuid(dto.idUsuario),
      idsUnicos(dto.idsRoles, false),
      uuid(responsable),
      false,
    );
  }

  /*
  Nombre del método: listarUsuariosConRoles
  Método HTTP relacionado: GET
  Endpoint: /api/usuario-rol

  Descripción:
    Pagina usuarios y agrupa sus roles. search busca username, CI o email.

  Parámetros:
    - query: Paginación, búsqueda, estado de asignaciones y fechas del usuario.

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
  async listarUsuariosConRoles(
    query: QueryUsuarioRolDto,
  ): Promise<PaginatedResponse<UsuarioConRoles>> {
    const q = prepararQuery(query);
    const base: FindOptionsWhere<Usuario> = { deletedAt: IsNull() };
    if (q.fecha) base[q.dateField] = q.fecha;
    const patron = ILike(`%${escaparLike(q.search)}%`);
    const where: FindOptionsWhere<Usuario> | FindOptionsWhere<Usuario>[] =
      q.search
        ? [
            { ...base, username: patron },
            { ...base, ci: patron },
            { ...base, email: patron },
          ]
        : base;
    const order: FindOptionsOrder<Usuario> =
      q.sortBy === "updatedAt"
        ? { updatedAt: q.sortOrder, idUsuario: "ASC" }
        : { createdAt: q.sortOrder, idUsuario: "ASC" };
    const [usuarios, total] = await this.dataSource
      .getRepository(Usuario)
      .findAndCount({
        where,
        order,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        select: { idUsuario: true, username: true },
      });
    const asignaciones = usuarios.length
      ? await this.dataSource.getRepository(UsuarioRol).find({
          where: {
            ...filtroAsignacion<UsuarioRol>(q.status),
            idUsuario: In(usuarios.map((u) => u.idUsuario)),
            rol: { deleted_at: IsNull() },
          },
          relations: { rol: true },
          order: { rol: { nombre: "ASC" }, id: "ASC" },
        })
      : [];
    return paginar(
      usuarios.map((u) =>
        mapUsuarioRoles(
          u,
          asignaciones.filter((a) => a.idUsuario === u.idUsuario),
        ),
      ),
      total,
      q.page,
      q.limit,
    );
  }

  /*
  Nombre del método: buscarUsuarioConRoles
  Método HTTP relacionado: GET
  Endpoint: /api/usuario-rol/usuario/:valor

  Descripción:
    Busca por UUID, username o CI y devuelve los roles administrativos.

  Parámetros:
    - valor: Identificador del usuario.
    - query: Estado, búsqueda de roles y fechas de asignación; no pagina el detalle.

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
  async buscarUsuarioConRoles(
    valor: string,
    query: QueryUsuarioRolDto,
  ): Promise<UsuarioConRoles> {
    const usuario = await this.buscarUsuario(valor);
    const q = prepararQuery(query);
    const base: FindOptionsWhere<UsuarioRol> = {
      ...filtroAsignacion<UsuarioRol>(q.status),
      idUsuario: usuario.idUsuario,
    };
    if (q.fecha) base[q.dateField] = q.fecha;
    const rolBase: FindOptionsWhere<Rol> = { deleted_at: IsNull() };
    const patron = ILike(`%${escaparLike(q.search)}%`);
    const where = q.search
      ? [
          { ...base, rol: { ...rolBase, nombre: patron } },
          { ...base, rol: { ...rolBase, codigo: patron } },
        ]
      : { ...base, rol: rolBase };
    const order: FindOptionsOrder<UsuarioRol> =
      q.sortBy === "updatedAt"
        ? { updatedAt: q.sortOrder, id: "ASC" }
        : { createdAt: q.sortOrder, id: "ASC" };
    const asignaciones = await this.dataSource
      .getRepository(UsuarioRol)
      .find({ where, relations: { rol: true }, order });
    return mapUsuarioRoles(usuario, asignaciones);
  }

  /*
  Nombre del método: actualizarRolesDeUsuario
  Método HTTP relacionado: PATCH
  Endpoint: /api/usuario-rol/usuario/:idUsuario/roles

  Descripción:
    Guarda la selección completa. Retira roles omitidos y activa los incluidos. [] quita todos.

  Parámetros:
    - idUsuario: UUID del usuario.
    - dto: Selección completa.
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
  async actualizarRolesDeUsuario(
    idUsuario: string,
    dto: ActualizarRolesDto,
    responsable: string,
  ): Promise<MensajeIdsResponse> {
    return this.guardarRoles(
      uuid(idUsuario),
      idsUnicos(dto.idsRoles),
      uuid(responsable),
      true,
    );
  }

  /*
  Nombre del método: quitarRol
  Método HTTP relacionado: PATCH
  Endpoint: /api/usuario-rol/:id/quitar

  Descripción:
    Retira una asignación mediante eliminación lógica y conserva su historial.

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
  async quitarRol(id: string, responsable: string): Promise<MensajeIdResponse> {
    return this.modificarAsignacion(uuid(id), uuid(responsable), true);
  }

  /*
  Nombre del método: cambiarEstado
  Método HTTP relacionado: PATCH
  Endpoint: /api/usuario-rol/:id/estado

  Descripción:
    Alterna ACTIVO e INACTIVO. Para dar de alta valida usuario y rol habilitados.

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
  Nombre del método: listarUsuariosPorRol
  Método HTTP relacionado: GET
  Endpoint: /api/usuario-rol/rol/:idRol/usuarios

  Descripción:
    Pagina usuarios de un rol. El estado y las fechas filtran las asignaciones.

  Parámetros:
    - idRol: UUID del rol.
    - query: Paginación y búsqueda por username, CI o email.

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
  async listarUsuariosPorRol(
    idRol: string,
    query: QueryUsuarioRolDto,
  ): Promise<PaginatedResponse<UsuarioConRoles>> {
    const rol = await this.dataSource
      .getRepository(Rol)
      .findOne({ where: { id: uuid(idRol), deleted_at: IsNull() } });
    if (!rol) throw new NotFoundException("No se encontró el rol solicitado.");
    const q = prepararQuery(query);
    const base: FindOptionsWhere<UsuarioRol> = {
      ...filtroAsignacion<UsuarioRol>(q.status),
      idRol: rol.id,
    };
    if (q.fecha) base[q.dateField] = q.fecha;
    const usuarioBase: FindOptionsWhere<Usuario> = { deletedAt: IsNull() };
    const patron = ILike(`%${escaparLike(q.search)}%`);
    const where = q.search
      ? ["username", "ci", "email"].map((campo) => ({
          ...base,
          usuario: { ...usuarioBase, [campo]: patron },
        }))
      : { ...base, usuario: usuarioBase };
    const order: FindOptionsOrder<UsuarioRol> =
      q.sortBy === "updatedAt"
        ? { updatedAt: q.sortOrder, id: "ASC" }
        : { createdAt: q.sortOrder, id: "ASC" };
    const [asignaciones, total] = await this.dataSource
      .getRepository(UsuarioRol)
      .findAndCount({
        where,
        relations: { usuario: true, rol: true },
        order,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      });
    return paginar(
      asignaciones.map((a) => mapUsuarioRoles(a.usuario, [a])),
      total,
      q.page,
      q.limit,
    );
  }

  /*
  Nombre del método: obtenerAccesosDeUsuario
  Método HTTP relacionado: GET
  Endpoint: /api/usuario-rol/usuario/:valor/accesos

  Descripción:
    Devuelve usuario, roles, módulos y permisos efectivos sin auditoría ni estados.

  Parámetros:
    - valor: UUID, username o CI del usuario.

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
  async obtenerAccesosDeUsuario(valor: string): Promise<UsuarioAccesos> {
    // Una sola instantánea evita mezclar asignaciones anteriores y posteriores a un cambio.
    return this.dataSource.transaction("REPEATABLE READ", async (manager) => {
      const usuario = await this.buscarUsuario(valor, manager);
      if (usuario.estado !== "ACTIVO") return mapAccesos(usuario, [], []);
      const roles = await manager.getRepository(UsuarioRol).find({
        where: {
          idUsuario: usuario.idUsuario,
          estado: "ACTIVO",
          deletedAt: IsNull(),
          rol: { estado: "ACTIVO", deleted_at: IsNull() },
        },
        relations: { rol: true },
        order: { rol: { nombre: "ASC" }, id: "ASC" },
      });
      const accesos = roles.length
        ? await manager.getRepository(RolModuloPermiso).find({
            where: {
              idRol: In(roles.map((a) => a.idRol)),
              estado: "ACTIVO",
              deletedAt: IsNull(),
              rol: { estado: "ACTIVO", deleted_at: IsNull() },
              modulo: { estado: "ACTIVO", deleted_at: IsNull() },
              permiso: { estado: "ACTIVO", deleted_at: IsNull() },
            },
            relations: { modulo: true, permiso: true },
            order: {
              modulo: { nombres: "ASC" },
              permiso: { codigo: "ASC" },
              id: "ASC",
            },
          })
        : [];
      return mapAccesos(usuario, roles, accesos);
    });
  }

  /*
  Nombre del método: guardarRoles
  Método HTTP relacionado: POST / PATCH
  Endpoint: /api/usuario-rol

  Descripción:
    Método interno. Serializa los cambios por usuario y guarda todo en una transacción.

  Parámetros:
    - idUsuario, roles, responsable y reemplazar: Selección normalizada.

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
  private async guardarRoles(
    idUsuario: string,
    roles: string[],
    responsable: string,
    reemplazar: boolean,
  ): Promise<MensajeIdsResponse> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const usuario = await this.bloquearUsuario(manager, idUsuario);
        if (roles.length && usuario.estado !== "ACTIVO")
          throw new BadRequestException(
            "El usuario debe estar ACTIVO para asignar roles.",
          );
        await this.validarRoles(manager, roles);
        const repo = manager.getRepository(UsuarioRol);
        const existentes = await repo.find({ where: { idUsuario } });
        const seleccion = new Set(roles);
        const cambios: UsuarioRol[] = [];
        const ids: string[] = [];
        for (const idRol of roles) {
          let asignacion = existentes.find((a) => a.idRol === idRol);
          if (!asignacion) {
            asignacion = repo.create({
              id: randomUUID(),
              idUsuario,
              idRol,
              estado: "ACTIVO",
              userCreated: responsable,
              userUpdate: null,
              userDeleted: null,
              deletedAt: null,
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
              !seleccion.has(asignacion.idRol) &&
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
            ? "Roles del usuario actualizados correctamente."
            : "Roles asignados correctamente.",
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
  Endpoint: /api/usuario-rol/:id

  Descripción:
    Método interno. Diferencia el retiro lógico del alta o baja temporal.

  Parámetros:
    - id y responsable: UUID.
    - quitar: Indica retiro lógico.

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
      const repo = manager.getRepository(UsuarioRol);
      const inicial = await repo.findOne({
        where: { id, deletedAt: IsNull() },
      });
      if (!inicial)
        throw new NotFoundException("No se encontró la asignación de rol.");
      const usuario = await this.bloquearUsuario(manager, inicial.idUsuario);
      const asignacion = await repo.findOne({
        where: { id, deletedAt: IsNull() },
      });
      if (!asignacion)
        throw new NotFoundException("No se encontró la asignación de rol.");
      let message: string;
      if (quitar) {
        asignacion.deletedAt = new Date();
        asignacion.userDeleted = responsable;
        asignacion.estado = "INACTIVO";
        message = "Rol retirado del usuario correctamente.";
      } else {
        if (!["ACTIVO", "INACTIVO"].includes(asignacion.estado))
          throw new BadRequestException("El estado actual no es válido.");
        if (asignacion.estado === "INACTIVO") {
          if (usuario.estado !== "ACTIVO")
            throw new BadRequestException("El usuario debe estar ACTIVO.");
          await this.validarRoles(manager, [asignacion.idRol]);
        }
        asignacion.estado =
          asignacion.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
        message = `Rol del usuario dado de ${asignacion.estado === "ACTIVO" ? "alta" : "baja"} correctamente.`;
      }
      asignacion.userUpdate = responsable;
      await repo.save(asignacion);
      return { message, id: asignacion.id };
    });
  }

  /*
  Nombre del método: bloquearUsuario
  Método HTTP relacionado: Interno
  Endpoint: /api/usuario-rol

  Descripción:
    Bloquea el usuario para que dos escrituras de sus roles no se intercalen.

  Parámetros:
    - manager: Transacción actual.
    - idUsuario: UUID del usuario.

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
  private async bloquearUsuario(
    manager: EntityManager,
    idUsuario: string,
  ): Promise<Usuario> {
    const usuario = await manager
      .getRepository(Usuario)
      .findOne({
        where: { idUsuario, deletedAt: IsNull() },
        lock: { mode: "pessimistic_write" },
      });
    if (!usuario)
      throw new NotFoundException("No se encontró el usuario solicitado.");
    return usuario;
  }

  /*
  Nombre del método: validarRoles
  Método HTTP relacionado: Interno
  Endpoint: /api/usuario-rol

  Descripción:
    Comprueba en una sola consulta que todos los roles existan y estén habilitados.

  Parámetros:
    - manager: Transacción actual.
    - ids: Roles seleccionados.

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
  private async validarRoles(
    manager: EntityManager,
    ids: string[],
  ): Promise<void> {
    if (!ids.length) return;
    const encontrados = await manager
      .getRepository(Rol)
      .find({ where: { id: In(ids), deleted_at: IsNull() } });
    if (encontrados.length !== ids.length)
      throw new NotFoundException("Uno o varios roles no existen.");
    if (encontrados.some((r) => r.estado !== "ACTIVO"))
      throw new BadRequestException(
        "Todos los roles seleccionados deben estar ACTIVOS.",
      );
  }

  /*
  Nombre del método: buscarUsuario
  Método HTTP relacionado: Interno
  Endpoint: /api/usuario-rol

  Descripción:
    Resuelve el usuario por ID, username o CI; admite usuarios inactivos para administración.

  Parámetros:
    - valor: Identificador.
    - manager: Contexto de consulta.

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
  private async buscarUsuario(
    valor: string,
    manager: EntityManager = this.dataSource.manager,
  ): Promise<Usuario> {
    const usuario = await manager
      .getRepository(Usuario)
      .findOne({
        where: { ...filtroIdentificadorUsuario(valor), deletedAt: IsNull() },
      });
    if (!usuario)
      throw new NotFoundException("No se encontró el usuario solicitado.");
    return usuario;
  }
}
