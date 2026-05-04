import type { Identificador } from '@compartido/tipos/identificador';

export interface EtiquetaContenido {
  id: Identificador;
  sitio_id: Identificador;
  nombre: string;
  slug: string;
  estado: string;
  creado_en: string;
}

export interface SolicitudCrearEtiqueta {
  nombre: string;
  slug: string;
}
