import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cambiarEstadoAutor,
  crearAutor,
  eliminarAutor,
  listarAutoresPorSitio,
} from '../servicios/servicioAutores';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';

const claveAutores = (codigoSitio: string) => ['autores', codigoSitio] as const;

export const useListarAutores = (
  codigoSitio: string | null,
  paginacion: Paginacion = paginacionInicial,
  filtroEstado?: string,
) =>
  useQuery({
    queryKey: codigoSitio
      ? [...claveAutores(codigoSitio), paginacion, filtroEstado ?? '']
      : ['autores', 'inactivo'],
    queryFn: () => listarAutoresPorSitio(codigoSitio!, paginacion, filtroEstado),
    enabled: Boolean(codigoSitio),
  });

export const useCrearAutor = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: crearAutor,
    meta: { exito: 'Autor creado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['autores'] }),
  });
};

export const useCambiarEstadoAutor = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: 'ACTIVO' | 'INACTIVO' }) =>
      cambiarEstadoAutor(id, estado),
    meta: { exito: 'Estado de autor actualizado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['autores'] }),
  });
};

export const useEliminarAutor = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarAutor(id),
    meta: { exito: 'Autor eliminado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['autores'] }),
  });
};
