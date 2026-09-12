import { obtener, enviar, ajustar, eliminar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Autor, SolicitudCrearAutor } from '../contratos/autor';

export const listarAutoresAdmin = async (
  paginacion: Paginacion,
  filtroEstado?: string,
): Promise<ListadoPaginado<Autor>> => {
  const consulta = aCadenaConsulta(paginacion);
  const con = filtroEstado ? `${consulta}&estado=${encodeURIComponent(filtroEstado)}` : consulta;
  const crudo = await obtener<unknown>(`/contenido/autores?${con}`);
  return normalizarListado<Autor>(crudo);
};

export const listarAutoresPorSitio = async (
  _sitioCodigo: string,
  paginacion: Paginacion,
  filtroEstado?: string,
): Promise<ListadoPaginado<Autor>> => listarAutoresAdmin(paginacion, filtroEstado);

export const crearAutor = (solicitud: SolicitudCrearAutor): Promise<Autor> =>
  enviar<Autor>('/contenido/autores', solicitud);

export const cambiarEstadoAutor = (autorId: string, estado: 'ACTIVO' | 'INACTIVO'): Promise<{ id: string; estado: string }> =>
  ajustar(`/contenido/autores/${autorId}/estado`, { estado });

export const eliminarAutor = (autorId: string): Promise<{ id: string }> =>
  eliminar(`/contenido/autores/${autorId}`);
