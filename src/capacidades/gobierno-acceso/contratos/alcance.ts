import type { Identificador } from '@compartido/tipos/identificador';

export interface SolicitudAsignarAlcance {
  usuario_id: Identificador;
  empresa_id: Identificador;
  rol_id: Identificador;
}

export interface SolicitudAsignarRolPermiso {
  rol_id: Identificador;
  permiso_id: Identificador;
}
