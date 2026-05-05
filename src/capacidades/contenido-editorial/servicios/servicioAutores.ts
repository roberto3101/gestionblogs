import { obtener, enviar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Autor, SolicitudCrearAutor } from '../contratos/autor';

export const listarAutoresAdmin = async (paginacion: Paginacion): Promise<ListadoPaginado<Autor>> => {
  const crudo = await obtener<unknown>(`/contenido/autores?${aCadenaConsulta(paginacion)}`);
  return normalizarListado<Autor>(crudo);
};

export const listarAutoresPorSitio = async (
  _sitioCodigo: string,
  paginacion: Paginacion,
): Promise<ListadoPaginado<Autor>> => listarAutoresAdmin(paginacion);

export const crearAutor = (solicitud: SolicitudCrearAutor): Promise<Autor> =>
  enviar<Autor>('/contenido/autores', solicitud);
