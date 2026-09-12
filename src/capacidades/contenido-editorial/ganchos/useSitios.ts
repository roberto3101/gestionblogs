import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cambiarEstadoSitio,
  crearSitio,
  editarSitio,
  eliminarSitio,
  listarSitios,
  type SolicitudEditarSitio,
} from '../servicios/servicioSitios';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';

const CLAVE_SITIOS = ['sitios'] as const;

export const useListarSitios = (paginacion: Paginacion = paginacionInicial, filtroEstado?: string) =>
  useQuery({
    queryKey: [...CLAVE_SITIOS, paginacion, filtroEstado ?? ''],
    queryFn: () => listarSitios(paginacion, filtroEstado),
  });

export const useCrearSitio = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: crearSitio,
    meta: { exito: 'Sitio creado correctamente' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_SITIOS }),
  });
};

export const useEditarSitio = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: SolicitudEditarSitio }) =>
      editarSitio(id, datos),
    meta: { exito: 'Sitio actualizado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_SITIOS }),
  });
};

export const useCambiarEstadoSitio = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: 'ACTIVO' | 'INACTIVO' }) =>
      cambiarEstadoSitio(id, estado),
    meta: { exito: 'Estado del sitio actualizado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_SITIOS }),
  });
};

export const useEliminarSitio = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarSitio(id),
    meta: { exito: 'Sitio eliminado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_SITIOS }),
  });
};
