import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crearPost, obtenerPost, publicarPost, listarPostsPorSitio } from '../servicios/servicioPosts';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import type { Identificador } from '@compartido/tipos/identificador';

export const useListarPosts = (codigoSitio: string | null, paginacion: Paginacion = paginacionInicial) =>
  useQuery({
    queryKey: ['posts', codigoSitio, paginacion],
    queryFn: () => listarPostsPorSitio(codigoSitio!, paginacion),
    enabled: Boolean(codigoSitio),
  });

export const useObtenerPost = (postId: Identificador | null) =>
  useQuery({
    queryKey: ['post', postId],
    queryFn: () => obtenerPost(postId!),
    enabled: Boolean(postId),
  });

export const useCrearPost = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: crearPost,
    meta: { exito: 'Borrador guardado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['posts'] }),
  });
};

export const usePublicarPost = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: publicarPost,
    meta: { exito: 'Post publicado' },
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: ['posts'] });
      cliente.invalidateQueries({ queryKey: ['post'] });
    },
  });
};
