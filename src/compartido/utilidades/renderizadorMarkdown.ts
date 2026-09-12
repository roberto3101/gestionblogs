/**
 * Convierte el markdown de un post a HTML, igual que lo hace la web.
 *
 * Antes habia aqui un renderizador propio escrito a mano. Se parecia al
 * markdown de verdad, pero no era el mismo: la vista previa del panel
 * ensenaba cosas que la web luego no pintaba. El caso mas claro era el
 * encabezado sin espacio, `#titulo`, que aqui salia como titulo y en la web
 * salia como texto; y los videos, que aqui se veian y alli no.
 *
 * Ahora se usa un motor de markdown de verdad con las mismas opciones que la
 * web (GFM), y las lineas de video se traducen con las mismas reglas. Lo que
 * se ve en el panel es lo que se publica.
 */

import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  // Un Enter corta la linea, igual que en la web (remark-breaks alli).
  // Sin esto, tres lineas sueltas se publicaban como un parrafo corrido.
  breaks: true,
});

/** Saca el identificador de un video de YouTube de las formas habituales. */
const idDeYoutube = (url: string): string | null => {
  const limpia = url.trim();
  const patrones = [
    /(?:^|\.)youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const patron of patrones) {
    const encontrado = limpia.match(patron);
    if (encontrado) return encontrado[1];
  }
  return null;
};

/**
 * Traduce las lineas de video antes de pasar por el markdown.
 *
 * Estas tres reglas son las mismas, caracter por caracter, que las de
 * `src/nucleo/articulos.ts` en el proyecto de la web. Si cambia una, cambia la
 * otra: en cuanto se separen, la vista previa vuelve a mentir.
 */
const incrustarVideos = (markdown: string): string =>
  markdown
    .split('\n')
    .map((linea) => {
      const limpia = linea.trim();

      if (limpia.startsWith('@youtube:')) {
        const id = idDeYoutube(limpia.slice('@youtube:'.length));
        // Solo un identificador de 11 caracteres del alfabeto de YouTube:
        // asi lo que acaba en el `src` nunca es texto libre.
        if (!id) return linea;
        return `\n<figure class="video-incrustado"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Video" loading="lazy" allowfullscreen></iframe></figure>\n`;
      }

      if (limpia.startsWith('@vimeo:')) {
        const id = limpia.slice('@vimeo:'.length).trim().match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (!id) return linea;
        return `\n<figure class="video-incrustado"><iframe src="https://player.vimeo.com/video/${id[1]}" title="Video" loading="lazy" allowfullscreen></iframe></figure>\n`;
      }

      if (limpia.startsWith('@video:')) {
        const url = limpia.slice('@video:'.length).trim();
        if (!/^https?:\/\//i.test(url) || /["'<>\s]/.test(url)) return linea;
        return `\n<figure class="video-incrustado"><video src="${url}" controls preload="metadata"></video></figure>\n`;
      }

      return linea;
    })
    .join('\n');

/**
 * Markdown de un post a HTML.
 *
 * El resultado se inyecta en la vista previa del panel, que solo ve su autor
 * mientras escribe. La web hace lo mismo con el contenido ya publicado.
 */
export const renderizarMarkdownPost = (markdown: string): string => {
  if (!markdown.trim()) return '';
  return marked.parse(incrustarVideos(markdown), { async: false }) as string;
};

/** Nombre anterior, mantenido para no romper lo que ya lo importaba. */
export const renderizarMarkdownLigero = renderizarMarkdownPost;
