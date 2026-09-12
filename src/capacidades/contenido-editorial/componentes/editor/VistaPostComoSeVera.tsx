/**
 * El post entero, a pantalla completa, tal como se vera en la web.
 *
 * Ya no es un recuadro al lado del editor: desde que se escribe directamente
 * con el aspecto de la pagina de articulo, tener dos veces el mismo texto en
 * pantalla solo quitaba sitio. Esto se abre a peticion, para ver la pieza
 * completa —titular, portada, firma y cuerpo— antes de publicar.
 */

import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { renderizarMarkdownPost } from '@compartido/utilidades/renderizadorMarkdown';
import { ESTILOS_ARTICULO } from './estilosArticulo';

interface PropiedadesVistaPost {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  resumen?: string;
  contenido: string;
  urlPortada?: string | null;
  autor?: string;
  tema?: string;
}

const fechaDeHoy = () =>
  new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date())
    .replace('.', '');

export const VistaPostComoSeVera = ({
  abierto,
  alCerrar,
  titulo,
  resumen,
  contenido,
  urlPortada,
  autor,
  tema,
}: PropiedadesVistaPost) => {
  const html = useMemo(() => renderizarMarkdownPost(contenido), [contenido]);

  const palabras = contenido.trim() ? contenido.trim().split(/\s+/).length : 0;
  const minutos = Math.max(1, Math.round(palabras / 200));

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') alCerrar();
    };
    window.addEventListener('keydown', alPulsar);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = '';
    };
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  /*
   * Se cuelga de <body>.
   *
   * Dentro del contenido, un `fixed inset-0` si ocupa toda la ventana pero se
   * pinta POR DEBAJO de la barra lateral: estan en contextos de apilamiento
   * distintos y ahi el z-index no compite.
   */
  return createPortal(
    <>
      <style>{ESTILOS_ARTICULO}</style>
      <div className="fixed inset-0 z-[100] flex flex-col bg-tinta">
        <div className="flex items-center justify-between gap-3 bg-papel px-4 py-2.5">
          <span className="meta-tipografia text-humo">El post entero, como se verá en la web</span>
          <div className="flex items-center gap-3">
            <span className="meta-tipografia text-xs text-humo">
              {palabras} palabras · {minutos} min de lectura
            </span>
            <button
              type="button"
              onClick={alCerrar}
              className="h-8 rounded-suave border border-ceniza px-3 text-xs text-grafito transicion-natural hover:bg-ceniza/40 hover:text-tinta"
            >
              Volver a escribir (Esc)
            </button>
          </div>
        </div>

        <div className="comoSeVera flex-1">
          <div className="hoja">
            {tema && <span className="tema">{tema}</span>}

            <h1 className={titulo.trim() ? 'titulo' : 'titulo vacio'}>
              {titulo.trim() || 'Sin título todavía'}
            </h1>

            {resumen?.trim() && <p className="entradilla">{resumen.trim()}</p>}

            <div className="meta">
              {autor && <span className="autor">{autor}</span>}
              {autor && <span aria-hidden="true">·</span>}
              <span>{fechaDeHoy()}</span>
              <span aria-hidden="true">·</span>
              <span>{minutos} min de lectura</span>
            </div>

            {urlPortada && <img className="portada" src={urlPortada} alt="" />}

            {html ? (
              <div className="cuerpo" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className="nadaAun" style={{ marginTop: '32px' }}>
                El post está vacío todavía.
              </p>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};
