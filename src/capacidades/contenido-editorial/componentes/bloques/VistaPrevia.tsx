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
  /** Titulo de la ficha del campo, por si su texto no sale en la pagina. */
  respaldoEnfocado?: string;
  /**
   * Textos a sustituir en caliente: del valor publicado al que se está
   * escribiendo ahora. Solo cadenas, que es lo que se puede reemplazar sin
   * volver a montar la página.
   */
  sustituciones: Array<{ antes: string; ahora: string }>;
  /** Cierra la vista previa. */
  alCerrar: () => void;
}

/**
 * Anchos de pantalla con los que se puede mirar la web.
 *
 * Esto no era decorativo: el marco pedía 1280 px pero se le ponía un tope del
 * 100 % del hueco, y en la columna del panel ese hueco son unos 420. La web
 * recibía 420 px de ancho y dibujaba su versión de móvil, así que «Ordenador»
 * y «Móvil» se veían casi igual.
 *
 * Ahora el marco se hace de verdad del ancho elegido y se encoge entero con
 * una escala, como una maqueta. La página cree que está en una pantalla de
 * 1280 y se comporta como tal, aunque quepa en un hueco más estrecho.
 */
type Tamano = 'movil' | 'tableta' | 'escritorio' | 'ancho';

const PANTALLAS: { clave: Tamano; nombre: string; ancho: number }[] = [
  { clave: 'movil', nombre: 'Móvil', ancho: 390 },
  { clave: 'tableta', nombre: 'Tablet', ancho: 834 },
  { clave: 'escritorio', nombre: 'Ordenador', ancho: 1280 },
  { clave: 'ancho', nombre: 'Pantalla grande', ancho: 1600 },
];

const anchoDe = (tamano: Tamano): number =>
  PANTALLAS.find((p) => p.clave === tamano)?.ancho ?? 1280;

export const VistaPrevia = ({
  codigoSitio,
  baseDelSitio,
  ruta,
  bloque,
  sustituciones,
  alCerrar,
  textoEnfocado,
  respaldoEnfocado,
}: Propiedades) => {
  const marco = useRef<HTMLIFrameElement>(null);
  const hueco = useRef<HTMLDivElement>(null);
  const [tamano, asignarTamano] = useState<Tamano>('escritorio');
  // Lo que mide el hueco donde cabe la maqueta. Se mide en vez de suponerlo
  // porque el panel cambia de anchura al plegar el menú o al girar la tableta.
  const [medida, asignarMedida] = useState({ ancho: 0, alto: 0 });
  const [cargando, asignarCargando] = useState(true);
  const [bloqueada, asignarBloqueada] = useState(false);
  // Si se puede señalar en la página lo que se está cambiando.
  const [puedeMarcar, asignarPuedeMarcar] = useState(true);
  const [pantallaCompleta, asignarPantallaCompleta] = useState(false);
  // Que consiguio encender la pagina con el campo que tiene el cursor.
  const [estadoResaltado, asignarEstadoResaltado] = useState<'exacto' | 'zona' | 'nada' | null>(
    null,
  );

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
    ventana.postMessage(
      { tipo: 'cms-resaltar', texto: textoEnfocado ?? '', respaldo: respaldoEnfocado ?? '' },
      destino,
    );
  }, [textoEnfocado, respaldoEnfocado, direccion]);

  /*
   * La pagina contesta si encontro el trozo, la ficha, o nada.
   *
   * Hay datos que no se ven en la pagina por mucho que se busquen: lo que sale
   * en Google, los datos de la empresa para los buscadores, el aviso de un
   * formulario que solo aparece al equivocarse. Decirlo es mejor que dejar a
   * quien edita mirando una web donde no pasa nada.
   */
  useEffect(() => {
    let origen: string;
    try {
      origen = new URL(direccion, window.location.href).origin;
    } catch {
      return;
    }
    const alRecibir = (evento: MessageEvent) => {
      if (evento.origin !== origen) return;
      const dato = evento.data as { tipo?: string; estado?: string } | null;
      if (!dato || dato.tipo !== 'cms-resaltado') return;
      asignarEstadoResaltado(
        dato.estado === 'exacto' || dato.estado === 'zona' || dato.estado === 'nada'
          ? dato.estado
          : null,
      );
    };
    window.addEventListener('message', alRecibir);
    return () => window.removeEventListener('message', alRecibir);
  }, [direccion]);

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

  /*
   * Cuánto hay que encoger la maqueta para que quepa.
   *
   * Se mide el hueco de verdad, no la ventana: la vista previa vive en una
   * columna que cambia de ancho al plegar el menú, al girar una tableta o al
   * pasar a pantalla completa.
   */
  useEffect(() => {
    const nodo = hueco.current;
    if (!nodo) return;
    const medir = () =>
      asignarMedida({ ancho: nodo.clientWidth, alto: nodo.clientHeight });
    medir();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', medir);
      return () => window.removeEventListener('resize', medir);
    }
    const vigia = new ResizeObserver(medir);
    vigia.observe(nodo);
    return () => vigia.disconnect();
  }, [pantallaCompleta]);

  const anchoElegido = anchoDe(tamano);
  // Nunca se agranda: una pantalla de móvil no se estira hasta llenar el hueco,
  // porque entonces dejaría de parecerse a un móvil.
  const escala = medida.ancho > 0 ? Math.min(1, medida.ancho / anchoElegido) : 1;
  const altoDelMarco = medida.alto > 0 ? medida.alto : 520;
  const porcentaje = Math.round(escala * 100);

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

        <div className="flex flex-wrap items-center gap-1 ml-auto">
          {PANTALLAS.map((p) => (
            <button
              key={p.clave}
              type="button"
              onClick={() => asignarTamano(p.clave)}
              title={`Ver la web como en una pantalla de ${p.ancho} píxeles de ancho`}
              className={unirClases(
                'h-7 px-2.5 rounded-suave text-xs border transition-colors',
                p.clave === tamano
                  ? 'bg-tinta text-lienzo border-tinta'
                  : 'bg-papel text-grafito border-ceniza hover:border-humo',
              )}
            >
              {p.nombre}
            </button>
          ))}
          {/* Se dice a qué tamaño se está mirando y cuánto se ha encogido: sin
              esto, una maqueta al 33 % parece que la web tiene la letra pequeña. */}
          <span className="meta-tipografia text-xs text-humo px-1 whitespace-nowrap">
            {anchoElegido} px{porcentaje < 100 ? ` · ${porcentaje} %` : ''}
          </span>
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
        ref={hueco}
        className="relative flex-1 bg-lienzo overflow-auto"
        style={pantallaCompleta ? undefined : { height: '70vh' }}
      >
        {cargando && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-humo">
            Cargando la web…
          </p>
        )}
        {/*
          El hueco de fuera se queda con el tamaño ya encogido, para que no
          sobre espacio ni aparezca una barra de desplazamiento de más; el
          marco de dentro conserva su ancho de verdad y se escala.
        */}
        <div
          className="mx-auto"
          style={{
            width: Math.round(anchoDe(tamano) * escala),
            height: Math.round(altoDelMarco / escala) * escala,
          }}
        >
          <iframe
            ref={marco}
            src={direccion}
            title="Así se va a ver la web"
            className="border-0 bg-white"
            style={{
              width: anchoDe(tamano),
              height: Math.round(altoDelMarco / escala),
              transform: `scale(${escala})`,
              transformOrigin: 'top left',
            }}
            onLoad={() => {
              asignarCargando(false);
              asignarBloqueada(false);
            }}
          />
        </div>
      </div>

      <footer className="px-4 py-2 border-t border-ceniza text-xs text-humo">
        {estadoResaltado === 'nada'
          ? 'Esto no se ve en la página: es lo que leen Google y los buscadores.'
          : estadoResaltado === 'zona'
            ? 'Lo de rayas naranjas es la parte que estás cambiando. Este dato en concreto no se lee en la página.'
            : puedeMarcar
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
