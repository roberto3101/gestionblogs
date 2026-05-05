import type { Identificador } from '@compartido/tipos/identificador';

export interface SolicitudEditarPost {
  titulo?: string;
  slug?: string;
  resumen?: string;
  contenido?: string;
  formato_contenido?: 'MARKDOWN' | 'HTML';
  idioma?: string;
  autor_id?: Identificador;
  imagen_portada_id?: Identificador | null;
  seo_titulo?: string;
  seo_descripcion?: string;
  motivo_cambio?: string;
}

export interface SolicitudReemplazarCategoriasPost {
  categorias_ids: Identificador[];
}

export interface SolicitudReemplazarEtiquetasPost {
  etiquetas_ids: Identificador[];
}

export interface SolicitudEditarCategoria {
  nombre?: string;
  slug?: string;
  descripcion?: string;
  color?: string;
  orden?: number;
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface SolicitudEditarEtiqueta {
  nombre?: string;
  slug?: string;
}

export interface SolicitudEditarAutor {
  nombre_publico?: string;
  slug?: string;
  biografia?: string;
  sitio_web?: string;
  twitter?: string;
  linkedin?: string;
}
