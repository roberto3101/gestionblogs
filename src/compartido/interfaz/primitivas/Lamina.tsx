import type { HTMLAttributes, ReactNode } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';

interface PropiedadesLamina extends HTMLAttributes<HTMLDivElement> {
  variante?: 'estandar' | 'limpia';
  children: ReactNode;
}

export const Lamina = ({ variante = 'estandar', className, children, ...resto }: PropiedadesLamina) => (
  <div
    className={unirClases(
      variante === 'estandar' ? 'lamina' : 'lamina-suave',
      className,
    )}
    {...resto}
  >
    {children}
  </div>
);
