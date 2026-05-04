import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificaciones } from './contextoNotificaciones';
import { interpretarMensajeError } from './interpretarMensajeError';

export const useNotificarErrores = () => {
  const cliente = useQueryClient();
  const { publicar } = useNotificaciones();

  useEffect(() => {
    const cache = cliente.getMutationCache();
    const desuscribir = cache.subscribe((evento) => {
      if (evento.type !== 'updated') return;
      const mutacion = evento.mutation;
      if (mutacion.state.status === 'error' && mutacion.state.error) {
        const { titulo, detalle } = interpretarMensajeError(mutacion.state.error);
        publicar({ tono: 'error', titulo, detalle });
      }
      if (mutacion.state.status === 'success' && evento.action.type === 'success') {
        const tipo = (mutacion.options.meta as { exito?: string } | undefined)?.exito;
        if (tipo) publicar({ tono: 'exito', titulo: tipo });
      }
    });
    return desuscribir;
  }, [cliente, publicar]);
};
