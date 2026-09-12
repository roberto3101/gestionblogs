import { unirClases } from '@compartido/utilidades/unirClases';

export interface OpcionTabEstado {
  valor: string;
  etiqueta: string;
  conteo?: number;
}

interface PropiedadesTabsEstado {
  opciones: OpcionTabEstado[];
  valor: string;
  alCambiar: (valor: string) => void;
}

/**
 * Tabs simples para alternar listas por estado (Activos / Archivados).
 * Mobile-friendly: scroll horizontal cuando las opciones no caben.
 */
export const TabsEstado = ({ opciones, valor, alCambiar }: PropiedadesTabsEstado) => (
  <div className="flex gap-1 overflow-x-auto -mx-1 px-1 mb-4 border-b border-ceniza" role="tablist">
    {opciones.map((opcion) => {
      const activo = opcion.valor === valor;
      return (
        <button
          key={opcion.valor}
          type="button"
          role="tab"
          aria-selected={activo}
          onClick={() => alCambiar(opcion.valor)}
          className={unirClases(
            'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transicion-natural border-b-2 -mb-px',
            activo ? 'text-tinta border-oliva' : 'text-humo border-transparent hover:text-grafito',
          )}
        >
          <span>{opcion.etiqueta}</span>
          {typeof opcion.conteo === 'number' && (
            <span
              className={unirClases(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-codigo',
                activo ? 'bg-oliva text-lienzo' : 'bg-ceniza text-grafito',
              )}
            >
              {opcion.conteo}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
