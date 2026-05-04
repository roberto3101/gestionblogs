import type { Identificador } from '@compartido/tipos/identificador';

export interface Sitio {
  id: Identificador;
  empresa_id: Identificador;
  codigo: string;
  nombre: string;
  dominio: string;
  descripcion: string;
  idioma_default: string;
  estado: string;
  creado_en: string;
}

export interface SolicitudCrearSitio {
  empresa_id: Identificador;
  codigo: string;
  nombre: string;
  dominio: string;
  descripcion?: string;
  idioma_default: string;
}
