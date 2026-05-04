import { obtener, enviar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { EtiquetaContenido, SolicitudCrearEtiqueta } from '../contratos/etiqueta';
import type { Identificador } from '@compartido/tipos/identificador';

export const listarEtiquetasPorSitio = async (
  sitioCodigo: string,
  paginacion: Paginacion,
): Promise<ListadoPaginado<EtiquetaContenido>> => {
  const crudo = await obtener<unknown>(
    `/publico/sitios/${sitioCodigo}/etiquetas?${aCadenaConsulta(paginacion)}`,
  );
  return normalizarListado<EtiquetaContenido>(crudo);
};

export const crearEtiquetaEnSitio = (
  sitioId: Identificador,
  solicitud: SolicitudCrearEtiqueta,
): Promise<EtiquetaContenido> =>
  enviar<EtiquetaContenido>(`/contenido/sitios/${sitioId}/etiquetas`, solicitud);
