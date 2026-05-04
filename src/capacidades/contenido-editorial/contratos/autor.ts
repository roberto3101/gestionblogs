import type { Identificador } from '@compartido/tipos/identificador';

export interface Autor {
  id: Identificador;
  usuario_id: Identificador | null;
  nombre_publico: string;
  slug: string;
  biografia: string;
  sitio_web: string;
  twitter: string;
  linkedin: string;
  estado: string;
  creado_en: string;
}

export interface SolicitudCrearAutor {
  usuario_id: Identificador;
  nombre_publico: string;
  slug: string;
  biografia?: string;
  sitio_web?: string;
  twitter?: string;
  linkedin?: string;
}
