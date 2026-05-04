import { useState } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';
import { renderizarMarkdownLigero } from '@compartido/utilidades/renderizadorMarkdown';

interface PropiedadesEditorMarkdown {
  valor: string;
  alCambiar: (nuevo: string) => void;
}

type Pestana = 'escribir' | 'previsualizar';

export const EditorMarkdown = ({ valor, alCambiar }: PropiedadesEditorMarkdown) => {
  const [pestana, asignarPestana] = useState<Pestana>('escribir');

  return (
    <div className="lamina overflow-hidden">
      <div className="filete-bajo flex items-center justify-between px-4 h-11">
        <div className="flex gap-1">
          {(['escribir', 'previsualizar'] as Pestana[]).map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => asignarPestana(opcion)}
              className={unirClases(
                'h-7 px-3 text-xs rounded-suave transicion-natural',
                pestana === opcion
                  ? 'bg-tinta text-lienzo'
                  : 'text-grafito hover:bg-ceniza/40',
              )}
            >
              {opcion === 'escribir' ? 'Escribir' : 'Previsualizar'}
            </button>
          ))}
        </div>
        <span className="meta-tipografia">Markdown · {valor.length} chars</span>
      </div>
      {pestana === 'escribir' ? (
        <textarea
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          spellCheck={false}
          className="w-full bg-papel outline-none text-[15px] leading-7 text-tinta px-6 py-5 min-h-[400px] font-codigo resize-y"
          placeholder={`# Tu titulo\n\nEmpieza a escribir aqui. Soporta **negrita**, *cursiva*, [enlaces](https://) y listas:\n\n- Idea uno\n- Idea dos\n\n## Subtitulo`}
        />
      ) : (
        <div
          className="prose-editorial px-6 py-5 min-h-[400px] text-tinta leading-relaxed [&_h1]:titulo-editorial [&_h1]:text-3xl [&_h1]:mb-4 [&_h2]:titulo-editorial [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:titulo-editorial [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: renderizarMarkdownLigero(valor) }}
        />
      )}
    </div>
  );
};
