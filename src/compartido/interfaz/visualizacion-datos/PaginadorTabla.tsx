import { unirClases } from '@compartido/utilidades/unirClases';

interface PropiedadesPaginadorTabla {
  pagina: number;
  tamanoPagina: number;
  totalFilas: number;
  totalPaginas: number;
  alCambiarPagina: (pagina: number) => void;
}

export const PaginadorTabla = ({
  pagina,
  totalFilas,
  totalPaginas,
  alCambiarPagina,
}: PropiedadesPaginadorTabla) => {
  if (totalPaginas <= 1) return null;

  const haySiguiente = pagina < totalPaginas;
  const hayAnterior = pagina > 1;

  const claseBoton = (habilitado: boolean) =>
    unirClases(
      'meta-tipografia px-2 py-1 transicion-natural',
      habilitado ? 'text-grafito hover:text-tinta' : 'text-humo cursor-not-allowed',
    );

  return (
    <div className="flex items-center justify-end gap-4 mt-3">
      <span className="meta-tipografia text-humo">
        Página {pagina} de {totalPaginas} · {totalFilas} filas
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!hayAnterior}
          onClick={() => hayAnterior && alCambiarPagina(pagina - 1)}
          className={claseBoton(hayAnterior)}
        >
          ← Anterior
        </button>
        <button
          type="button"
          disabled={!haySiguiente}
          onClick={() => haySiguiente && alCambiarPagina(pagina + 1)}
          className={claseBoton(haySiguiente)}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};
