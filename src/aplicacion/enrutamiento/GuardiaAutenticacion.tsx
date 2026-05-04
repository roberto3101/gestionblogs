import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSesion } from '@plataforma/identidad/ganchos/useSesion';

export const GuardiaAutenticacion = ({ children }: { children: ReactNode }) => {
  const { estaAutenticado } = useSesion();
  const ubicacion = useLocation();
  if (!estaAutenticado) {
    return <Navigate to="/iniciar-sesion" replace state={{ desde: ubicacion.pathname }} />;
  }
  return <>{children}</>;
};

export const RedireccionSiAutenticado = ({ children }: { children: ReactNode }) => {
  const { estaAutenticado } = useSesion();
  if (estaAutenticado) return <Navigate to="/panel" replace />;
  return <>{children}</>;
};
