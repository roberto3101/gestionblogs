import type { ReactNode } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';

export interface ColumnaTabla<T> {
  clave: string;
  etiqueta: string;
  obtener: (fila: T) => ReactNode;
  alineacion?: 'izquierda' | 'derecha';
  anchoMinimo?: string;
}

interface PropiedadesTabla<T> {
  columnas: ColumnaTabla<T>[];
  filas: T[];
  obtenerLlave: (fila: T) => string;
  alClickear?: (fila: T) => void;
}

export const Tabla = <T,>({ columnas, filas, obtenerLlave, alClickear }: PropiedadesTabla<T>) => (
  <div className="lamina overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="filete-bajo">
            {columnas.map((columna) => (
              <th
                key={columna.clave}
                style={{ minWidth: columna.anchoMinimo }}
                className={unirClases(
                  'meta-tipografia text-left px-4 py-3 font-medium',
                  columna.alineacion === 'derecha' && 'text-right',
                )}
              >
                {columna.etiqueta}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr
              key={obtenerLlave(fila)}
              onClick={alClickear ? () => alClickear(fila) : undefined}
              className={unirClases(
                'filete-bajo last:border-b-0 transicion-natural',
                alClickear && 'cursor-pointer hover:bg-lienzo',
              )}
            >
              {columnas.map((columna) => (
                <td
                  key={columna.clave}
                  className={unirClases(
                    'px-4 py-3 text-tinta align-middle',
                    columna.alineacion === 'derecha' && 'text-right',
                  )}
                >
                  {columna.obtener(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
