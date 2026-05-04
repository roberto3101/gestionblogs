import { useContext } from 'react';
import { ContextoSesion } from '../contextoSesion';

export const useSesion = () => {
  const valor = useContext(ContextoSesion);
  if (!valor) throw new Error('useSesion debe usarse dentro de ProveedorSesion');
  return valor;
};
