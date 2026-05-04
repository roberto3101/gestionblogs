import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../servicios/servicioSesion';
import { useSesion } from '@plataforma/identidad/ganchos/useSesion';
import type { SolicitudIniciarSesion } from '../contratos/sesion';

export const useIniciarSesion = () => {
  const { registrarSesion } = useSesion();
  const navegar = useNavigate();

  return useMutation({
    mutationFn: async (solicitud: SolicitudIniciarSesion) => {
      const sesion = await iniciarSesion(solicitud);
      return { sesion, correo: solicitud.correo_electronico };
    },
    onSuccess: ({ sesion, correo }) => {
      registrarSesion({ ...sesion, correo_electronico: correo });
      navegar('/panel', { replace: true });
    },
  });
};
