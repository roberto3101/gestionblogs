import type { Identificador } from '@compartido/tipos/identificador';

export interface Empresa {
  id: Identificador;
  ruc: string;
  razon_social: string;
  estado: string;
  creado_en: string;
}

export interface SolicitudCrearEmpresa {
  ruc: string;
  razon_social: string;
}
