import { useState } from 'react';
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
].join(' ');

export const EditorMarkdownDual = ({ valor, alCambiar, titulo, resumen }: PropiedadesEditorMarkdownDual) => {
  const [vista, asignarVista] = useState<Vista>('dual');
  const cuentaPalabras = valor.trim() ? valor.trim().split(/\s+/).length : 0;
  const minutosLectura = Math.max(1, Math.round(cuentaPalabras / 220));

  return (
    <div className="lamina overflow-hidden">
      <div className="filete-bajo flex items-center justify-between px-4 h-11 bg-papel">
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
            value={valor}
            onChange={(evento) => alCambiar(evento.target.value)}
            spellCheck={false}
            className="w-full bg-papel outline-none text-[15px] leading-7 text-tinta px-6 py-5 min-h-[480px] font-codigo resize-none"
            placeholder={`# Tu titulo\n\nEmpieza a escribir aqui. Soporta **negrita**, *cursiva*, [enlaces](https://) y listas:\n\n- Idea uno\n- Idea dos\n\n## Subtitulo\n\nMas contenido.`}
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
