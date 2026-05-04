import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crearEtiquetaEnSitio, listarEtiquetasPorSitio } from '../servicios/servicioEtiquetas';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import type { Identificador } from '@compartido/tipos/identificador';
import type { SolicitudCrearEtiqueta } from '../contratos/etiqueta';

export const useListarEtiquetas = (codigoSitio: string | null, paginacion: Paginacion = paginacionInicial) =>
  useQuery({
    queryKey: ['etiquetas', codigoSitio, paginacion],
    queryFn: () => listarEtiquetasPorSitio(codigoSitio!, paginacion),
    enabled: Boolean(codigoSitio),
  });

export const useCrearEtiqueta = (sitioId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (solicitud: SolicitudCrearEtiqueta) => {
      if (!sitioId) return Promise.reject(new Error('Selecciona un sitio primero'));
      return crearEtiquetaEnSitio(sitioId, solicitud);
    },
    meta: { exito: 'Etiqueta creada' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['etiquetas'] }),
  });
};
