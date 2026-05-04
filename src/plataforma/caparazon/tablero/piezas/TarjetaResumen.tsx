import type { ReactNode } from 'react';

interface PropiedadesTarjetaResumen {
  etiqueta: string;
  valor: ReactNode;
  pista?: string;
}

export const TarjetaResumen = ({ etiqueta, valor, pista }: PropiedadesTarjetaResumen) => (
  <div className="lamina p-5 space-y-2">
    <p className="meta-tipografia">{etiqueta}</p>
    <p className="titulo-editorial text-3xl text-tinta">{valor}</p>
    {pista && <p className="text-xs text-humo">{pista}</p>}
  </div>
);
