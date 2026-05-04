import { unirClases } from '@compartido/utilidades/unirClases';

interface OpcionMultiple {
  valor: string;
  etiqueta: string;
  detalle?: string;
}

interface PropiedadesSelectorMultiple {
  etiqueta: string;
  ayuda?: string;
  opciones: OpcionMultiple[];
  seleccionados: string[];
  alCambiar: (seleccionados: string[]) => void;
  marcadorVacio?: string;
}

export const SelectorMultiple = ({
  etiqueta,
  ayuda,
  opciones,
  seleccionados,
  alCambiar,
  marcadorVacio = 'Sin opciones disponibles',
}: PropiedadesSelectorMultiple) => {
  const alternar = (valor: string) => {
    if (seleccionados.includes(valor)) {
      alCambiar(seleccionados.filter((v) => v !== valor));
    } else {
      alCambiar([...seleccionados, valor]);
    }
  };

  return (
    <div className="space-y-2">
      <span className="meta-tipografia">{etiqueta}</span>
      {opciones.length === 0 ? (
        <p className="text-xs text-humo italic">{marcadorVacio}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {opciones.map((opcion) => {
            const seleccionado = seleccionados.includes(opcion.valor);
            return (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => alternar(opcion.valor)}
                className={unirClases(
                  'inline-flex items-center px-2.5 h-7 rounded-suave text-xs border transicion-natural',
                  seleccionado
                    ? 'bg-oliva-suave border-oliva text-tinta'
                    : 'bg-papel border-ceniza text-grafito hover:border-grafito',
                )}
              >
                {seleccionado && <span className="mr-1 text-oliva">✓</span>}
                {opcion.etiqueta}
              </button>
            );
          })}
        </div>
      )}
      {ayuda && <span className="text-xs text-humo">{ayuda}</span>}
    </div>
  );
};
