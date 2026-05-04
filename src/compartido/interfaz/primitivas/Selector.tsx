import type { SelectHTMLAttributes } from 'react';
import { useId } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';

export interface OpcionSelector {
  valor: string;
  etiqueta: string;
}

interface PropiedadesSelector extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  etiqueta: string;
  opciones: OpcionSelector[];
  ayuda?: string;
  error?: string;
  marcadorPosicion?: string;
}

export const Selector = ({
  etiqueta,
  opciones,
  ayuda,
  error,
  marcadorPosicion,
  className,
  id,
  ...resto
}: PropiedadesSelector) => {
  const idGenerado = useId();
  const idFinal = id ?? idGenerado;
  return (
    <label htmlFor={idFinal} className="flex flex-col gap-1.5">
      <span className="meta-tipografia">{etiqueta}</span>
      <select
        id={idFinal}
        aria-invalid={Boolean(error)}
        className={unirClases(
          'bg-papel border rounded-suave outline-none text-sm text-tinta h-10 px-3',
          error ? 'border-cinabrio' : 'border-ceniza focus:border-tinta',
          className,
        )}
        {...resto}
      >
        {marcadorPosicion && <option value="">{marcadorPosicion}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {(ayuda || error) && (
        <span className={unirClases('text-xs', error ? 'text-cinabrio' : 'text-humo')}>
          {error ?? ayuda}
        </span>
      )}
    </label>
  );
};
