import type { ReactNode } from 'react';

interface PropiedadesEstadoVacio {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export const EstadoVacio = ({ titulo, descripcion, accion }: PropiedadesEstadoVacio) => (
  <div className="lamina py-16 px-8 text-center">
    <p className="meta-tipografia mb-3">Aún no hay nada</p>
    <h3 className="titulo-editorial text-2xl text-tinta mb-2">{titulo}</h3>
    {descripcion && <p className="text-grafito max-w-lectura mx-auto">{descripcion}</p>}
    {accion && <div className="mt-6 inline-flex">{accion}</div>}
  </div>
);
