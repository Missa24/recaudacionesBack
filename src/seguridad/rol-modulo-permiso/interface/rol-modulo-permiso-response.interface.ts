export interface RolModuloPermisoResponse {
  id: string;
  rol_id: string;
  rol: {
    id: string;
    nombre: string;
    codigo: string;
  };
  modulo_id: string;
  modulo: {
    id: string;
    nombres: string;
    codigo: string;
  };
  permiso_id: string;
  permiso: {
    id: string;
    nombre: string;
    codigo: string;
  };
  estado: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

export interface RolModuloPermisoMessageResponse {
  message: string;
}
