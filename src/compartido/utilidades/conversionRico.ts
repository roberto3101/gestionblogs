/**
 * Puente entre el editor y lo que se guarda.
 *
 * El post se guarda en markdown, como siempre: es lo que la web ya sabe
 * pintar y lo que hace que la vista previa diga la verdad. Pero quien escribe
 * no ve markdown en ningun momento —ni un asterisco ni una almohadilla—,
 * porque el editor trabaja con texto ya formateado.
 *
 * Aqui se traduce en los dos sentidos:
 *
 *   markdown guardado  ->  HTML para el editor      (al abrir)
 *   HTML del editor    ->  markdown para guardar    (al escribir)
 *
 * Los videos son el caso especial. En markdown viven como una linea suelta
 * `@youtube: <url>`, que no es markdown de verdad; dentro del editor tienen
 * que ser un bloque que se pueda ver y borrar. Se convierten a una imagen con
 * una marca propia y se vuelven a plegar al guardar.
 */

import TurndownService from 'turndown';
import { renderizarMarkdownPost } from './renderizadorMarkdown';

/** Marca que llevan los bloques de video mientras estan en el editor. */
const ATRIBUTO_VIDEO = 'data-video';

const conversor = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
});

/**
 * Un bloque de video vuelve a su linea `@youtube:` o `@video:`.
 *
 * Turndown convierte por defecto una imagen en `![alt](src)`, que para estos
 * bloques seria una imagen rota. La regla se registra antes de las suyas.
 */
conversor.addRule('videoIncrustado', {
  filter: (nodo) => nodo.nodeName === 'IMG' && nodo.hasAttribute(ATRIBUTO_VIDEO),
  replacement: (_contenido, nodo) => {
    const linea = (nodo as HTMLElement).getAttribute(ATRIBUTO_VIDEO) ?? '';
    return linea ? `\n\n${linea}\n\n` : '';
  },
});

/**
 * Los saltos de linea sueltos se guardan como un salto de verdad.
 *
 * Turndown escribe `<br>` como dos espacios y un salto, que es la forma
 * clasica del markdown. Aqui basta el salto: la web y el panel leen el
 * markdown con la opcion de cortar linea en cada salto.
 */
conversor.addRule('saltoSimple', {
  filter: 'br',
  replacement: () => '\n',
});

/** Lo que se guarda en el post, a partir de lo que hay en el editor. */
export const htmlAMarkdown = (html: string): string => {
  if (!html || html === '<p></p>') return '';
  return conversor
    .turndown(html)
    // Turndown deja hasta tres saltos entre bloques; con dos basta y el
    // markdown queda legible si alguien lo mira por debajo.
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Lo que ve el editor, a partir de lo guardado.
 *
 * Se reutiliza el mismo renderizador que la vista previa y que la web, asi que
 * abrir un post no puede ensenar algo distinto de lo que se publica. Los
 * `<figure class="video-incrustado">` que genera ese renderizador se cambian
 * por la imagen con marca, que es lo que el editor sabe manejar.
 */
export const markdownAHtml = (markdown: string): string => {
  const html = renderizarMarkdownPost(markdown);
  if (!html) return '';
  return plegarVideosAImagen(html, markdown);
};

/**
 * Cambia cada `<figure class="video-incrustado">` por una imagen marcada.
 *
 * La marca guarda la linea original (`@youtube: ...`) para poder devolverla
 * intacta al guardar, sin tener que reconstruirla desde la URL del iframe.
 */
const plegarVideosAImagen = (html: string, markdown: string): string => {
  const lineasDeVideo = markdown
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^@(youtube|vimeo|video):/.test(l));
  if (lineasDeVideo.length === 0) return html;

  let indice = 0;
  return html.replace(/<figure class="video-incrustado">[\s\S]*?<\/figure>/g, () => {
    const linea = lineasDeVideo[indice++] ?? '';
    const etiqueta = linea.startsWith('@youtube:')
      ? 'Vídeo de YouTube'
      : linea.startsWith('@vimeo:')
        ? 'Vídeo de Vimeo'
        : 'Vídeo';
    // Una imagen 16:9 transparente hace de hueco: el editor la trata como un
    // bloque normal, se puede seleccionar y borrar, y el CSS le pinta encima
    // el rotulo y el fondo.
    return (
      `<img ${ATRIBUTO_VIDEO}="${escaparAtributo(linea)}" ` +
      `alt="${escaparAtributo(etiqueta)}" ` +
      `src="data:image/svg+xml;utf8,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"></svg>',
      )}">`
    );
  });
};

const escaparAtributo = (texto: string): string =>
  texto.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Marca que el editor usa para reconocer sus bloques de video. */
export const atributoVideo = ATRIBUTO_VIDEO;
