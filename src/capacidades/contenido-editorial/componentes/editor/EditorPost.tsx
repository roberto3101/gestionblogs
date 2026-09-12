/**
 * Editor del cuerpo de un post.
 *
 * Sustituye al editor anterior, que tenia tres problemas que hacian perder el
 * trabajo a quien no conoce markdown:
 *
 *  - Los botones metian texto de relleno ("**texto**") en vez de envolver lo
 *    que habia seleccionado, asi que habia que borrar la palabra de ejemplo a
 *    mano y era facil dejar los asteriscos sin cerrar.
 *  - Insertar un video abria un window.prompt, que bloquea el navegador.
 *  - La vista previa usaba un renderizador propio que pintaba cosas que la web
 *    luego no pintaba.
 *
 * Aqui los botones trabajan sobre la seleccion, no hay ningun dialogo que
 * bloquee, y la vista previa es la pagina de articulo de verdad.
 */

import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type DragEvent } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';
import { subirArchivo } from '../../servicios/servicioSubidaArchivos';
import { useNotificaciones } from '@plataforma/gobierno/errores/contextoNotificaciones';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import type { Identificador } from '@compartido/tipos/identificador';
import { VistaPostComoSeVera } from './VistaPostComoSeVera';

interface PropiedadesEditorPost {
  valor: string;
  alCambiar: (nuevo: string) => void;
  titulo: string;
  resumen?: string;
  urlPortada?: string | null;
  autor?: string;
  tema?: string;
  sitioId?: Identificador | '';
}

type Multimedia = { tipo: 'foto' | 'video' | 'youtube'; linea: string; resumen: string };

const ETIQUETA_MULTIMEDIA: Record<Multimedia['tipo'], string> = {
  foto: 'Foto',
  video: 'Vídeo',
  youtube: 'YouTube',
};

const extraerMultimedia = (contenido: string): Multimedia[] => {
  const encontrados: Multimedia[] = [];
  for (const linea of contenido.split('\n')) {
    const limpia = linea.trim();
    const foto = limpia.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (foto) {
      encontrados.push({ tipo: 'foto', linea: limpia, resumen: foto[1] || foto[2].split('/').pop() || 'foto' });
      continue;
    }
    if (limpia.startsWith('@youtube:')) {
      encontrados.push({ tipo: 'youtube', linea: limpia, resumen: limpia.slice(9).trim().slice(0, 48) });
    } else if (limpia.startsWith('@video:')) {
      encontrados.push({ tipo: 'video', linea: limpia, resumen: limpia.slice(7).trim().split('/').pop() || 'vídeo' });
    }
  }
  return encontrados;
};

const quitarLinea = (contenido: string, lineaABorrar: string): string => {
  const lineas = contenido.split('\n');
  const indice = lineas.findIndex((l) => l.trim() === lineaABorrar.trim());
  if (indice === -1) return contenido;
  lineas.splice(indice, 1);
  // Si al quitarla quedan dos líneas vacías seguidas, se deja una sola.
  if (indice > 0 && indice < lineas.length && !lineas[indice - 1].trim() && !lineas[indice].trim()) {
    lineas.splice(indice, 1);
  }
  return lineas.join('\n');
};

export const EditorPost = ({
  valor,
  alCambiar,
  titulo,
  resumen,
  urlPortada,
  autor,
  tema,
  sitioId,
}: PropiedadesEditorPost) => {
  const [arrastrando, asignarArrastrando] = useState(false);
  const [subiendo, asignarSubiendo] = useState(false);
  const [urlYoutube, asignarUrlYoutube] = useState('');
  const [pidiendoYoutube, asignarPidiendoYoutube] = useState(false);
  const [confirmandoQuitar, asignarConfirmandoQuitar] = useState<string | null>(null);
  const [vistaEstrecha, asignarVistaEstrecha] = useState<'escribir' | 'ver'>('escribir');

  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const archivoRef = useRef<HTMLInputElement | null>(null);
  const { publicar } = useNotificaciones();

  /**
   * Reemplaza el trozo seleccionado y vuelve a dejar la selección donde toca,
   * para poder seguir escribiendo sin buscar el cursor.
   */
  const reemplazarSeleccion = (nuevoTexto: string, inicioSel: number, finSel: number, inicio: number, fin: number) => {
    alCambiar(valor.slice(0, inicio) + nuevoTexto + valor.slice(fin));
    requestAnimationFrame(() => {
      const area = areaRef.current;
      if (!area) return;
      area.focus();
      area.setSelectionRange(inicioSel, finSel);
    });
  };

  /** Envuelve la selección. Sin selección, escribe un ejemplo y lo deja marcado. */
  const envolver = (marca: string, ejemplo: string) => {
    const area = areaRef.current;
    if (!area) return;
    const inicio = area.selectionStart;
    const fin = area.selectionEnd;
    const seleccionado = valor.slice(inicio, fin);
    const cuerpo = seleccionado || ejemplo;
    const nuevo = `${marca}${cuerpo}${marca}`;
    // La selección queda sobre el texto, no sobre los asteriscos: si no había
    // nada seleccionado, lo siguiente que se escriba sustituye el ejemplo.
    reemplazarSeleccion(nuevo, inicio + marca.length, inicio + marca.length + cuerpo.length, inicio, fin);
  };

  /** Pone un prefijo al principio de cada línea de la selección. */
  const prefijarLineas = (prefijo: string, ejemplo: string) => {
    const area = areaRef.current;
    if (!area) return;
    const inicio = area.selectionStart;
    const fin = area.selectionEnd;

    // Se extiende la selección hasta el principio de su primera línea.
    const inicioLinea = valor.lastIndexOf('\n', inicio - 1) + 1;
    const seleccionado = valor.slice(inicioLinea, fin);
    const lineas = (seleccionado || ejemplo).split('\n');
    const prefijadas = lineas.map((l) => (l.startsWith(prefijo) ? l : `${prefijo}${l}`)).join('\n');

    const necesitaHueco = inicioLinea > 0 && valor[inicioLinea - 1] !== '\n' ? '\n' : '';
    const nuevo = `${necesitaHueco}${prefijadas}`;
    const desplazado = inicioLinea + nuevo.length;
    reemplazarSeleccion(nuevo, desplazado, desplazado, inicioLinea, fin);
  };

  /** Inserta un bloque en su propia línea, separado del texto de alrededor. */
  const insertarBloque = (texto: string) => {
    const area = areaRef.current;
    const inicio = area?.selectionStart ?? valor.length;
    const fin = area?.selectionEnd ?? valor.length;
    const antes = inicio > 0 && valor[inicio - 1] !== '\n' ? '\n\n' : '';
    const despues = valor[fin] && valor[fin] !== '\n' ? '\n\n' : '\n';
    const nuevo = `${antes}${texto}${despues}`;
    const tope = inicio + nuevo.length;
    reemplazarSeleccion(nuevo, tope, tope, inicio, fin);
  };

  const enlazar = () => {
    const area = areaRef.current;
    if (!area) return;
    const inicio = area.selectionStart;
    const fin = area.selectionEnd;
    const seleccionado = valor.slice(inicio, fin) || 'texto del enlace';
    const nuevo = `[${seleccionado}](https://)`;
    // La selección se deja sobre la dirección, que es lo que hay que cambiar.
    const posUrl = inicio + seleccionado.length + 3;
    reemplazarSeleccion(nuevo, posUrl, posUrl + 8, inicio, fin);
  };

  const subirYInsertar = async (archivos: File[]) => {
    if (archivos.length === 0) return;
    asignarSubiendo(true);
    try {
      for (const archivo of archivos) {
        const subido = await subirArchivo(archivo, (sitioId || undefined) as Identificador | undefined);
        insertarBloque(
          subido.tipo === 'VIDEO' ? `@video: ${subido.url}` : `![${subido.nombre}](${subido.url})`,
        );
        publicar({ tono: 'exito', titulo: `${subido.nombre} listo`, detalle: 'Ya aparece en la vista previa' });
      }
    } catch (error) {
      const mensaje = error instanceof ErrorHttp ? error.message : 'No se pudo subir el archivo';
      publicar({ tono: 'error', titulo: 'La subida falló', detalle: mensaje });
    } finally {
      asignarSubiendo(false);
    }
  };

  const alElegirArchivo = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(evento.target.files ?? []);
    if (archivos.length > 0) void subirYInsertar(archivos);
    evento.target.value = '';
  };

  const alPegar = (evento: ClipboardEvent<HTMLTextAreaElement>) => {
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

  const alSoltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    asignarArrastrando(false);
    const archivos = Array.from(evento.dataTransfer.files);
    if (archivos.length > 0) void subirYInsertar(archivos);
  };

  const anadirYoutube = () => {
    const url = urlYoutube.trim();
    if (!url) return;
    insertarBloque(`@youtube: ${url}`);
    asignarUrlYoutube('');
    asignarPidiendoYoutube(false);
  };

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

  const multimedia = extraerMultimedia(valor);

  const claseBoton =
    'h-8 px-2.5 text-xs rounded-suave border border-ceniza text-grafito transicion-natural hover:bg-ceniza/40 hover:text-tinta';

  const panelEscribir = (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        asignarArrastrando(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        asignarArrastrando(false);
      }}
      onDrop={alSoltar}
      className={unirClases(
        'relative flex flex-col overflow-hidden rounded-suave border border-ceniza bg-papel',
        arrastrando && 'ring-2 ring-inset ring-oliva',
      )}
    >
      <input
        ref={archivoRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={alElegirArchivo}
      />

      {/* ------------------------------------------------------ herramientas */}
      <div className="filete-bajo flex flex-wrap items-center gap-1.5 px-3 py-2">
        <button
          type="button"
          onClick={() => archivoRef.current?.click()}
          className="inline-flex h-8 items-center gap-1.5 rounded-suave bg-tinta px-3 text-xs font-medium text-lienzo transicion-natural hover:bg-grafito"
          title="Subir una foto o un vídeo desde tu ordenador (Ctrl+U)"
        >
          ↑ Subir foto o vídeo
        </button>
        <button type="button" onClick={() => asignarPidiendoYoutube((v) => !v)} className={claseBoton}>
          Vídeo de YouTube
        </button>

        <span className="mx-1 self-stretch w-px bg-ceniza" />

        <button type="button" onClick={() => prefijarLineas('## ', 'Título de sección')} className={claseBoton}>
          Título de sección
        </button>
        <button type="button" onClick={() => envolver('**', 'negrita')} className={unirClases(claseBoton, 'font-bold')}>
          Negrita
        </button>
        <button type="button" onClick={() => envolver('*', 'cursiva')} className={unirClases(claseBoton, 'italic')}>
          Cursiva
        </button>
        <button type="button" onClick={enlazar} className={claseBoton}>
          Enlace
        </button>
        <button type="button" onClick={() => prefijarLineas('- ', 'primer punto\nsegundo punto')} className={claseBoton}>
          Lista
        </button>
        <button type="button" onClick={() => prefijarLineas('> ', 'frase destacada')} className={claseBoton}>
          Cita
        </button>

        {subiendo && (
          <span className="meta-tipografia ml-auto flex items-center gap-1.5 text-oliva">
            <span className="h-2 w-2 animate-pulse rounded-full bg-oliva" /> Subiendo…
          </span>
        )}
      </div>

      {pidiendoYoutube && (
        <div className="filete-bajo flex flex-wrap items-center gap-2 bg-lienzo/60 px-3 py-2.5">
          <label className="meta-tipografia text-humo" htmlFor="url-youtube">
            Pega la dirección del vídeo
          </label>
          <input
            id="url-youtube"
            autoFocus
            value={urlYoutube}
            onChange={(e) => asignarUrlYoutube(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                anadirYoutube();
              }
              if (e.key === 'Escape') asignarPidiendoYoutube(false);
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-8 min-w-[280px] flex-1 rounded-suave border border-ceniza bg-papel px-2.5 text-xs text-tinta outline-none focus:border-grafito"
          />
          <button
            type="button"
            onClick={anadirYoutube}
            className="h-8 rounded-suave bg-tinta px-3 text-xs text-lienzo hover:bg-grafito"
          >
            Añadir
          </button>
          <button type="button" onClick={() => asignarPidiendoYoutube(false)} className={claseBoton}>
            Cancelar
          </button>
        </div>
      )}

      {/* ------------------------------------------------ lo que has metido */}
      {multimedia.length > 0 && (
        <div className="filete-bajo flex flex-wrap items-center gap-2 bg-lienzo/60 px-3 py-2.5">
          <span className="meta-tipografia text-humo">En este post:</span>
          {multimedia.map((m, i) => (
            <span
              key={`${m.linea}-${i}`}
              className="inline-flex h-7 items-center gap-1.5 rounded-suave border border-ceniza bg-papel pl-2 pr-1 text-xs"
            >
              <span className="text-humo">{ETIQUETA_MULTIMEDIA[m.tipo]}</span>
              <span className="max-w-[160px] truncate text-grafito">{m.resumen}</span>
              {confirmandoQuitar === m.linea ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      alCambiar(quitarLinea(valor, m.linea));
                      asignarConfirmandoQuitar(null);
                    }}
                    className="rounded px-1.5 text-cinabrio hover:bg-cinabrio/10"
                  >
                    Quitar
                  </button>
                  <button
                    type="button"
                    onClick={() => asignarConfirmandoQuitar(null)}
                    className="rounded px-1.5 text-humo hover:bg-ceniza/40"
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => asignarConfirmandoQuitar(m.linea)}
                  aria-label={`Quitar ${m.resumen}`}
                  className="grid h-5 w-5 place-items-center rounded-full text-humo transicion-natural hover:bg-cinabrio/10 hover:text-cinabrio"
                >
                  ✕
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {arrastrando && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-oliva-suave/80">
          <div className="text-center">
            <p className="titulo-editorial text-2xl text-tinta">Suelta aquí</p>
            <p className="meta-tipografia mt-2">La foto o el vídeo se sube solo</p>
          </div>
        </div>
      )}

      <textarea
        ref={areaRef}
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        onPaste={alPegar}
        spellCheck
        className="min-h-[520px] w-full flex-1 resize-none bg-papel px-6 py-5 text-[16px] leading-8 text-tinta outline-none"
        placeholder={
          'Escribe el post aquí, como escribirías un correo.\n\n' +
          'Para poner un título de sección, negrita o una lista, usa los botones de arriba: ' +
          'selecciona el texto y pulsa el botón.\n\n' +
          'Para meter una foto o un vídeo, arrástralo sobre este recuadro, pégalo con Ctrl+V ' +
          'o usa «Subir foto o vídeo».'
        }
      />

      <p className="filete-alto bg-papel px-4 py-2 meta-tipografia text-xs text-humo">
        A la derecha ves el post tal como quedará publicado.
      </p>
    </div>
  );

  const panelVista = (
    <VistaPostComoSeVera
      titulo={titulo}
      resumen={resumen}
      contenido={valor}
      urlPortada={urlPortada}
      autor={autor}
      tema={tema}
    />
  );

  return (
    <div>
      {/* En pantallas estrechas no caben los dos: se cambia con dos botones,
          sin menús ni pestañas que haya que descifrar. */}
      <div className="mb-2 flex gap-1 xl:hidden">
        {(['escribir', 'ver'] as const).map((clave) => (
          <button
            key={clave}
            type="button"
            onClick={() => asignarVistaEstrecha(clave)}
            className={unirClases(
              'h-8 rounded-suave px-3 text-xs transicion-natural',
              vistaEstrecha === clave ? 'bg-tinta text-lienzo' : 'text-grafito hover:bg-ceniza/40',
            )}
          >
            {clave === 'escribir' ? 'Escribir' : 'Ver cómo queda'}
          </button>
        ))}
      </div>

      <div className="hidden gap-4 xl:grid xl:grid-cols-2">
        {panelEscribir}
        {panelVista}
      </div>

      <div className="xl:hidden">{vistaEstrecha === 'escribir' ? panelEscribir : panelVista}</div>
    </div>
  );
};
