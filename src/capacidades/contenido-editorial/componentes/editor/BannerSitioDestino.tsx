import { useListarSitios } from '../../ganchos/useSitios';
import { unirClases } from '@compartido/utilidades/unirClases';
import { construirUrlPublicaBlog } from '@compartido/constantes/sitiosProduccion';
import type { Sitio } from '../../contratos/sitio';
import type { Identificador } from '@compartido/tipos/identificador';

interface PropiedadesBanner {
  sitioIdSeleccionado: Identificador | '';
  alCambiar: (id: Identificador, sitio: Sitio | null) => void;
  idiomaSeleccionado: string;
  alCambiarIdioma: (idioma: string) => void;
}

export const BannerSitioDestino = ({
  sitioIdSeleccionado,
  alCambiar,
  idiomaSeleccionado,
  alCambiarIdioma,
}: PropiedadesBanner) => {
  const consulta = useListarSitios();
  const sitios = consulta.data?.elementos ?? [];

  return (
    <div className="lamina p-5 mb-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-3 flex-1 min-w-[280px]">
          <p className="meta-tipografia">Vas a publicar en</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sitios.map((sitio) => {
              const seleccionado = sitio.id === sitioIdSeleccionado;
              const urlPublica = construirUrlPublicaBlog(sitio.codigo, idiomaSeleccionado);
              return (
                <button
                  key={sitio.id}
                  type="button"
                  onClick={() => alCambiar(sitio.id, sitio)}
                  className={unirClases(
                    'text-left p-4 rounded-marco border-2 transicion-natural',
                    seleccionado
                      ? 'border-oliva bg-oliva-suave/40'
                      : 'border-ceniza hover:border-grafito bg-papel',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-tinta truncate">{sitio.nombre}</p>
                      <p className="text-xs text-humo font-codigo mt-0.5">{sitio.codigo}</p>
                    </div>
                    {seleccionado && (
                      <span className="h-5 w-5 grid place-items-center rounded-full bg-oliva text-lienzo text-xs font-bold flex-shrink-0">
                        ✓
                      </span>
                    )}
                  </div>
                  {urlPublica && (
                    <p className="text-xs text-grafito mt-3 truncate">{urlPublica}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <p className="meta-tipografia">Idioma del post</p>
          <div className="flex gap-1 bg-lienzo border border-ceniza rounded-suave p-1">
            {[
              { codigo: 'es', etiqueta: 'Español' },
              { codigo: 'en', etiqueta: 'English' },
            ].map((opcion) => (
              <button
                key={opcion.codigo}
                type="button"
                onClick={() => alCambiarIdioma(opcion.codigo)}
                className={unirClases(
                  'px-4 h-9 rounded-suave text-sm transicion-natural',
                  idiomaSeleccionado === opcion.codigo
                    ? 'bg-tinta text-lienzo font-medium'
                    : 'text-grafito hover:bg-ceniza/40',
                )}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
