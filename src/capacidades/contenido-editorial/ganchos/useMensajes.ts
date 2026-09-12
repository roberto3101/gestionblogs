import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Identificador } from '@compartido/tipos/identificador';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import {
  cambiarEstadoMensaje,
  listarMensajes,
  listarSuscriptores,
  probarCorreo,
} from '../servicios/servicioMensajes';

export const useListarMensajes = (
  sitioId: Identificador | null,
  paginacion: Paginacion = paginacionInicial,
  estado = '',
) =>
  useQuery({
    queryKey: ['mensajes', sitioId, paginacion, estado],
    queryFn: () => listarMensajes(sitioId!, paginacion, estado),
    enabled: Boolean(sitioId),
  });

export const useCambiarEstadoMensaje = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: Identificador; estado: string }) =>
      cambiarEstadoMensaje(id, estado),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['mensajes'] }),
  });
};

export const useListarSuscriptores = (
  sitioId: Identificador | null,
  paginacion: Paginacion = paginacionInicial,
) =>
  useQuery({
    queryKey: ['suscriptores', sitioId, paginacion],
    queryFn: () => listarSuscriptores(sitioId!, paginacion),
    enabled: Boolean(sitioId),
  });

export const useProbarCorreo = (sitioId: Identificador | null) =>
  useMutation({
    mutationFn: (idioma: string) => {
      if (!sitioId) return Promise.reject(new Error('Selecciona un sitio primero'));
      return probarCorreo(sitioId, idioma);
    },
    meta: { exito: 'Correo de prueba enviado' },
  });
