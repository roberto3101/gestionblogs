const escaparHtml = (texto: string): string =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const aplicarInline = (linea: string): string =>
  escaparHtml(linea)
    .replace(/`([^`]+)`/g, '<code class="bg-ceniza/40 px-1 rounded text-[0.85em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-oliva underline">$1</a>');

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
    if (/^### (.+)/.test(linea)) {
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
