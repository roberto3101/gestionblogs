import type { TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';

interface PropiedadesAreaTexto extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  etiqueta: string;
  ayuda?: string;
  error?: string;
}

export const AreaTexto = ({ etiqueta, ayuda, error, className, id, ...resto }: PropiedadesAreaTexto) => {
  const idGenerado = useId();
  const idFinal = id ?? idGenerado;
  return (
    <label htmlFor={idFinal} className="flex flex-col gap-1.5">
      <span className="meta-tipografia">{etiqueta}</span>
      <textarea
        id={idFinal}
        aria-invalid={Boolean(error)}
        className={unirClases(
          'bg-papel border rounded-suave outline-none text-sm text-tinta placeholder:text-humo px-3 py-2 min-h-[96px] resize-y',
          error ? 'border-cinabrio' : 'border-ceniza focus:border-tinta',
          className,
        )}
        {...resto}
      />
      {(ayuda || error) && (
        <span className={unirClases('text-xs', error ? 'text-cinabrio' : 'text-humo')}>
          {error ?? ayuda}
        </span>
      )}
    </label>
  );
};
