import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Identificador } from '@compartido/tipos/identificador';
import {
  descartarBorrador,
  guardarBloque,
  listarBloques,
  listarRevisiones,
  publicarBloques,
  restaurarRevision,
  resumenPorIdioma,
} from '../servicios/servicioBloques';
import type { SolicitudGuardarBloque, SolicitudPublicarBloques } from '../contratos/bloque';

export const useListarBloques = (sitioId: Identificador | null, idioma: string) =>
  useQuery({
    queryKey: ['bloques', sitioId, idioma],
    queryFn: () => listarBloques(sitioId!, idioma),
    enabled: Boolean(sitioId && idioma),
  });

export const useResumenBloques = (sitioId: Identificador | null) =>
  useQuery({
    queryKey: ['bloques-resumen', sitioId],
    queryFn: () => resumenPorIdioma(sitioId!),
    enabled: Boolean(sitioId),
  });

export const useGuardarBloque = (sitioId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (solicitud: SolicitudGuardarBloque) => {
      if (!sitioId) return Promise.reject(new Error('Selecciona un sitio primero'));
      return guardarBloque(sitioId, solicitud);
    },
    meta: { exito: 'Cambios guardados. Publica para que se vean en la web.' },
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: ['bloques'] });
      cliente.invalidateQueries({ queryKey: ['bloques-resumen'] });
    },
  });
};

export const useDescartarBorrador = (sitioId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ idioma, clave }: { idioma: string; clave: string }) => {
      if (!sitioId) return Promise.reject(new Error('Selecciona un sitio primero'));
      return descartarBorrador(sitioId, idioma, clave);
    },
    meta: { exito: 'Cambios descartados' },
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: ['bloques'] });
      cliente.invalidateQueries({ queryKey: ['bloques-resumen'] });
    },
  });
};

export const usePublicarBloques = (sitioId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (solicitud: SolicitudPublicarBloques) => {
      if (!sitioId) return Promise.reject(new Error('Selecciona un sitio primero'));
      return publicarBloques(sitioId, solicitud);
    },
    meta: { exito: 'Publicado. La web se reconstruye en aproximadamente un minuto.' },
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: ['bloques'] });
      cliente.invalidateQueries({ queryKey: ['bloques-resumen'] });
    },
  });
};

export const useRevisionesBloque = (
  sitioId: Identificador | null,
  idioma: string,
  clave: string | null,
) =>
  useQuery({
    queryKey: ['bloque-revisiones', sitioId, idioma, clave],
    queryFn: () => listarRevisiones(sitioId!, idioma, clave!),
    enabled: Boolean(sitioId && idioma && clave),
  });

export const useRestaurarRevision = (sitioId: Identificador | null) => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ idioma, clave, numero }: { idioma: string; clave: string; numero: number }) => {
      if (!sitioId) return Promise.reject(new Error('Selecciona un sitio primero'));
      return restaurarRevision(sitioId, idioma, clave, numero);
    },
    meta: { exito: 'Versión cargada como borrador. Revísala y publica si te convence.' },
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: ['bloques'] });
      cliente.invalidateQueries({ queryKey: ['bloques-resumen'] });
    },
  });
};
