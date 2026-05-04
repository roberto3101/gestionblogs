import type { Identificador } from '@compartido/tipos/identificador';

export type TipoMedio = 'IMAGEN' | 'VIDEO' | 'AUDIO' | 'DOCUMENTO';

export interface Medio {
  id: Identificador;
  sitio_id: Identificador;
  tipo: TipoMedio;
  nombre: string;
  url: string;
  url_miniatura: string;
  formato: string;
  tamano_bytes: number;
  ancho: number | null;
  alto: number | null;
  duracion_seg: number | null;
  texto_alt: string;
  estado: string;
  creado_en: string;
}

export interface SolicitudSubirMedio {
  sitio_id: Identificador;
  tipo: TipoMedio;
  nombre: string;
  url: string;
  url_miniatura?: string;
  formato: string;
  tamano_bytes: number;
  ancho?: number;
  alto?: number;
  duracion_seg?: number;
  texto_alt?: string;
}
