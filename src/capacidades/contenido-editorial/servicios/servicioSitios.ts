import { obtener, enviar, reemplazar, ajustar, eliminar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Sitio, SolicitudCrearSitio } from '../contratos/sitio';

export interface SolicitudEditarSitio {
  nombre?: string;
  dominio?: string;
  descripcion?: string;
  idioma_default?: string;
}

export const listarSitios = async (
  paginacion: Paginacion,
  filtroEstado?: string,
): Promise<ListadoPaginado<Sitio>> => {
  const consulta = aCadenaConsulta(paginacion);
  const con = filtroEstado ? `${consulta}&estado=${encodeURIComponent(filtroEstado)}` : consulta;
  const crudo = await obtener<unknown>(`/contenido/sitios?${con}`);
  return normalizarListado<Sitio>(crudo);
};

export const crearSitio = (solicitud: SolicitudCrearSitio): Promise<Sitio> =>
  enviar<Sitio>('/contenido/sitios', solicitud);

export const editarSitio = (id: string, solicitud: SolicitudEditarSitio): Promise<Sitio> =>
  reemplazar<Sitio>(`/contenido/sitios/${id}`, solicitud);

export const cambiarEstadoSitio = (id: string, estado: 'ACTIVO' | 'INACTIVO'): Promise<{ id: string; estado: string }> =>
  ajustar(`/contenido/sitios/${id}/estado`, { estado });

export const eliminarSitio = (id: string): Promise<{ id: string }> =>
  eliminar(`/contenido/sitios/${id}`);
