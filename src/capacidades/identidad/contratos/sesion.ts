import type { Identificador } from '@compartido/tipos/identificador';

export interface SolicitudIniciarSesion {
  correo_electronico: string;
  password: string;
  dispositivo_id: string;
}

export interface SesionEmitida {
  sesion_id: Identificador;
  usuario_id: Identificador;
  empresa_activa_id: Identificador | null;
  token: string;
  refresh_token: string;
  expira_en: string;
}

export interface SesionEnSeguimiento {
  sesion_id: Identificador;
  usuario_id: Identificador;
  empresa_activa_id: Identificador | null;
  correo_electronico: string;
  token: string;
  refresh_token: string;
  expira_en: string;
}
