import { obtener, enviar, reemplazar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Post, SolicitudCrearPost } from '../contratos/post';
import type { Identificador } from '@compartido/tipos/identificador';

export const listarPostsPorSitio = async (
  sitioCodigo: string,
  paginacion: Paginacion,
): Promise<ListadoPaginado<Post>> => {
  const crudo = await obtener<unknown>(`/publico/sitios/${sitioCodigo}/posts?${aCadenaConsulta(paginacion)}`);
  return normalizarListado<Post>(crudo);
};

export const obtenerPost = (postId: Identificador): Promise<Post> =>
  obtener<Post>(`/contenido/posts/${postId}`);

export const crearPost = (solicitud: SolicitudCrearPost): Promise<Post> =>
  enviar<Post>('/contenido/posts', solicitud);

export const publicarPost = (postId: Identificador): Promise<Post> =>
  reemplazar<Post>(`/contenido/posts/${postId}/publicar`, {});
