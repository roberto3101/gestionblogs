const escaparHtml = (texto: string): string =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const construirEmbedYoutube = (urlVideo: string): string | null => {
  const coincide = urlVideo.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (!coincide) return null;
  return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${coincide[1]}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
};

const construirEmbedVimeo = (urlVideo: string): string | null => {
  const coincide = urlVideo.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (!coincide) return null;
  return `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${coincide[1]}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
};

const aplicarInline = (linea: string): string =>
  escaparHtml(linea)
    .replace(/`([^`]+)`/g, '<code class="bg-ceniza/40 px-1 rounded text-[0.85em]">$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" class="rounded-suave my-2 max-w-full" />')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-oliva underline">$1</a>');

const esLineaImagen = (linea: string): boolean => /^!\[[^\]]*\]\([^)]+\)$/.test(linea.trim());
const esLineaVideo = (linea: string): boolean => /^@(youtube|vimeo|video):/.test(linea.trim());

const renderizarLineaImagen = (linea: string): string => {
  const coincide = linea.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!coincide) return '';
  const caption = coincide[1] ? `<figcaption>${escaparHtml(coincide[1])}</figcaption>` : '';
  return `<figure><img src="${coincide[2]}" alt="${escaparHtml(coincide[1])}" loading="lazy" />${caption}</figure>`;
};

const renderizarLineaVideo = (linea: string): string => {
  const limpia = linea.trim();
  if (limpia.startsWith('@youtube:')) {
    const url = limpia.slice('@youtube:'.length).trim();
    return construirEmbedYoutube(url) ?? `<p><a href="${escaparHtml(url)}" target="_blank" rel="noopener">${escaparHtml(url)}</a></p>`;
  }
  if (limpia.startsWith('@vimeo:')) {
    const url = limpia.slice('@vimeo:'.length).trim();
    return construirEmbedVimeo(url) ?? `<p><a href="${escaparHtml(url)}" target="_blank" rel="noopener">${escaparHtml(url)}</a></p>`;
  }
  if (limpia.startsWith('@video:')) {
    const url = limpia.slice('@video:'.length).trim();
    return `<div class="video-embed"><video controls preload="metadata"><source src="${escaparHtml(url)}" /></video></div>`;
  }
  return '';
};

export const renderizarMarkdownLigero = (markdown: string): string => {
  if (!markdown) return '';
  const lineas = markdown.split('\n');
  const bloques: string[] = [];
  let parrafoBuffer: string[] = [];
  let listaBuffer: string[] = [];

  const cerrarParrafo = () => {
    if (parrafoBuffer.length > 0) {
      bloques.push(`<p>${parrafoBuffer.map(aplicarInline).join(' ')}</p>`);
      parrafoBuffer = [];
    }
  };
  const cerrarLista = () => {
    if (listaBuffer.length > 0) {
      bloques.push(`<ul>${listaBuffer.map((item) => `<li>${aplicarInline(item)}</li>`).join('')}</ul>`);
      listaBuffer = [];
    }
  };

  for (const linea of lineas) {
    if (esLineaImagen(linea)) {
      cerrarParrafo();
      cerrarLista();
      bloques.push(renderizarLineaImagen(linea));
    } else if (esLineaVideo(linea)) {
      cerrarParrafo();
      cerrarLista();
      bloques.push(renderizarLineaVideo(linea));
    } else if (/^### (.+)/.test(linea)) {
      cerrarParrafo();
      cerrarLista();
      bloques.push(`<h3>${aplicarInline(linea.replace(/^### /, ''))}</h3>`);
    } else if (/^## (.+)/.test(linea)) {
      cerrarParrafo();
      cerrarLista();
      bloques.push(`<h2>${aplicarInline(linea.replace(/^## /, ''))}</h2>`);
    } else if (/^# (.+)/.test(linea)) {
      cerrarParrafo();
      cerrarLista();
      bloques.push(`<h1>${aplicarInline(linea.replace(/^# /, ''))}</h1>`);
    } else if (/^> (.+)/.test(linea)) {
      cerrarParrafo();
      cerrarLista();
      bloques.push(`<blockquote>${aplicarInline(linea.replace(/^> /, ''))}</blockquote>`);
    } else if (/^[-*] (.+)/.test(linea)) {
      cerrarParrafo();
      listaBuffer.push(linea.replace(/^[-*] /, ''));
    } else if (linea.trim() === '') {
      cerrarParrafo();
      cerrarLista();
    } else {
      cerrarLista();
      parrafoBuffer.push(linea);
    }
  }
  cerrarParrafo();
  cerrarLista();

  return bloques.join('\n');
};
