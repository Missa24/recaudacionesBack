/**
 * Módulo: Seguridad / RolModuloPermiso
 * Archivo: rol-modulo-permiso-response.interface.ts
 * Descripción:
 *   Reexporta los contratos utilizados por este módulo sin duplicar definiciones.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */
/** Una fila de seguridad.rol_modulo_permiso con sus datos relacionados. */
export interface RolModuloPermisoListadoResponse {
  /** PK de la tabla seguridad.rol_modulo_permiso. */
  id: string;

  rol: {
    id: string;
    nombre: string;
  };

  modulo: {
    id: string;
    nombres: string;
  };

  permiso: {
    id: string;
    codigo: string;
  };

  estado: string;
}
