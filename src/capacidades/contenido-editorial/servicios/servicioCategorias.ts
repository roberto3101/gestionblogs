import { obtener, enviar } from '@integraciones/http/clienteHttp';
import { type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Categoria, SolicitudCrearCategoria } from '../contratos/categoria';
import type { Identificador } from '@compartido/tipos/identificador';

export const listarCategoriasPorSitio = async (
  sitioId: Identificador,
  _paginacion: Paginacion,
): Promise<ListadoPaginado<Categoria>> => {
  const crudo = await obtener<unknown>(`/contenido/sitios/${sitioId}/categorias`);
  return normalizarListado<Categoria>(crudo);
};

export const crearCategoriaEnSitio = (
  sitioId: Identificador,
  solicitud: SolicitudCrearCategoria,
): Promise<Categoria> => enviar<Categoria>(`/contenido/sitios/${sitioId}/categorias`, solicitud);
