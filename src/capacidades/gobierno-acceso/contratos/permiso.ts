import type { Identificador } from '@compartido/tipos/identificador';

export interface Permiso {
  id: Identificador;
  codigo: string;
  descripcion: string;
  estado: string;
  creado_en: string;
}

export interface SolicitudRegistrarPermiso {
  codigo: string;
  descripcion?: string;
}
