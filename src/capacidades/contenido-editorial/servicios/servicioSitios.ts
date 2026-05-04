import { obtener, enviar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Sitio, SolicitudCrearSitio } from '../contratos/sitio';

export const listarSitios = async (paginacion: Paginacion): Promise<ListadoPaginado<Sitio>> => {
  const crudo = await obtener<unknown>(`/contenido/sitios?${aCadenaConsulta(paginacion)}`);
  return normalizarListado<Sitio>(crudo);
};

export const crearSitio = (solicitud: SolicitudCrearSitio): Promise<Sitio> =>
  enviar<Sitio>('/contenido/sitios', solicitud);
