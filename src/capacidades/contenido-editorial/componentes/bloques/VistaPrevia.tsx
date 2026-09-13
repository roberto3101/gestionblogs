import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { unirClases } from '@compartido/utilidades/unirClases';
import { configuracionEntorno } from '@compartido/constantes/configuracionEntorno';

/**
 * La web de verdad, dentro del panel, mientras se edita.
 *
 * No es un dibujo ni una aproximación: es la página tal cual la ve cualquiera,
 * cargada en un marco. Mientras se escribe, los textos cambiados se sustituyen
 * en ese marco al vuelo, para ver el resultado sin esperar nada.
 *
 * Es una vista de cortesía, no la verdad: lo que se ve aquí sale de lo último
 * publicado más los cambios de este momento. La web real solo cambia al
 * publicar.
 */

interface Propiedades {
  /** Código del sitio, para pedirle la página al CMS. */
  codigoSitio: string;
  /** Dirección de la web, solo para enseñarla y poder abrirla aparte. */
  baseDelSitio: string;
  /** Página a mostrar, por ejemplo "/nosotros/" */
  ruta: string;
  /**
   * Trozo que se está editando. La página baja hasta él y lo señala, para no
   * tener que buscarlo a mano cada vez.
   */
  bloque: string;
  /**
   * Texto del campo que se está editando ahora mismo. La página lo busca y lo
   * rodea en naranja, para saber cuál de los textos de la pantalla es.
   */
  textoEnfocado?: string;
  /**
   * Textos a sustituir en caliente: del valor publicado al que se está
   * escribiendo ahora. Solo cadenas, que es lo que se puede reemplazar sin
   * volver a montar la página.
   */
  sustituciones: Array<{ antes: string; ahora: string }>;
  /** Cierra la vista previa. */
  alCerrar: () => void;
}

type Tamano = 'movil' | 'escritorio';

const ANCHOS: Record<Tamano, number> = { movil: 390, escritorio: 1280 };

export const VistaPrevia = ({
  codigoSitio,
  baseDelSitio,
  ruta,
  bloque,
  sustituciones,
  alCerrar,
  textoEnfocado,
}: Propiedades) => {
  const marco = useRef<HTMLIFrameElement>(null);
  const [tamano, asignarTamano] = useState<Tamano>('escritorio');
  const [cargando, asignarCargando] = useState(true);
  const [bloqueada, asignarBloqueada] = useState(false);
  // Si se puede señalar en la página lo que se está cambiando.
  const [puedeMarcar, asignarPuedeMarcar] = useState(true);
  const [pantallaCompleta, asignarPantallaCompleta] = useState(false);

  // Se pide al CMS, que la descarga de la web y la sirve desde aqui. Sin
  // esto el navegador la bloquearia: la web prohibe que la incrusten.
  const direccion =
    `${configuracionEntorno.urlBaseApi}/publico/sitios/` +
    `${encodeURIComponent(codigoSitio)}/vista-previa` +
    `?ruta=${encodeURIComponent(ruta)}&bloque=${encodeURIComponent(bloque)}`;
  const direccionReal = `${baseDelSitio.replace(/\/+$/, '')}${ruta}`;

  // Sustituir los textos cambiados dentro del marco. Se hace en cada cambio,
  // con una pequeña espera para no recorrer la página en cada tecla.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      let documento: Document | null = null;
      try {
        documento = marco.current?.contentDocument ?? null;
      } catch {
        // El navegador no deja entrar cuando el panel y el CMS estan en
        // dominios distintos. La pagina se ve igual, solo que sin marcar.
        documento = null;
      }
      if (!documento || !documento.body) {
        asignarPuedeMarcar(false);
        return;
      }
      asignarPuedeMarcar(true);

      for (const { antes, ahora } of sustituciones) {
        if (!antes || antes === ahora) continue;
        const recorrido = documento.createTreeWalker(documento.body, NodeFilter.SHOW_TEXT);
        const encontrados: Text[] = [];
        let nodo = recorrido.nextNode();
        while (nodo) {
          if (nodo.nodeValue && nodo.nodeValue.includes(antes)) encontrados.push(nodo as Text);
          nodo = recorrido.nextNode();
        }
        for (const texto of encontrados) {
          texto.nodeValue = (texto.nodeValue ?? '').split(antes).join(ahora);
          // Marcar lo tocado para que se vea de un vistazo qué cambia.
          const padre = texto.parentElement;
          if (padre) {
            padre.style.outline = '2px solid #f0a12b';
            padre.style.outlineOffset = '2px';
            padre.style.borderRadius = '3px';
          }
        }
      }
    }, 250);
    return () => clearTimeout(temporizador);
  }, [sustituciones, cargando]);

  /*
   * Se le dice a la pagina que rodee el trozo que se esta editando.
   *
   * El panel ensena una lista de campos y la web ensena una pagina: sin esto,
   * quien edita no sabe cual de los dos titulares de la pantalla es el campo
   * que tiene delante. Se manda solo el texto; la pagina lo busca y lo rodea.
   */
  useEffect(() => {
    const ventana = marco.current?.contentWindow;
    if (!ventana) return;
    let destino: string;
    try {
      destino = new URL(direccion, window.location.href).origin;
    } catch {
      return;
    }
    ventana.postMessage({ tipo: 'cms-resaltar', texto: textoEnfocado ?? '' }, destino);
  }, [textoEnfocado, direccion]);

  // Si la web no responde, avisar en vez de dejar un marco en blanco. Se mira
  // si llego a cargar, no lo que hay dentro: en dominios distintos el
  // navegador no deja asomarse aunque la pagina este perfectamente.
  useEffect(() => {
    asignarCargando(true);
    asignarBloqueada(false);
    const aviso = setTimeout(() => {
      asignarCargando((sigueCargando) => {
        if (sigueCargando) asignarBloqueada(true);
        return sigueCargando;
      });
    }, 12000);
    return () => clearTimeout(aviso);
  }, [direccion]);

  // Escape sale de la pantalla completa, que es lo que espera cualquiera.
  useEffect(() => {
    if (!pantallaCompleta) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') asignarPantallaCompleta(false);
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [pantallaCompleta]);

  const recuadro = (
    <aside
      className={unirClases(
        'flex flex-col bg-papel overflow-hidden',
        pantallaCompleta
          ? 'fixed inset-0 z-[100] p-0'
          : 'border border-ceniza rounded-suave',
      )}
    >
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-ceniza bg-lienzo">
        <span className="meta-tipografia text-grafito">Así se va a ver</span>

        <div className="flex items-center gap-1 ml-auto">
          {(['escritorio', 'movil'] as Tamano[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => asignarTamano(t)}
              className={unirClases(
                'h-7 px-2.5 rounded-suave text-xs border transition-colors',
                t === tamano
                  ? 'bg-tinta text-lienzo border-tinta'
                  : 'bg-papel text-grafito border-ceniza hover:border-humo',
              )}
            >
              {t === 'movil' ? 'Móvil' : 'Ordenador'}
            </button>
          ))}
          <button
            type="button"
            onClick={() => asignarPantallaCompleta((v) => !v)}
            className="h-7 px-2.5 text-xs rounded-suave border border-ceniza text-grafito transicion-natural hover:bg-ceniza/40 hover:text-tinta"
            title={pantallaCompleta ? 'Volver al panel (Esc)' : 'Ver la página a pantalla completa'}
          >
            {pantallaCompleta ? 'Salir (Esc)' : 'Pantalla completa'}
          </button>
        </div>

        <Boton
          tono="fantasma"
          tamano="compacto"
          type="button"
          onClick={() => {
            if (marco.current) marco.current.src = marco.current.src;
          }}
        >
          Recargar
        </Boton>
        <a
          href={direccionReal}
          target="_blank"
          rel="noreferrer"
          className="h-8 px-3 inline-flex items-center rounded-suave text-[13px] text-tinta border border-transparent hover:bg-ceniza/40"
        >
          Abrir aparte
        </a>
        <Boton tono="fantasma" tamano="compacto" type="button" onClick={alCerrar}>
          Cerrar
        </Boton>
      </header>

      {bloqueada && (
        <p className="px-4 py-3 text-sm text-grafito border-b border-ceniza bg-ambar/5">
          No se ha podido cargar la web.{' '}
          <a href={direccionReal} target="_blank" rel="noreferrer" className="underline">
            Ábrela en otra pestaña
          </a>{' '}
          para comprobar que funciona.
        </p>
      )}

      <div
        className="relative flex-1 bg-lienzo overflow-auto"
        style={pantallaCompleta ? undefined : { height: '70vh' }}
      >
        {cargando && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-humo">
            Cargando la web…
          </p>
        )}
        <div
          className="mx-auto transition-all"
          style={{ width: ANCHOS[tamano], maxWidth: '100%', height: '100%' }}
        >
          <iframe
            ref={marco}
            src={direccion}
            title="Así se va a ver la web"
            className="w-full border-0 bg-white"
            // A pantalla completa el marco ocupa todo el alto disponible; si no,
            // el 70% de la ventana como antes.
            style={{ height: pantallaCompleta ? '100%' : '70vh' }}
            onLoad={() => {
              asignarCargando(false);
              asignarBloqueada(false);
            }}
          />
        </div>
      </div>

      <footer className="px-4 py-2 border-t border-ceniza text-xs text-humo">
        {puedeMarcar
          ? 'Lo naranja es lo que estás cambiando. La web de verdad no cambia hasta que publiques.'
          : 'Esto es la web tal y como está publicada. La web no cambia hasta que publiques.'}
      </footer>
    </aside>
  );

  /*
   * A pantalla completa el recuadro se cuelga de <body>.
   *
   * Con `fixed inset-0 z-50` dentro del contenido, el panel si ocupaba toda la
   * ventana pero se pintaba POR DEBAJO de la barra lateral: estaban en
   * contextos de apilamiento distintos y ahi el z-index no compite. El
   * resultado era una vista previa a pantalla completa cuyo boton de salir
   * quedaba tapado por la cabecera del panel.
   */
  return pantallaCompleta ? createPortal(recuadro, document.body) : recuadro;
};
