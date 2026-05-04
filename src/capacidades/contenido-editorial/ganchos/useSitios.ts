import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecursoListado } from '@compartido/biblioteca/useRecursoListado';
import { crearSitio, listarSitios } from '../servicios/servicioSitios';
import type { Paginacion } from '@compartido/tipos/paginacion';

const CLAVE_SITIOS = ['sitios'] as const;

export const useListarSitios = (paginacion?: Paginacion) =>
  useRecursoListado({ clave: CLAVE_SITIOS, consultar: listarSitios, paginacion });

export const useCrearSitio = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: crearSitio,
    meta: { exito: 'Sitio creado correctamente' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_SITIOS }),
  });
};
