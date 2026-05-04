import { obtener, enviar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Autor, SolicitudCrearAutor } from '../contratos/autor';

export const listarAutoresPorSitio = async (
  sitioCodigo: string,
  paginacion: Paginacion,
): Promise<ListadoPaginado<Autor>> => {
  const crudo = await obtener<unknown>(`/publico/sitios/${sitioCodigo}/autores?${aCadenaConsulta(paginacion)}`);
  return normalizarListado<Autor>(crudo);
};

export const crearAutor = (solicitud: SolicitudCrearAutor): Promise<Autor> =>
  enviar<Autor>('/contenido/autores', solicitud);
