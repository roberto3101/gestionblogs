import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cambiarEstadoEmpresa,
  crearEmpresa,
  editarEmpresa,
  eliminarEmpresa,
  listarEmpresas,
  type SolicitudEditarEmpresa,
} from '../servicios/servicioEmpresas';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';

const CLAVE_EMPRESAS = ['empresas'] as const;

export const useListarEmpresas = (paginacion: Paginacion = paginacionInicial, filtroEstado?: string) =>
  useQuery({
    queryKey: [...CLAVE_EMPRESAS, paginacion, filtroEstado ?? ''],
    queryFn: () => listarEmpresas(paginacion, filtroEstado),
  });

export const useCrearEmpresa = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: crearEmpresa,
    meta: { exito: 'Empresa registrada' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  });
};

export const useEditarEmpresa = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: SolicitudEditarEmpresa }) =>
      editarEmpresa(id, datos),
    meta: { exito: 'Empresa actualizada' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  });
};

export const useCambiarEstadoEmpresa = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: 'ACTIVO' | 'SUSPENDIDO' }) =>
      cambiarEstadoEmpresa(id, estado),
    meta: { exito: 'Estado de empresa actualizado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  });
};

export const useEliminarEmpresa = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarEmpresa(id),
    meta: { exito: 'Empresa eliminada' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  });
};
