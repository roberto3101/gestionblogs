import { reemplazar, eliminar } from '@integraciones/http/clienteHttp';
import type { Identificador } from '@compartido/tipos/identificador';
import type { Post } from '../contratos/post';
import type { Categoria } from '../contratos/categoria';
import type { EtiquetaContenido } from '../contratos/etiqueta';
import type { Autor } from '../contratos/autor';
import type {
  SolicitudEditarPost,
  SolicitudReemplazarCategoriasPost,
  SolicitudReemplazarEtiquetasPost,
  SolicitudEditarCategoria,
  SolicitudEditarEtiqueta,
  SolicitudEditarAutor,
} from '../contratos/edicion';

export const editarPost = (postId: Identificador, solicitud: SolicitudEditarPost): Promise<Post> =>
  reemplazar<Post>(`/contenido/posts/${postId}`, solicitud);

export const eliminarPost = (postId: Identificador): Promise<{ id: string }> =>
  eliminar<{ id: string }>(`/contenido/posts/${postId}`);

export const reemplazarCategoriasPost = (
  postId: Identificador,
  solicitud: SolicitudReemplazarCategoriasPost,
): Promise<{ post_id: string; categorias: string[] }> =>
  reemplazar<{ post_id: string; categorias: string[] }>(`/contenido/posts/${postId}/categorias`, solicitud);

export const reemplazarEtiquetasPost = (
  postId: Identificador,
  solicitud: SolicitudReemplazarEtiquetasPost,
): Promise<{ post_id: string; etiquetas: string[] }> =>
  reemplazar<{ post_id: string; etiquetas: string[] }>(`/contenido/posts/${postId}/etiquetas`, solicitud);

export const editarCategoria = (
  categoriaId: Identificador,
  solicitud: SolicitudEditarCategoria,
): Promise<Categoria> => reemplazar<Categoria>(`/contenido/categorias/${categoriaId}`, solicitud);

export const eliminarCategoria = (categoriaId: Identificador): Promise<{ id: string }> =>
  eliminar<{ id: string }>(`/contenido/categorias/${categoriaId}`);

export const editarEtiqueta = (
  etiquetaId: Identificador,
  solicitud: SolicitudEditarEtiqueta,
): Promise<EtiquetaContenido> => reemplazar<EtiquetaContenido>(`/contenido/etiquetas/${etiquetaId}`, solicitud);

export const eliminarEtiqueta = (etiquetaId: Identificador): Promise<{ id: string }> =>
  eliminar<{ id: string }>(`/contenido/etiquetas/${etiquetaId}`);

export const editarAutor = (autorId: Identificador, solicitud: SolicitudEditarAutor): Promise<Autor> =>
  reemplazar<Autor>(`/contenido/autores/${autorId}`, solicitud);

export const eliminarAutor = (autorId: Identificador): Promise<{ id: string }> =>
  eliminar<{ id: string }>(`/contenido/autores/${autorId}`);
