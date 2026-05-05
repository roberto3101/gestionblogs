import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type DragEvent } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';
import { renderizarMarkdownLigero } from '@compartido/utilidades/renderizadorMarkdown';
import { subirArchivo } from '../../servicios/servicioSubidaArchivos';
import { useNotificaciones } from '@plataforma/gobierno/errores/contextoNotificaciones';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import type { Identificador } from '@compartido/tipos/identificador';

type Vista = 'dual' | 'escribir' | 'previsualizar';

interface PropiedadesEditorMarkdownDual {
  valor: string;
  alCambiar: (nuevo: string) => void;
  titulo?: string;
  resumen?: string;
  sitioId?: Identificador | '';
}

const claseEstiloPreview = [
  'prose-editorial text-tinta leading-relaxed',
  '[&_h1]:titulo-editorial [&_h1]:text-3xl [&_h1]:mb-4 [&_h1]:mt-2',
  '[&_h2]:titulo-editorial [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3',
  '[&_h3]:titulo-editorial [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2',
  '[&_p]:mb-3',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_li]:mb-1',
  '[&_a]:text-oliva [&_a]:underline',
  '[&_code]:bg-ceniza/40 [&_code]:px-1 [&_code]:rounded [&_code]:text-[0.9em]',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-oliva [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-grafito [&_blockquote]:my-4',
  '[&_figure]:my-4',
  '[&_figure_img]:rounded-suave [&_figure_img]:w-full',
  '[&_figcaption]:text-xs [&_figcaption]:text-humo [&_figcaption]:text-center [&_figcaption]:mt-1.5',
  '[&_.video-embed]:relative [&_.video-embed]:aspect-video [&_.video-embed]:my-4 [&_.video-embed]:bg-ceniza/30 [&_.video-embed]:rounded-suave [&_.video-embed]:overflow-hidden',
  '[&_.video-embed_iframe]:absolute [&_.video-embed_iframe]:inset-0 [&_.video-embed_iframe]:w-full [&_.video-embed_iframe]:h-full [&_.video-embed_iframe]:border-0',
  '[&_.video-embed_video]:absolute [&_.video-embed_video]:inset-0 [&_.video-embed_video]:w-full [&_.video-embed_video]:h-full',
].join(' ');

const construirMarkdownInsercion = (archivo: { url: string; tipo: string; nombre: string }, alt = ''): string => {
  if (archivo.tipo === 'VIDEO') return `@video: ${archivo.url}`;
  return `![${alt || archivo.nombre}](${archivo.url})`;
};

const eliminarBloqueEnContenido = (contenido: string, lineaABorrar: string): string => {
  const lineas = contenido.split('\n');
  const indice = lineas.findIndex((l) => l.trim() === lineaABorrar.trim());
  if (indice === -1) return contenido;
  const lineasFiltradas = [...lineas];
  lineasFiltradas.splice(indice, 1);
  if (indice > 0 && indice < lineasFiltradas.length && lineasFiltradas[indice - 1].trim() === '' && lineasFiltradas[indice].trim() === '') {
    lineasFiltradas.splice(indice, 1);
  }
  return lineasFiltradas.join('\n');
};

const extraerLineasMultimedia = (contenido: string): { tipo: 'imagen' | 'video' | 'youtube'; linea: string; resumen: string }[] => {
  const lineas = contenido.split('\n');
  const resultado: { tipo: 'imagen' | 'video' | 'youtube'; linea: string; resumen: string }[] = [];
  for (const linea of lineas) {
    const trimmed = linea.trim();
    const imagen = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imagen) {
      resultado.push({ tipo: 'imagen', linea: trimmed, resumen: imagen[1] || imagen[2].slice(0, 60) });
      continue;
    }
    if (trimmed.startsWith('@youtube:')) resultado.push({ tipo: 'youtube', linea: trimmed, resumen: trimmed.slice(9).trim().slice(0, 60) });
    else if (trimmed.startsWith('@video:')) resultado.push({ tipo: 'video', linea: trimmed, resumen: trimmed.slice(7).trim().slice(0, 60) });
  }
  return resultado;
};

export const EditorMarkdownDual = ({ valor, alCambiar, titulo, resumen, sitioId }: PropiedadesEditorMarkdownDual) => {
  const [vista, asignarVista] = useState<Vista>('dual');
  const [esArrastrando, asignarEsArrastrando] = useState(false);
  const [esSubiendo, asignarEsSubiendo] = useState(false);
  const referenciaArea = useRef<HTMLTextAreaElement | null>(null);
  const referenciaInput = useRef<HTMLInputElement | null>(null);
  const { publicar } = useNotificaciones();

  const cuentaPalabras = valor.trim() ? valor.trim().split(/\s+/).length : 0;
  const minutosLectura = Math.max(1, Math.round(cuentaPalabras / 220));

  const insertarEnPosicion = (texto: string) => {
    const area = referenciaArea.current;
    if (!area) {
      alCambiar(`${valor}${valor.endsWith('\n') ? '' : '\n'}${texto}\n`);
      return;
    }
    const inicio = area.selectionStart ?? valor.length;
    const fin = area.selectionEnd ?? valor.length;
    const necesitaSaltoAntes = inicio > 0 && valor[inicio - 1] !== '\n' ? '\n' : '';
    const necesitaSaltoDespues = valor[fin] !== '\n' ? '\n' : '';
    const insercion = `${necesitaSaltoAntes}${texto}${necesitaSaltoDespues}`;
    alCambiar(valor.slice(0, inicio) + insercion + valor.slice(fin));
    setTimeout(() => {
      area.focus();
      const nuevaPos = inicio + insercion.length;
      area.setSelectionRange(nuevaPos, nuevaPos);
    }, 0);
  };

  const subirYInsertar = async (archivos: File[]) => {
    if (archivos.length === 0) return;
    asignarEsSubiendo(true);
    try {
      for (const archivo of archivos) {
        const subido = await subirArchivo(archivo, (sitioId || undefined) as Identificador | undefined);
        insertarEnPosicion(construirMarkdownInsercion(subido));
        publicar({ tono: 'exito', titulo: `${subido.nombre} subido`, detalle: subido.url });
      }
    } catch (error) {
      const mensaje = error instanceof ErrorHttp ? error.message : 'Error al subir archivo';
      publicar({ tono: 'error', titulo: 'Subida fallida', detalle: mensaje });
    } finally {
      asignarEsSubiendo(false);
    }
  };

  const alSeleccionarArchivo = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(evento.target.files ?? []);
    if (archivos.length > 0) void subirYInsertar(archivos);
    evento.target.value = '';
  };

  const alArrastrarSobre = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    asignarEsArrastrando(true);
  };

  const alSalirArrastre = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    asignarEsArrastrando(false);
  };

  const alSoltarArchivo = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    asignarEsArrastrando(false);
    const archivos = Array.from(evento.dataTransfer.files);
    if (archivos.length > 0) void subirYInsertar(archivos);
  };

  const alPegarPortapapeles = (evento: ClipboardEvent<HTMLTextAreaElement>) => {
    const archivos: File[] = [];
    for (const item of Array.from(evento.clipboardData.items)) {
      if (item.kind === 'file') {
        const archivo = item.getAsFile();
        if (archivo) archivos.push(archivo);
      }
    }
    if (archivos.length > 0) {
      evento.preventDefault();
      void subirYInsertar(archivos);
    }
  };

  const insertarYoutube = () => {
    const url = window.prompt('URL de YouTube:');
    if (!url) return;
    insertarEnPosicion(`@youtube: ${url}`);
  };

  const eliminarBloque = (linea: string) => {
    if (!window.confirm('¿Eliminar este bloque de contenido?')) return;
    alCambiar(eliminarBloqueEnContenido(valor, linea));
  };

  const bloquesMultimedia = extraerLineasMultimedia(valor);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        referenciaInput.current?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="lamina overflow-hidden">
      <input
        ref={referenciaInput}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,application/pdf"
        className="hidden"
        onChange={alSeleccionarArchivo}
      />

      <div className="filete-bajo flex flex-wrap items-center gap-2 justify-between px-3 py-2 bg-papel">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => referenciaInput.current?.click()}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-suave bg-tinta text-lienzo hover:bg-grafito transicion-natural font-medium"
            title="Subir desde tu PC (Ctrl+U)"
          >
            <span>↑</span> Subir archivo
          </button>
          <button
            type="button"
            onClick={insertarYoutube}
            className="h-8 px-3 text-xs rounded-suave border border-ceniza text-grafito hover:bg-ceniza/40 hover:text-tinta transicion-natural"
            title="Insertar video de YouTube por URL"
          >
            YouTube
          </button>
          <span className="w-px bg-ceniza self-stretch mx-1" />
          <button type="button" onClick={() => insertarEnPosicion('## Subtitulo')} className="h-8 px-2.5 text-xs rounded-suave border border-ceniza text-grafito hover:bg-ceniza/40 hover:text-tinta transicion-natural" title="Subtítulo">H2</button>
          <button type="button" onClick={() => insertarEnPosicion('**texto**')} className="h-8 px-2.5 text-xs font-bold rounded-suave border border-ceniza text-grafito hover:bg-ceniza/40 hover:text-tinta transicion-natural" title="Negrita">B</button>
          <button type="button" onClick={() => insertarEnPosicion('*texto*')} className="h-8 px-2.5 text-xs italic rounded-suave border border-ceniza text-grafito hover:bg-ceniza/40 hover:text-tinta transicion-natural" title="Cursiva">I</button>
          <button type="button" onClick={() => insertarEnPosicion('> cita destacada')} className="h-8 px-2.5 text-xs rounded-suave border border-ceniza text-grafito hover:bg-ceniza/40 hover:text-tinta transicion-natural" title="Cita">"</button>
          <button type="button" onClick={() => insertarEnPosicion('- punto uno\n- punto dos')} className="h-8 px-2.5 text-xs rounded-suave border border-ceniza text-grafito hover:bg-ceniza/40 hover:text-tinta transicion-natural" title="Lista">• Lista</button>
        </div>
        {esSubiendo && (
          <span className="meta-tipografia text-oliva flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-oliva animate-pulse" /> Subiendo…
          </span>
        )}
      </div>

      {bloquesMultimedia.length > 0 && (
        <div className="filete-bajo bg-lienzo/60 px-3 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="meta-tipografia text-humo">Multimedia ({bloquesMultimedia.length}):</span>
            {bloquesMultimedia.map((bloque, idx) => (
              <span
                key={`${bloque.linea}-${idx}`}
                className="inline-flex items-center gap-1.5 bg-papel border border-ceniza rounded-suave pl-2 pr-1 h-7 text-xs"
                title={bloque.linea}
              >
                <span className="text-humo">
                  {bloque.tipo === 'imagen' ? '◰' : bloque.tipo === 'youtube' ? '▶' : '⏵'}
                </span>
                <span className="text-grafito truncate max-w-[180px]">{bloque.resumen}</span>
                <button
                  type="button"
                  onClick={() => eliminarBloque(bloque.linea)}
                  aria-label="Eliminar bloque"
                  className="h-5 w-5 grid place-items-center rounded-full text-humo hover:text-cinabrio hover:bg-cinabrio/10 transicion-natural"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="filete-bajo flex items-center justify-between px-4 h-10 bg-papel">
        <div className="flex gap-1">
          {([
            { clave: 'escribir', etiqueta: 'Escribir' },
            { clave: 'dual', etiqueta: 'Lado a lado' },
            { clave: 'previsualizar', etiqueta: 'Previsualizar' },
          ] as { clave: Vista; etiqueta: string }[]).map((opcion) => (
            <button
              key={opcion.clave}
              type="button"
              onClick={() => asignarVista(opcion.clave)}
              className={unirClases(
                'h-7 px-3 text-xs rounded-suave transicion-natural',
                vista === opcion.clave ? 'bg-tinta text-lienzo' : 'text-grafito hover:bg-ceniza/40',
              )}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 meta-tipografia text-xs">
          <span>{cuentaPalabras} palabras</span>
          <span className="text-ceniza">·</span>
          <span>{minutosLectura} min lectura</span>
        </div>
      </div>

      <div
        onDragOver={alArrastrarSobre}
        onDragLeave={alSalirArrastre}
        onDrop={alSoltarArchivo}
        className={unirClases(
          'min-h-[480px] relative',
          vista === 'dual' ? 'grid grid-cols-2 divide-x filete-tenue' : 'block',
          esArrastrando && 'ring-2 ring-oliva ring-inset',
        )}
      >
        {esArrastrando && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-oliva-suave/80 pointer-events-none">
            <div className="text-center">
              <p className="titulo-editorial text-2xl text-tinta">Suelta los archivos aquí</p>
              <p className="meta-tipografia mt-2">Imágenes, videos, audio o PDFs</p>
            </div>
          </div>
        )}
        {(vista === 'escribir' || vista === 'dual') && (
          <textarea
            ref={referenciaArea}
            value={valor}
            onChange={(evento) => alCambiar(evento.target.value)}
            onPaste={alPegarPortapapeles}
            spellCheck={false}
            className="w-full bg-papel outline-none text-[15px] leading-7 text-tinta px-6 py-5 min-h-[480px] font-codigo resize-none"
            placeholder={`# Tu título\n\nEscribe aquí. Soporta **negrita**, *cursiva* y [enlaces](https://).\n\n## Subtítulo\n\nArrastra imágenes o videos sobre este editor para subirlos automáticamente.\nTambién puedes pegar imágenes desde el portapapeles (Ctrl+V).\n\nO usa el botón "Subir archivo" arriba (Ctrl+U).`}
          />
        )}
        {(vista === 'previsualizar' || vista === 'dual') && (
          <div className="px-6 py-5 overflow-y-auto bg-lienzo/40 min-h-[480px]">
            {titulo && (
              <header className="mb-6 pb-4 filete-bajo">
                <h1 className="titulo-editorial text-3xl text-tinta">{titulo}</h1>
                {resumen && <p className="text-grafito text-base mt-2">{resumen}</p>}
              </header>
            )}
            {valor.trim() ? (
              <div
                className={claseEstiloPreview}
                dangerouslySetInnerHTML={{ __html: renderizarMarkdownLigero(valor) }}
              />
            ) : (
              <p className="text-humo italic text-sm">La previsualización aparece aquí mientras escribes.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
