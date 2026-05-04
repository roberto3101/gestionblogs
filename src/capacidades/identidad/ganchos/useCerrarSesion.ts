import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cerrarSesion } from '../servicios/servicioSesion';
import { useSesion } from '@plataforma/identidad/ganchos/useSesion';

export const useCerrarSesion = () => {
  const { descartarSesion } = useSesion();
  const navegar = useNavigate();

  return useMutation({
    mutationFn: cerrarSesion,
    onSettled: () => {
      descartarSesion();
      navegar('/iniciar-sesion', { replace: true });
    },
  });
};
