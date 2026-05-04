import type { ReactNode } from 'react';

interface PropiedadesAvisoError {
  titulo?: string;
  children: ReactNode;
}

export const AvisoError = ({ titulo = 'Algo se rompio', children }: PropiedadesAvisoError) => (
  <div className="border border-cinabrio/30 bg-cinabrio/5 rounded-suave px-4 py-3">
    <p className="meta-tipografia text-cinabrio">{titulo}</p>
    <p className="text-sm text-tinta mt-1">{children}</p>
  </div>
);
