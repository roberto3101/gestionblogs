import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subirMedio } from '../servicios/servicioMedios';

export const useSubirMedio = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: subirMedio,
    meta: { exito: 'Medio registrado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['medios'] }),
  });
};
