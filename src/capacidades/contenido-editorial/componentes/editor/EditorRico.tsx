/**
 * Editor del cuerpo de un post.
 *
 * Antes era una caja de texto con markdown: para poner un titular habia que
 * escribir `## `, para negrita `**palabra**`, y el resultado solo se veia en un
 * recuadro de al lado. Quien no conoce esa sintaxis dejaba asteriscos sueltos
 * o almohadillas sin espacio, y el post salia mal sin entender por que.
 *
 * Aqui no hay ningun simbolo a la vista. Se escribe y se ve el resultado, con
 * la tipografia, los colores y el ancho de la pagina de articulo de verdad; el
 * formato se pone con botones, sobre lo que este seleccionado.
 *
 * Por debajo se sigue guardando markdown, que es lo que la web pinta. La
 * traduccion en los dos sentidos vive en conversionRico.ts.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { unirClases } from '@compartido/utilidades/unirClases';
import { atributoVideo, htmlAMarkdown, markdownAHtml } from '@compartido/utilidades/conversionRico';
import { subirArchivo } from '../../servicios/servicioSubidaArchivos';
import { useNotificaciones } from '@plataforma/gobierno/errores/contextoNotificaciones';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import type { Identificador } from '@compartido/tipos/identificador';
import { ESTILOS_ARTICULO } from './estilosArticulo';

interface PropiedadesEditorRico {
  /** Markdown guardado. */
  valor: string;
  alCambiar: (nuevo: string) => void;
  sitioId?: Identificador | '';
  /** Se llama al pulsar «Ver el post entero». */
  alPedirPantallaCompleta?: () => void;
}

/** Imagen que además admite la marca de los bloques de vídeo. */
const ImagenConVideo = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      [atributoVideo]: {
        default: null,
        parseHTML: (elemento) => elemento.getAttribute(atributoVideo),
        renderHTML: (atributos) => {
          const valor = atributos[atributoVideo];
          return valor ? { [atributoVideo]: valor as string } : {};
        },
      },
    };
  },
});

/** Hueco 16:9 transparente que hace de bloque de video en el editor. */
const FONDO_VIDEO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"></svg>');

/**
 * Atributos de la imagen que representa un video.
 *
 * `setImage` esta tipado para src/alt/title, asi que el atributo propio se
 * cuela con un casteo. La extension de arriba es la que lo declara y lo sabe
 * escribir de vuelta al HTML.
 */
const atributosDeVideo = (linea: string, etiqueta: string) =>
  ({ src: FONDO_VIDEO, alt: etiqueta, [atributoVideo]: linea }) as unknown as {
    src: string;
    alt: string;
  };

export const EditorRico = ({
  valor,
  alCambiar,
  sitioId,
  alPedirPantallaCompleta,
}: PropiedadesEditorRico) => {
  const { publicar } = useNotificaciones();
  const archivoRef = useRef<HTMLInputElement | null>(null);
  const [subiendo, asignarSubiendo] = useState(false);
  const [arrastrando, asignarArrastrando] = useState(false);
  const [pidiendo, asignarPidiendo] = useState<'enlace' | 'youtube' | null>(null);
  const [direccion, asignarDireccion] = useState('');

  /**
   * Ultimo markdown que salio de aqui.
   *
   * Sirve para no reescribir el contenido del editor con lo que uno mismo
   * acaba de emitir: hacerlo moveria el cursor al principio en cada tecla.
   */
  const ultimoEmitido = useRef<string>(valor);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Se dejan fuera las cosas que no tienen sitio en un post del blog y
        // que solo servirian para liarla.
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        code: false,
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      ImagenConVideo.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({
        placeholder:
          'Escribe el post aquí. Para un titular o poner algo en negrita, selecciona el texto y usa los botones de arriba.',
      }),
    ],
    content: markdownAHtml(valor),
    editorProps: {
      attributes: {
        class: 'cuerpo salidaEditor',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor: activo }) => {
      const md = htmlAMarkdown(activo.getHTML());
      ultimoEmitido.current = md;
      alCambiar(md);
    },
  });

  // Si el valor cambia por fuera (se restaura un borrador, se carga otro post),
  // se vuelca en el editor. Si es lo que acabamos de emitir, no se toca.
  useEffect(() => {
    if (!editor) return;
    if (valor === ultimoEmitido.current) return;
    ultimoEmitido.current = valor;
    editor.commands.setContent(markdownAHtml(valor), { emitUpdate: false });
  }, [valor, editor]);

  const subir = useCallback(
    async (archivos: File[]) => {
      if (!editor || archivos.length === 0) return;
      asignarSubiendo(true);
      try {
        for (const archivo of archivos) {
          const subido = await subirArchivo(archivo, (sitioId || undefined) as Identificador | undefined);
          if (subido.tipo === 'VIDEO') {
            editor
              .chain()
              .focus()
              .setImage(atributosDeVideo(`@video: ${subido.url}`, 'Vídeo'))
              .run();
          } else {
            editor.chain().focus().setImage({ src: subido.url, alt: subido.nombre }).run();
          }
          publicar({ tono: 'exito', titulo: `${subido.nombre} listo`, detalle: 'Ya está en el post' });
        }
      } catch (error) {
        const mensaje = error instanceof ErrorHttp ? error.message : 'No se pudo subir';
        publicar({ tono: 'error', titulo: 'La subida falló', detalle: mensaje });
      } finally {
        asignarSubiendo(false);
      }
    },
    [editor, sitioId, publicar],
  );

  // Pegar y arrastrar archivos sube y coloca, sin pasar por ningún menú.
  useEffect(() => {
    if (!editor) return;
    const raiz = editor.view.dom;
    const alPegar = (evento: ClipboardEvent) => {
      const archivos = Array.from(evento.clipboardData?.items ?? [])
        .filter((i) => i.kind === 'file')
        .map((i) => i.getAsFile())
        .filter((f): f is File => f !== null);
      if (archivos.length > 0) {
        evento.preventDefault();
        void subir(archivos);
      }
    };
    raiz.addEventListener('paste', alPegar);
    return () => raiz.removeEventListener('paste', alPegar);
  }, [editor, subir]);

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        archivoRef.current?.click();
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, []);

  const confirmarDireccion = () => {
    if (!editor) return;
    const url = direccion.trim();
    if (!url) return;
    if (pidiendo === 'enlace') {
      const conEsquema = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: conEsquema }).run();
    } else if (pidiendo === 'youtube') {
      editor
        .chain()
        .focus()
        .setImage(atributosDeVideo(`@youtube: ${url}`, 'Vídeo de YouTube'))
        .run();
    }
    asignarDireccion('');
    asignarPidiendo(null);
  };

  if (!editor) return null;

  const Boton = ({
    activo,
    alPulsar,
    titulo,
    children,
    deshabilitado,
  }: {
    activo?: boolean;
    alPulsar: () => void;
    titulo: string;
    children: React.ReactNode;
    deshabilitado?: boolean;
  }) => (
    <button
      type="button"
      title={titulo}
      aria-pressed={activo}
      disabled={deshabilitado}
      onClick={alPulsar}
      className={unirClases(
        'h-8 rounded-suave border px-2.5 text-xs transicion-natural disabled:opacity-40',
        activo
          ? 'border-tinta bg-tinta text-lienzo'
          : 'border-ceniza text-grafito hover:bg-ceniza/40 hover:text-tinta',
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-suave border border-ceniza bg-papel">
      <style>{ESTILOS_ARTICULO}</style>

      <input
        ref={archivoRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const archivos = Array.from(e.target.files ?? []);
          if (archivos.length > 0) void subir(archivos);
          e.target.value = '';
        }}
      />

      {/* ---------------------------------------------------- herramientas */}
      <div className="filete-bajo flex flex-wrap items-center gap-1.5 px-3 py-2">
        <button
          type="button"
          onClick={() => archivoRef.current?.click()}
          className="inline-flex h-8 items-center gap-1.5 rounded-suave bg-tinta px-3 text-xs font-medium text-lienzo transicion-natural hover:bg-grafito"
          title="Subir una foto o un vídeo de tu ordenador (Ctrl+U)"
        >
          ↑ Foto o vídeo
        </button>
        <Boton
          alPulsar={() => {
            asignarPidiendo('youtube');
            asignarDireccion('');
          }}
          titulo="Pegar la dirección de un vídeo de YouTube"
        >
          YouTube
        </Boton>

        <span className="mx-1 h-6 w-px self-center bg-ceniza" />

        <Boton
          activo={editor.isActive('heading', { level: 2 })}
          alPulsar={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          titulo="Convertir en titular de sección"
        >
          Titular
        </Boton>
        <Boton
          activo={editor.isActive('heading', { level: 3 })}
          alPulsar={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          titulo="Convertir en subtítulo"
        >
          Subtítulo
        </Boton>
        <Boton
          activo={editor.isActive('bold')}
          alPulsar={() => editor.chain().focus().toggleBold().run()}
          titulo="Negrita (Ctrl+B)"
        >
          <strong>Negrita</strong>
        </Boton>
        <Boton
          activo={editor.isActive('italic')}
          alPulsar={() => editor.chain().focus().toggleItalic().run()}
          titulo="Cursiva (Ctrl+I)"
        >
          <em>Cursiva</em>
        </Boton>
        <Boton
          activo={editor.isActive('bulletList')}
          alPulsar={() => editor.chain().focus().toggleBulletList().run()}
          titulo="Lista de puntos"
        >
          Lista
        </Boton>
        <Boton
          activo={editor.isActive('orderedList')}
          alPulsar={() => editor.chain().focus().toggleOrderedList().run()}
          titulo="Lista numerada"
        >
          1. 2. 3.
        </Boton>
        <Boton
          activo={editor.isActive('blockquote')}
          alPulsar={() => editor.chain().focus().toggleBlockquote().run()}
          titulo="Destacar una frase"
        >
          Cita
        </Boton>
        <Boton
          activo={editor.isActive('link')}
          alPulsar={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            asignarPidiendo('enlace');
            asignarDireccion('');
          }}
          titulo={editor.isActive('link') ? 'Quitar el enlace' : 'Convertir en enlace'}
        >
          Enlace
        </Boton>

        <span className="mx-1 h-6 w-px self-center bg-ceniza" />

        <Boton
          alPulsar={() => editor.chain().focus().undo().run()}
          titulo="Deshacer (Ctrl+Z)"
          deshabilitado={!editor.can().undo()}
        >
          ↶
        </Boton>
        <Boton
          alPulsar={() => editor.chain().focus().redo().run()}
          titulo="Rehacer (Ctrl+Shift+Z)"
          deshabilitado={!editor.can().redo()}
        >
          ↷
        </Boton>

        <div className="ml-auto flex items-center gap-3">
          {subiendo && (
            <span className="meta-tipografia flex items-center gap-1.5 text-oliva">
              <span className="h-2 w-2 animate-pulse rounded-full bg-oliva" /> Subiendo…
            </span>
          )}
          {alPedirPantallaCompleta && (
            <Boton alPulsar={alPedirPantallaCompleta} titulo="Ver el post entero como en la web">
              Ver el post entero
            </Boton>
          )}
        </div>
      </div>

      {/* -------------------------------------------- una direccion, si hace falta */}
      {pidiendo && (
        <div className="filete-bajo flex flex-wrap items-center gap-2 bg-lienzo/60 px-3 py-2.5">
          <label className="meta-tipografia text-humo" htmlFor="direccion-editor">
            {pidiendo === 'enlace' ? '¿A dónde lleva el enlace?' : 'Dirección del vídeo'}
          </label>
          <input
            id="direccion-editor"
            autoFocus
            value={direccion}
            onChange={(e) => asignarDireccion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                confirmarDireccion();
              }
              if (e.key === 'Escape') asignarPidiendo(null);
            }}
            placeholder={
              pidiendo === 'enlace' ? 'www.ejemplo.com' : 'https://www.youtube.com/watch?v=...'
            }
            className="h-8 min-w-[280px] flex-1 rounded-suave border border-ceniza bg-papel px-2.5 text-xs text-tinta outline-none focus:border-grafito"
          />
          <button
            type="button"
            onClick={confirmarDireccion}
            className="h-8 rounded-suave bg-tinta px-3 text-xs text-lienzo hover:bg-grafito"
          >
            Poner
          </button>
          <button
            type="button"
            onClick={() => asignarPidiendo(null)}
            className="h-8 rounded-suave border border-ceniza px-2.5 text-xs text-grafito hover:bg-ceniza/40"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* --------------------------------------------------- donde se escribe */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          asignarArrastrando(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          asignarArrastrando(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          asignarArrastrando(false);
          const archivos = Array.from(e.dataTransfer.files);
          if (archivos.length > 0) void subir(archivos);
        }}
        className={unirClases('comoSeVera relative', arrastrando && 'ring-2 ring-inset ring-oliva')}
      >
        {arrastrando && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-tinta/70">
            <p className="text-lg text-lienzo">Suelta aquí la foto o el vídeo</p>
          </div>
        )}
        <div className="hoja">
          <EditorContent editor={editor} />
        </div>
      </div>

      <p className="filete-alto meta-tipografia bg-papel px-4 py-2 text-xs text-humo">
        Lo que ves es como quedará publicado. Arrastra una foto o un vídeo aquí mismo para meterlo.
      </p>
    </div>
  );
};
