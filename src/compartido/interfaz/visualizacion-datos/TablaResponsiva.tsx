import type { ReactNode } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';
import type { ColumnaTabla } from './Tabla';

interface PropiedadesTablaResponsiva<T> {
  columnas: ColumnaTabla<T>[];
  filas: T[];
  obtenerLlave: (fila: T) => string;
  /** Render alternativo para mobile (cards apiladas). Si no se pasa, muestra las columnas como key/value. */
  renderTarjetaMovil?: (fila: T) => ReactNode;
}

/**
 * Tabla en desktop (md+), lista de cards apiladas en mobile.
 * Reusa ColumnaTabla del componente Tabla original.
 */
export const TablaResponsiva = <T,>({
  columnas,
  filas,
  obtenerLlave,
  renderTarjetaMovil,
}: PropiedadesTablaResponsiva<T>) => (
  <>
    {/* Desktop: tabla */}
    <div className="hidden md:block lamina overflow-hidden">
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
              <tr key={obtenerLlave(fila)} className="filete-bajo last:border-b-0 transicion-natural">
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

    {/* Mobile: lista de cards */}
    <div className="md:hidden space-y-3">
      {filas.map((fila) => (
        <div
          key={obtenerLlave(fila)}
          className="lamina p-4 flex flex-col gap-2.5 border border-ceniza"
        >
          {renderTarjetaMovil ? (
            renderTarjetaMovil(fila)
          ) : (
            columnas.map((columna) => (
              <div key={columna.clave} className="flex justify-between items-start gap-3">
                <span className="meta-tipografia text-humo text-xs uppercase tracking-wider">
                  {columna.etiqueta}
                </span>
                <span className="text-sm text-tinta text-right">{columna.obtener(fila)}</span>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  </>
);
