import type { HTMLAttributes, ReactNode } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';

type Nivel = 1 | 2 | 3;

interface PropiedadesTitulo extends HTMLAttributes<HTMLHeadingElement> {
  nivel?: Nivel;
  preTitulo?: string;
  children: ReactNode;
}

const tamanioPorNivel: Record<Nivel, string> = {
  1: 'text-3xl md:text-[34px] leading-tight',
  2: 'text-2xl leading-snug',
  3: 'text-lg',
};

export const TituloEditorial = ({ nivel = 1, preTitulo, className, children, ...resto }: PropiedadesTitulo) => {
  const Etiqueta = `h${nivel}` as 'h1' | 'h2' | 'h3';
  return (
    <div className="space-y-1.5">
      {preTitulo && <p className="meta-tipografia">{preTitulo}</p>}
      <Etiqueta
        className={unirClases('titulo-editorial text-tinta', tamanioPorNivel[nivel], className)}
        {...resto}
      >
        {children}
      </Etiqueta>
    </div>
  );
};
