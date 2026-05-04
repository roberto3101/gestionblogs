import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';

interface PropiedadesCampoTexto extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  iconoIzquierdo?: ReactNode;
}

export const CampoTexto = ({
  etiqueta,
  ayuda,
  error,
  iconoIzquierdo,
  className,
  id,
  ...resto
}: PropiedadesCampoTexto) => {
  const idGenerado = useId();
  const idFinal = id ?? idGenerado;
  const idAyuda = `${idFinal}-ayuda`;

  return (
    <label htmlFor={idFinal} className="flex flex-col gap-1.5">
      <span className="meta-tipografia">{etiqueta}</span>
      <div
        className={unirClases(
          'relative flex items-center bg-papel border rounded-suave transicion-natural',
          error ? 'border-cinabrio' : 'border-ceniza focus-within:border-tinta',
        )}
      >
        {iconoIzquierdo && <span className="pl-3 text-humo">{iconoIzquierdo}</span>}
        <input
          id={idFinal}
          aria-describedby={ayuda || error ? idAyuda : undefined}
          aria-invalid={Boolean(error)}
          className={unirClases(
            'flex-1 bg-transparent outline-none text-sm text-tinta placeholder:text-humo',
            'h-10 px-3',
            iconoIzquierdo && 'pl-2',
            className,
          )}
          {...resto}
        />
      </div>
      {(ayuda || error) && (
        <span id={idAyuda} className={unirClases('text-xs', error ? 'text-cinabrio' : 'text-humo')}>
          {error ?? ayuda}
        </span>
      )}
    </label>
  );
};
