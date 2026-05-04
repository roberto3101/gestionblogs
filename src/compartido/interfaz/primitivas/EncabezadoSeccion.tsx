import type { ReactNode } from 'react';
import { TituloEditorial } from './TituloEditorial';

interface PropiedadesEncabezadoSeccion {
  preTitulo?: string;
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}

export const EncabezadoSeccion = ({ preTitulo, titulo, descripcion, acciones }: PropiedadesEncabezadoSeccion) => (
  <header className="flex items-end justify-between gap-6 pb-6 mb-6 filete-bajo">
    <div className="space-y-2">
      <TituloEditorial nivel={2} preTitulo={preTitulo}>
        {titulo}
      </TituloEditorial>
      {descripcion && <p className="text-grafito max-w-lectura">{descripcion}</p>}
    </div>
    {acciones && <div className="flex items-center gap-2 shrink-0">{acciones}</div>}
  </header>
);
