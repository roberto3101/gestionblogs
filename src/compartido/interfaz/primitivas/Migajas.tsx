import { Fragment } from 'react';
import { Link } from 'react-router-dom';

export interface ItemMigaja {
  etiqueta: string;
  ruta?: string;
}

interface PropiedadesMigajas {
  items: ItemMigaja[];
}

export const Migajas = ({ items }: PropiedadesMigajas) => (
  <nav aria-label="Migajas de pan" className="meta-tipografia flex flex-wrap items-center gap-x-1.5">
    {items.map((item, indice) => {
      const esUltimo = indice === items.length - 1;
      return (
        <Fragment key={`${item.etiqueta}-${indice}`}>
          {esUltimo || !item.ruta ? (
            <span className="text-grafito">{item.etiqueta}</span>
          ) : (
            <Link to={item.ruta} className="hover:text-tinta transicion-natural">
              {item.etiqueta}
            </Link>
          )}
          {!esUltimo && <span className="text-humo" aria-hidden="true">/</span>}
        </Fragment>
      );
    })}
  </nav>
);
