import { useRef, useState } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';
import { renderizarMarkdownLigero } from '@compartido/utilidades/renderizadorMarkdown';

type Vista = 'dual' | 'escribir' | 'previsualizar';

interface PropiedadesEditorMarkdownDual {
  valor: string;
  alCambiar: (nuevo: string) => void;
  titulo?: string;
  resumen?: string;
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

export const EditorMarkdownDual = ({ valor, alCambiar, titulo, resumen }: PropiedadesEditorMarkdownDual) => {
  const [vista, asignarVista] = useState<Vista>('dual');
  const referenciaArea = useRef<HTMLTextAreaElement | null>(null);
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

  const insertarImagen = () => {
    const url = window.prompt('URL pública de la imagen:');
    if (!url) return;
    const alt = window.prompt('Texto descriptivo (alt) o caption:') ?? '';
    insertarEnPosicion(`![${alt}](${url})`);
  };

  const insertarVideoYoutube = () => {
    const url = window.prompt('URL de YouTube (ej: https://youtube.com/watch?v=...):');
    if (!url) return;
    insertarEnPosicion(`@youtube: ${url}`);
  };

  const insertarVideoVimeo = () => {
    const url = window.prompt('URL de Vimeo:');
    if (!url) return;
    insertarEnPosicion(`@vimeo: ${url}`);
  };

  const insertarVideoArchivo = () => {
    const url = window.prompt('URL pública del video (.mp4, .webm):');
    if (!url) return;
    insertarEnPosicion(`@video: ${url}`);
  };

  const insertarBloque = (sufijo: string) => insertarEnPosicion(sufijo);

  const acciones = [
    { etiqueta: 'H2', accion: () => insertarBloque('## Subtitulo'), titulo: 'Insertar subtítulo (H2)' },
    { etiqueta: 'B', accion: () => insertarEnPosicion('**texto**'), titulo: 'Negrita', estilo: 'font-bold' },
    { etiqueta: 'I', accion: () => insertarEnPosicion('*texto*'), titulo: 'Cursiva', estilo: 'italic' },
    { etiqueta: '“ ”', accion: () => insertarBloque('> cita destacada'), titulo: 'Bloque de cita' },
    { etiqueta: '• Lista', accion: () => insertarBloque('- punto uno\n- punto dos'), titulo: 'Lista' },
    { etiqueta: 'Imagen', accion: insertarImagen, titulo: 'Insertar imagen', destacar: true },
    { etiqueta: 'YouTube', accion: insertarVideoYoutube, titulo: 'Insertar video de YouTube', destacar: true },
    { etiqueta: 'Vimeo', accion: insertarVideoVimeo, titulo: 'Insertar video de Vimeo' },
    { etiqueta: 'Video', accion: insertarVideoArchivo, titulo: 'Insertar video por URL directa' },
  ];

  return (
    <div className="lamina overflow-hidden">
      <div className="filete-bajo flex flex-wrap items-center gap-2 justify-between px-3 py-2 bg-papel">
        <div className="flex flex-wrap gap-1">
          {acciones.map((accion) => (
            <button
              key={accion.etiqueta}
              type="button"
              onClick={accion.accion}
              title={accion.titulo}
              className={unirClases(
                'h-7 px-2.5 text-xs rounded-suave border transicion-natural',
                accion.destacar
                  ? 'border-oliva text-oliva hover:bg-oliva-suave'
                  : 'border-ceniza text-grafito hover:bg-ceniza/40 hover:text-tinta',
                accion.estilo,
              )}
            >
              {accion.etiqueta}
            </button>
          ))}
        </div>
      </div>
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
        className={unirClases(
          'min-h-[480px]',
          vista === 'dual' ? 'grid grid-cols-2 divide-x filete-tenue' : 'block',
        )}
      >
        {(vista === 'escribir' || vista === 'dual') && (
          <textarea
            ref={referenciaArea}
            value={valor}
            onChange={(evento) => alCambiar(evento.target.value)}
            spellCheck={false}
            className="w-full bg-papel outline-none text-[15px] leading-7 text-tinta px-6 py-5 min-h-[480px] font-codigo resize-none"
            placeholder={`# Tu titulo\n\nEmpieza a escribir aqui.\n\n## Subtitulo\n\nSoporta **negrita**, *cursiva*, [enlaces](https://) y listas:\n\n- Idea uno\n- Idea dos\n\n![Pie de foto](https://url-de-la-imagen.jpg)\n\n@youtube: https://youtube.com/watch?v=...`}
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
