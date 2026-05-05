import { obtener, enviar } from '@integraciones/http/clienteHttp';
import { type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { EtiquetaContenido, SolicitudCrearEtiqueta } from '../contratos/etiqueta';
import type { Identificador } from '@compartido/tipos/identificador';

export const listarEtiquetasPorSitio = async (
  sitioId: Identificador,
  _paginacion: Paginacion,
): Promise<ListadoPaginado<EtiquetaContenido>> => {
  const crudo = await obtener<unknown>(`/contenido/sitios/${sitioId}/etiquetas`);
  return normalizarListado<EtiquetaContenido>(crudo);
};

export const crearEtiquetaEnSitio = (
  sitioId: Identificador,
  solicitud: SolicitudCrearEtiqueta,
): Promise<EtiquetaContenido> =>
  enviar<EtiquetaContenido>(`/contenido/sitios/${sitioId}/etiquetas`, solicitud);
