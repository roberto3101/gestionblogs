import type { ReactNode } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';

type Tono = 'neutro' | 'oliva' | 'ambar' | 'cinabrio';

interface PropiedadesEtiqueta {
  tono?: Tono;
  children: ReactNode;
  className?: string;
}

const estilosPorTono: Record<Tono, string> = {
  neutro: 'bg-ceniza/40 text-grafito border-ceniza',
  oliva: 'bg-oliva-suave text-oliva border-oliva/20',
  ambar: 'bg-ambar/10 text-ambar border-ambar/30',
  cinabrio: 'bg-cinabrio/10 text-cinabrio border-cinabrio/30',
};

export const Etiqueta = ({ tono = 'neutro', children, className }: PropiedadesEtiqueta) => (
  <span
    className={unirClases(
      'inline-flex items-center px-2 h-6 rounded-suave text-xs font-medium border',
      estilosPorTono[tono],
      className,
    )}
  >
    {children}
  </span>
);
