/**
 * Módulo: Seguridad - RolModuloPermiso
 * Archivo: rol-modulo-permiso-response.interface.ts
 *
 * Define las estructuras de respuesta del módulo.
 */

export interface RolModuloPermisoResponse {
  id: string;

  rol_id: string;
  rol_codigo: string;
  rol_descripcion: string;

  modulo_id: string;
  modulo_nombre: string;
  modulo_codigo: string;
  modulo_ruta: string;

  permiso_id: string;
  permiso_codigo: string;
  permiso_descripcion: string;

  estado: string;

  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface RolModuloPermisoMessageResponse {
  message: string;
}
/**
 * Define las interfaces para las respuestas
 * de las operaciones relacionadas con roles, módulos y permisos.
 */

/** Representa un permiso asignado. */
export interface PermisoAsignadoResponse {
  id: string;
  codigo: string;
  descripcion: string;
}

/** Representa un módulo con sus permisos asignados. */
export interface ModuloPermisoResponse {
  id: string;
  nombre: string;
  codigo: string;
  ruta: string;
  permisos: PermisoAsignadoResponse[];
}

/** Respuesta con los módulos y permisos asociados a un rol. */
export interface RolModulosPermisosResponse {
  rol: {
    id: string;
    codigo: string;
    descripcion: string;
  };
  modulos: ModuloPermisoResponse[];
}

/** Respuesta con el catálogo de módulos y permisos disponibles. */
export interface CatalogoPermisosResponse {
  modulos: {
    id: string;
    nombre: string;
    codigo: string;
    ruta: string;
  }[];
  permisos: PermisoAsignadoResponse[];
}

/** Respuesta general de una operación. */
export interface RolModuloPermisoMessageResponse {
  message: string;
}
