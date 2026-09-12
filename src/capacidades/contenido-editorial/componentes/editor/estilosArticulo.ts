/**
 * El aspecto de la pagina de articulo, para usarlo dentro del panel.
 *
 * Lo comparten el editor —donde se escribe ya con este aspecto— y la vista del
 * post entero. Los valores estan copiados de src/estilos/tokens.css y de
 * Articulo.module.css del proyecto de la web.
 *
 * La pega de copiarlos es que si alli cambia la paleta, aqui no cambia sola. Se
 * asume a cambio de que el panel no tenga que cargar la hoja de estilos de otro
 * proyecto; y lo que importa es el parecido, no la identidad.
 */

export const ESTILOS_ARTICULO = `
.comoSeVera {
  --fondo: #030f19;
  --fondo-2: #0a1b28;
  --texto-1: #ffffff;
  --texto-2: #c9d3db;
  --texto-3: #9aa9b6;
  --texto-4: #74838f;
  --linea: rgba(126, 178, 214, 0.16);
  --marca: #5cc7f5;

  background: var(--fondo);
  color: var(--texto-2);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 16px;
  line-height: 1.7;
  overflow-y: auto;
  overflow-x: hidden;
}

.comoSeVera .hoja {
  max-width: 54rem;
  margin: 0 auto;
  padding: 36px clamp(20px, 5%, 56px) 64px;
}

.comoSeVera .tema {
  display: inline-block;
  padding: 5px 11px;
  border: 1px solid rgba(92, 199, 245, 0.35);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--marca);
  margin-bottom: 16px;
}

.comoSeVera .titulo {
  font-size: clamp(1.9rem, 3.4vw, 2.6rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--texto-1);
  margin: 0;
  text-wrap: balance;
}

.comoSeVera .titulo.vacio {
  color: var(--texto-4);
  font-style: italic;
  font-weight: 400;
}

.comoSeVera .entradilla {
  font-size: 1.15rem;
  line-height: 1.45;
  color: var(--texto-2);
  max-width: 62ch;
  margin: 16px 0 0;
}

.comoSeVera .meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
  font-size: 13px;
  color: var(--texto-3);
}

.comoSeVera .meta .autor {
  color: var(--texto-2);
  font-weight: 600;
}

.comoSeVera .portada {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid var(--linea);
  margin: 32px 0 36px;
}

/* ------------------------------------------------------------- el cuerpo */

.comoSeVera .cuerpo > * + * { margin-top: 1.15em; }

/* La medida de lectura se aplica al texto, no al contenedor: asi las fotos y
   los videos salen mas anchos que el parrafo, igual que en la web. */
.comoSeVera .cuerpo > :is(p, h1, h2, h3, h4, ul, ol, blockquote, table) {
  max-width: 74ch;
}

.comoSeVera .cuerpo :is(h1, h2, h3, h4) {
  color: var(--texto-1);
  font-weight: 700;
  line-height: 1.2;
}

.comoSeVera .cuerpo h1 { font-size: 1.8rem; margin-top: 2em; }
.comoSeVera .cuerpo h2 { font-size: 1.45rem; margin-top: 2em; }
.comoSeVera .cuerpo h3 { font-size: 1.18rem; margin-top: 1.7em; }
.comoSeVera .cuerpo h4 { font-size: 1rem; margin-top: 1.5em; }

.comoSeVera .cuerpo strong { color: var(--texto-1); font-weight: 650; }

.comoSeVera .cuerpo a {
  color: var(--marca);
  text-decoration: underline;
  text-underline-offset: 2px;
  overflow-wrap: anywhere;
}

.comoSeVera .cuerpo :is(ul, ol) { padding-left: 1.4em; }
.comoSeVera .cuerpo li + li { margin-top: 0.4em; }
.comoSeVera .cuerpo ul { list-style: disc; }
.comoSeVera .cuerpo ol { list-style: decimal; }

.comoSeVera .cuerpo blockquote {
  border-left: 2px solid var(--marca);
  padding-left: 18px;
  color: var(--texto-3);
  font-style: italic;
}

.comoSeVera .cuerpo code {
  font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.9em;
  background: rgba(126, 178, 214, 0.12);
  padding: 1px 5px;
  border-radius: 4px;
}

.comoSeVera .cuerpo pre {
  background: var(--fondo-2);
  border: 1px solid var(--linea);
  border-radius: 10px;
  padding: 16px 18px;
  overflow-x: auto;
  font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.9em;
}

.comoSeVera .cuerpo pre code { background: none; padding: 0; }

/* Misma regla que la web: tamano natural, centrada, con topes. */
.comoSeVera .cuerpo img {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 32rem;
  margin-inline: auto;
  border-radius: 12px;
  border: 1px solid var(--linea);
}

.comoSeVera .cuerpo figure { margin: 1.8em 0; }

.comoSeVera .cuerpo figcaption {
  margin-top: 8px;
  font-size: 13px;
  color: var(--texto-4);
  text-align: center;
}

.comoSeVera .cuerpo .video-incrustado {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--linea);
  background: #000;
}

.comoSeVera .cuerpo .video-incrustado :is(iframe, video) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.comoSeVera .cuerpo hr {
  border: 0;
  border-top: 1px solid var(--linea);
  margin: 2.2em 0;
}

.comoSeVera .cuerpo table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95em;
}

.comoSeVera .cuerpo :is(th, td) {
  border: 1px solid var(--linea);
  padding: 8px 12px;
  text-align: left;
}

.comoSeVera .nadaAun {
  color: var(--texto-4);
  font-style: italic;
}

/* =========================================================================
 * Solo cuando se esta escribiendo
 * ====================================================================== */

.comoSeVera .salidaEditor {
  min-height: 420px;
  outline: none;
  caret-color: var(--marca);
}

/* El texto de ayuda del principio, mientras no hay nada escrito. */
.comoSeVera .salidaEditor p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: var(--texto-4);
  font-style: italic;
}

/*
 * Un video dentro del editor.
 *
 * Mientras se escribe no se incrusta el reproductor: seria un recuadro que se
 * traga los clics y no se podria ni seleccionar ni borrar. Se deja un hueco
 * 16:9 con su rotulo, que se selecciona y se borra como cualquier otra cosa.
 */
.comoSeVera .salidaEditor img[data-video] {
  width: 100%;
  max-width: min(100%, 46rem);
  max-height: none;
  aspect-ratio: 16 / 9;
  background:
    linear-gradient(135deg, rgba(92, 199, 245, 0.10), rgba(92, 199, 245, 0.02)),
    var(--fondo-2);
  border: 1px dashed rgba(92, 199, 245, 0.45);
}

.comoSeVera .salidaEditor img[data-video]::after {
  content: attr(alt);
}

/* Lo seleccionado se ve, para saber sobre que actuan los botones. */
.comoSeVera .salidaEditor ::selection {
  background: rgba(92, 199, 245, 0.28);
}

.comoSeVera .salidaEditor .ProseMirror-selectednode {
  outline: 2px solid var(--marca);
  outline-offset: 2px;
}
`;
