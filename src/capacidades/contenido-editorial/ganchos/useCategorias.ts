import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crearCategoriaEnSitio, listarCategoriasPorSitio } from '../servicios/servicioCategorias';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import type { Identificador } from '@compartido/tipos/identificador';
import type { SolicitudCrearCategoria } from '../contratos/categoria';

export const useListarCategorias = (sitioId: Identificador | null, paginacion: Paginacion = paginacionInicial) =>
  useQuery({
    queryKey: ['categorias', sitioId, paginacion],
    queryFn: () => listarCategoriasPorSitio(sitioId!, paginacion),
    enabled: Boolean(sitioId),
  });

export const useCrearCategoria = (sitioId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (solicitud: SolicitudCrearCategoria) => {
      if (!sitioId) return Promise.reject(new Error('Selecciona un sitio primero'));
      return crearCategoriaEnSitio(sitioId, solicitud);
    },
    meta: { exito: 'Categoría creada' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['categorias'] }),
  });
};
