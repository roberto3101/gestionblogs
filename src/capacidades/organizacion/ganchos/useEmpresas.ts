import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecursoListado } from '@compartido/biblioteca/useRecursoListado';
import { crearEmpresa, listarEmpresas } from '../servicios/servicioEmpresas';
import type { Paginacion } from '@compartido/tipos/paginacion';

const CLAVE_EMPRESAS = ['empresas'] as const;

export const useListarEmpresas = (paginacion?: Paginacion) =>
  useRecursoListado({ clave: CLAVE_EMPRESAS, consultar: listarEmpresas, paginacion });

export const useCrearEmpresa = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: crearEmpresa,
    meta: { exito: 'Empresa registrada' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_EMPRESAS }),
  });
};
