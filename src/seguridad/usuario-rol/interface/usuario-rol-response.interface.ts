export interface UsuarioRolResponse {
  id: string;
  id_usuario: string;
  usuario: {
    id_usuario: string;
    username: string | null;
    nombres: string | null;
    ci: string | null;
  };
  id_rol: string;
  rol: {
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

export interface UsuarioRolMessageResponse {
  message: string;
}
