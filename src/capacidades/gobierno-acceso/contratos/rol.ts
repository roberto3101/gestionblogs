import type { Identificador } from '@compartido/tipos/identificador';

export interface Rol {
  id: Identificador;
  nombre: string;
  descripcion: string;
  estado: string;
  creado_en: string;
}

export interface SolicitudRegistrarRol {
  nombre: string;
  descripcion?: string;
}
