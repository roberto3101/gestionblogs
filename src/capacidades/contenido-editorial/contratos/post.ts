import type { Identificador } from '@compartido/tipos/identificador';

export type FormatoContenido = 'MARKDOWN' | 'HTML';

export interface Post {
  id: Identificador;
  sitio_id: Identificador;
  autor_id: Identificador;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  formato_contenido: FormatoContenido;
  idioma: string;
  imagen_portada_id: Identificador | null;
  seo_titulo: string;
  seo_descripcion: string;
  estado: string;
  publicado_en: string | null;
  creado_en: string;
  categorias?: { nombre: string; slug: string }[];
  etiquetas?: { nombre: string; slug: string }[];
}

export interface SolicitudCrearPost {
  sitio_id: Identificador;
  autor_id: Identificador;
  titulo: string;
  slug: string;
  resumen?: string;
  contenido: string;
  formato_contenido: FormatoContenido;
  idioma: string;
  imagen_portada_id?: Identificador;
  seo_titulo?: string;
  seo_descripcion?: string;
}
