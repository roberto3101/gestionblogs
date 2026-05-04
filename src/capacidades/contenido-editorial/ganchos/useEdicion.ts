import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  editarPost,
  eliminarPost,
  reemplazarCategoriasPost,
  reemplazarEtiquetasPost,
  editarCategoria,
  eliminarCategoria,
  editarEtiqueta,
  eliminarEtiqueta,
  editarAutor,
  eliminarAutor,
} from '../servicios/servicioEdicion';
import type { Identificador } from '@compartido/tipos/identificador';
import type {
  SolicitudEditarPost,
  SolicitudReemplazarCategoriasPost,
  SolicitudReemplazarEtiquetasPost,
  SolicitudEditarCategoria,
  SolicitudEditarEtiqueta,
  SolicitudEditarAutor,
} from '../contratos/edicion';

export const useEditarPost = (postId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (solicitud: SolicitudEditarPost) => {
      if (!postId) return Promise.reject(new Error('postId requerido'));
      return editarPost(postId, solicitud);
    },
    meta: { exito: 'Cambios guardados' },
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: ['posts'] });
      cliente.invalidateQueries({ queryKey: ['post'] });
    },
  });
};

export const useEliminarPost = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: eliminarPost,
    meta: { exito: 'Post eliminado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['posts'] }),
  });
};

export const useReemplazarCategoriasPost = (postId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (solicitud: SolicitudReemplazarCategoriasPost) => {
      if (!postId) return Promise.reject(new Error('postId requerido'));
      return reemplazarCategoriasPost(postId, solicitud);
    },
    meta: { exito: 'Categorías actualizadas' },
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};

export const useReemplazarEtiquetasPost = (postId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (solicitud: SolicitudReemplazarEtiquetasPost) => {
      if (!postId) return Promise.reject(new Error('postId requerido'));
      return reemplazarEtiquetasPost(postId, solicitud);
    },
    meta: { exito: 'Etiquetas actualizadas' },
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};

export const useEditarCategoria = (categoriaId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (solicitud: SolicitudEditarCategoria) => {
      if (!categoriaId) return Promise.reject(new Error('categoriaId requerido'));
      return editarCategoria(categoriaId, solicitud);
    },
    meta: { exito: 'Categoría actualizada' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['categorias'] }),
  });
};

export const useEliminarCategoria = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: eliminarCategoria,
    meta: { exito: 'Categoría eliminada' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['categorias'] }),
  });
};

export const useEditarEtiqueta = (etiquetaId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (solicitud: SolicitudEditarEtiqueta) => {
      if (!etiquetaId) return Promise.reject(new Error('etiquetaId requerido'));
      return editarEtiqueta(etiquetaId, solicitud);
    },
    meta: { exito: 'Etiqueta actualizada' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['etiquetas'] }),
  });
};

export const useEliminarEtiqueta = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: eliminarEtiqueta,
    meta: { exito: 'Etiqueta eliminada' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['etiquetas'] }),
  });
};

export const useEditarAutor = (autorId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (solicitud: SolicitudEditarAutor) => {
      if (!autorId) return Promise.reject(new Error('autorId requerido'));
      return editarAutor(autorId, solicitud);
    },
    meta: { exito: 'Autor actualizado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['autores'] }),
  });
};

export const useEliminarAutor = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: eliminarAutor,
    meta: { exito: 'Autor eliminado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['autores'] }),
  });
};
