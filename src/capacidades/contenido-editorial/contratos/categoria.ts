import type { Identificador } from '@compartido/tipos/identificador';

export interface Categoria {
  id: Identificador;
  sitio_id: Identificador;
  nombre: string;
  slug: string;
  descripcion: string;
  color: string;
  orden: number;
  estado: string;
  creado_en: string;
}

export interface SolicitudCrearCategoria {
  nombre: string;
  slug: string;
  descripcion?: string;
  color?: string;
  orden?: number;
}
