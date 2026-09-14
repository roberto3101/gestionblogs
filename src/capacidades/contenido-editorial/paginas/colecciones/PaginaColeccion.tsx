import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { DialogoConfirmacion } from '@compartido/interfaz/retroalimentacion/DialogoConfirmacion';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { unirClases } from '@compartido/utilidades/unirClases';
import { urlDeLaWeb } from '@compartido/constantes/sitiosProduccion';
import {
  useGuardarBloque,
  useListarBloques,
  usePublicarBloques,
  useResumenBloques,
} from '../../ganchos/useBloques';
import { documentoVigente, type DocumentoBloque } from '../../contratos/bloque';
import { coleccionPorRuta, pesoLegible, type Coleccion } from '../../contratos/colecciones';
import { CampoDocumento } from '../../componentes/bloques/CampoDocumento';
import { VistaPrevia } from '../../componentes/bloques/VistaPrevia';
import { leerCampoEnfocado } from '../../componentes/bloques/campoEnfocado';
import { nombreDeCampo } from '../../contratos/diccionario';
import type { ArchivoSubido } from '../../servicios/servicioSubidaArchivos';

/**
 * Alta, cambio y baja de una de las listas de la web.
 *
 * Es la misma pantalla para los casos de uso, los proyectos, los vídeos y los
 * archivos: lo único que cambia es la descripción de la colección. Por dentro
 * se sigue guardando dentro de su trozo de contenido, así que cualquiera de
 * las dos formas de editar vale y la web no distingue.
 *
 * Guardar no cambia la web. Solo publicar.
 */

type Ficha = Record<string, unknown>;

const IDIOMAS: Record<string, string> = { es: 'Español', en: 'Inglés' };

/** Copia profunda, para no tocar lo que devolvió el servidor. */
const clonar = <T,>(valor: T): T => JSON.parse(JSON.stringify(valor)) as T;

/**
 * Una ficha nueva con la forma que espera la web.
 *
 * Se calca la primera que haya y se le vacían los textos: así la ficha nueva
 * tiene exactamente los campos que la plantilla va a leer, ni uno menos. Un
 * campo de menos y la web descarta el bloque entero al compilar.
 */
const fichaEnBlanco = (molde: unknown): Ficha => {
  const vaciar = (valor: unknown): unknown => {
    if (typeof valor === 'string') return '';
    if (typeof valor === 'number') return 0;
    if (typeof valor === 'boolean') return false;
    if (Array.isArray(valor)) return [];
    if (valor && typeof valor === 'object') {
      const objeto = valor as Record<string, unknown>;
      return Object.fromEntries(Object.entries(objeto).map(([k, v]) => [k, vaciar(v)]));
    }
    return valor;
  };
  return (vaciar(molde) ?? {}) as Ficha;
};

const textoDe = (ficha: Ficha, campo: string): string => {
  const valor = ficha[campo];
  return typeof valor === 'string' ? valor.replace(/\s+/g, ' ').trim() : '';
};

/** Los campos de la ficha, en el orden de la colección; el resto, detrás. */
const camposOrdenados = (coleccion: Coleccion, ficha: Ficha): string[] => {
  const presentes = Object.keys(ficha);
  const primero = coleccion.orden.filter((c) => presentes.includes(c));
  return [...primero, ...presentes.filter((c) => !primero.includes(c))];
};

export const PaginaColeccion = () => {
  const { coleccion: rutaColeccion } = useParams();
  const coleccion = coleccionPorRuta(rutaColeccion ?? '');
  const { sitioActivo } = useSitioActivo();
  const resumen = useResumenBloques(sitioActivo?.id ?? null);

  const idiomas = useMemo(() => (resumen.data ?? []).map((r) => r.idioma), [resumen.data]);
  const [idioma, asignarIdioma] = useState('');
  useEffect(() => {
    if (idioma || idiomas.length === 0) return;
    const principal = sitioActivo?.idioma_default ?? 'es';
    asignarIdioma(idiomas.includes(principal) ? principal : idiomas[0]);
  }, [idiomas, idioma, sitioActivo]);

  const consulta = useListarBloques(sitioActivo?.id ?? null, idioma);
  const guardado = useGuardarBloque(sitioActivo?.id ?? null);
  const publicacion = usePublicarBloques(sitioActivo?.id ?? null);

  // Cuál se está editando: su posición en la lista, o null si ninguna.
  const [editando, asignarEditando] = useState<number | null>(null);
  const [borrador, asignarBorrador] = useState<Ficha | null>(null);
  const [porQuitar, asignarPorQuitar] = useState<number | null>(null);
  const [verWeb, asignarVerWeb] = useState(false);
  const [textoEnfocado, asignarTextoEnfocado] = useState('');
  const [respaldoEnfocado, asignarRespaldoEnfocado] = useState('');

  const bloque = (consulta.data ?? []).find((b) => b.clave === coleccion?.bloque) ?? null;
  const documento = bloque ? (documentoVigente(bloque) as DocumentoBloque) : null;
  const lista = useMemo<Ficha[]>(() => {
    if (!documento || !coleccion) return [];
    const valor = documento[coleccion.lista];
    return Array.isArray(valor) ? (valor as Ficha[]) : [];
  }, [documento, coleccion]);

  const baseDelSitio = urlDeLaWeb(sitioActivo?.codigo ?? '');

  /*
   * De donde se saca la forma de una ficha nueva.
   *
   * Normalmente, de la primera que haya. Si se han quitado todas, se mira lo
   * que hay publicado: sin esto, borrar la ultima dejaria la seccion sin
   * manera de volver a empezar.
   */
  const molde = useMemo<unknown>(() => {
    if (lista.length > 0) return lista[0];
    if (!bloque || !coleccion) return undefined;
    const publicada = (bloque.datos as DocumentoBloque)[coleccion.lista];
    return Array.isArray(publicada) ? publicada[0] : undefined;
  }, [lista, bloque, coleccion]);

  if (!coleccion) {
    return <EstadoVacio titulo="Esa lista no existe" descripcion="Elige una del menú." />;
  }

  if (!sitioActivo) {
    return (
      <EstadoVacio
        titulo="Elige una web arriba"
        descripcion="Cada web tiene sus propias fichas."
      />
    );
  }

  if (resumen.isLoading || consulta.isLoading) return <Cargando />;
  if (consulta.isError) {
    return (
      <AvisoError titulo="No se pudo cargar">
        {consulta.error instanceof Error
          ? consulta.error.message
          : 'Vuelve a intentarlo en un momento.'}
      </AvisoError>
    );
  }

  /** Escribe la lista entera de vuelta en su trozo de contenido. */
  const guardarLista = (nueva: Ficha[], alTerminar?: () => void) => {
    if (!documento) return;
    guardado.mutate(
      {
        idioma,
        clave: coleccion.bloque,
        datos: { ...documento, [coleccion.lista]: nueva },
      },
      { onSuccess: () => alTerminar?.() },
    );
  };

  const abrir = (indice: number) => {
    asignarEditando(indice);
    asignarBorrador(clonar(lista[indice]));
  };

  const anadir = () => {
    if (molde === undefined) return;
    asignarEditando(lista.length);
    asignarBorrador(fichaEnBlanco(molde));
  };

  const cerrarEditor = () => {
    asignarEditando(null);
    asignarBorrador(null);
    asignarTextoEnfocado('');
    asignarRespaldoEnfocado('');
  };

  const guardarFicha = () => {
    if (editando === null || !borrador) return;
    const nueva = [...lista];
    nueva[editando] = borrador;
    guardarLista(nueva, cerrarEditor);
  };

  const mover = (indice: number, salto: number) => {
    const destino = indice + salto;
    if (destino < 0 || destino >= lista.length) return;
    const nueva = [...lista];
    [nueva[indice], nueva[destino]] = [nueva[destino], nueva[indice]];
    guardarLista(nueva);
  };

  const quitar = (indice: number) => {
    guardarLista(
      lista.filter((_, i) => i !== indice),
      () => asignarPorQuitar(null),
    );
  };

  /**
   * Al subir un archivo se rellenan solos el formato y el peso.
   *
   * Es lo que separaba «subir un PDF» de «subir un PDF y acordarse de escribir
   * pdf en una casilla y 2,4 MB en otra, bien escrito».
   */
  const alSubirArchivo = (nombre: string, subido: ArchivoSubido) => {
    const regla = coleccion.rellenarAlSubir;
    if (!regla || nombre !== regla.desde) return;
    asignarBorrador((previo) => {
      if (!previo) return previo;
      const siguiente = { ...previo };
      if (regla.formato && regla.formato in siguiente) {
        const extension = (subido.formato || subido.nombre.split('.').pop() || '')
          .toLowerCase()
          .replace(/^\./, '');
        if (extension) siguiente[regla.formato] = extension;
      }
      if (regla.peso && regla.peso in siguiente) {
        const legible = pesoLegible(subido.tamano_bytes);
        if (legible) siguiente[regla.peso] = legible;
      }
      // Si la ficha no tenía título todavía, el del archivo sirve de punto de
      // partida mejor que dejarlo en blanco.
      if (!textoDe(siguiente, coleccion.campoTitulo)) {
        siguiente[coleccion.campoTitulo] = subido.nombre.replace(/\.[^.]+$/, '');
      }
      return siguiente;
    });
  };

  const pendiente = bloque?.tiene_pendiente ?? false;

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="La web"
        titulo={coleccion.nombre}
        descripcion={coleccion.descripcion}
        acciones={
          <div className="flex flex-wrap items-center gap-2">
            {idiomas.length > 1 && (
              <div className="flex items-center gap-1">
                {idiomas.map((codigo) => (
                  <button
                    key={codigo}
                    type="button"
                    onClick={() => {
                      cerrarEditor();
                      asignarIdioma(codigo);
                    }}
                    className={unirClases(
                      'h-8 px-3 rounded-suave text-[13px] border transition-colors',
                      codigo === idioma
                        ? 'bg-tinta text-lienzo border-tinta'
                        : 'bg-papel text-grafito border-ceniza hover:border-humo',
                    )}
                  >
                    {IDIOMAS[codigo] ?? codigo.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            <Boton
              tono="discreto"
              tamano="compacto"
              type="button"
              onClick={() => asignarVerWeb((v) => !v)}
            >
              {verWeb ? 'Ocultar la web' : 'Ver la web'}
            </Boton>
            <Boton type="button" tamano="compacto" onClick={anadir} disabled={molde === undefined}>
              Añadir {coleccion.unaDeEstas}
            </Boton>
          </div>
        }
      />

      {!bloque && (
        <EstadoVacio
          titulo="Esta web todavía no tiene esta sección"
          descripcion={`Falta el trozo «${coleccion.bloque}». Avisa a quien montó la web para que lo añada.`}
        />
      )}

      {bloque && (
        <>
          {pendiente && (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-suave border border-ambar/40 bg-ambar/5 px-4 py-3">
              <Etiqueta tono="ambar">Guardado, sin publicar</Etiqueta>
              <p className="text-sm text-grafito flex-1 min-w-[12rem]">
                Los cambios están guardados, pero la web sigue como estaba.
              </p>
              <Boton
                type="button"
                tamano="compacto"
                cargando={publicacion.isPending}
                onClick={() =>
                  publicacion.mutate({ idioma, claves: [coleccion.bloque] })
                }
              >
                Publicar
              </Boton>
            </div>
          )}

          <div
            className={unirClases(
              'grid gap-6',
              verWeb ? 'xl:grid-cols-[minmax(0,1fr),minmax(0,42%)]' : 'grid-cols-1',
            )}
          >
            <div className="min-w-0">
              {lista.length === 0 ? (
                <EstadoVacio
                  titulo={`Todavía no hay ${coleccion.nombre.toLowerCase()}`}
                  descripcion={
                    molde === undefined
                      ? 'Para poder crear la primera hace falta una ficha de ejemplo en la web, que diga qué campos lleva.'
                      : `Pulsa «Añadir ${coleccion.unaDeEstas}» para empezar.`
                  }
                  accion={
                    molde === undefined ? undefined : (
                      <Boton type="button" onClick={anadir}>
                        Añadir {coleccion.unaDeEstas}
                      </Boton>
                    )
                  }
                />
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {lista.map((ficha, indice) => {
                    const titulo = textoDe(ficha, coleccion.campoTitulo);
                    const foto = coleccion.campoFoto ? textoDe(ficha, coleccion.campoFoto) : '';
                    const resumenFicha = coleccion.camposResumen
                      .map((campo) => textoDe(ficha, campo))
                      .filter(Boolean);
                    return (
                      <li
                        key={indice}
                        className="flex flex-col overflow-hidden rounded-suave border border-ceniza bg-papel"
                      >
                        {coleccion.campoFoto && (
                          <div className="h-32 bg-lienzo border-b border-ceniza/60 grid place-items-center overflow-hidden">
                            {foto ? (
                              <img
                                src={
                                  /^(https?:)?\/\//.test(foto) || foto.startsWith('/')
                                    ? foto
                                    : `${baseDelSitio.replace(/\/+$/, '')}/images/${foto}.webp`
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-humo">Sin foto</span>
                            )}
                          </div>
                        )}
                        <div className="flex flex-1 flex-col gap-2 p-3.5">
                          <p className="text-sm text-tinta font-medium leading-snug">
                            {titulo || `Ficha ${indice + 1}`}
                          </p>
                          {resumenFicha.length > 0 && (
                            <p className="text-xs text-humo">{resumenFicha.join(' · ')}</p>
                          )}
                          <div className="mt-auto flex items-center gap-1.5 pt-2">
                            <Boton
                              tono="discreto"
                              tamano="compacto"
                              type="button"
                              onClick={() => abrir(indice)}
                            >
                              Cambiar
                            </Boton>
                            <button
                              type="button"
                              onClick={() => mover(indice, -1)}
                              disabled={indice === 0}
                              title="Subirla un puesto"
                              aria-label="Subirla un puesto"
                              className={unirClases(
                                'h-8 w-8 rounded-suave border border-ceniza text-grafito',
                                indice === 0 ? 'opacity-30' : 'hover:bg-ceniza/40 hover:text-tinta',
                              )}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => mover(indice, 1)}
                              disabled={indice === lista.length - 1}
                              title="Bajarla un puesto"
                              aria-label="Bajarla un puesto"
                              className={unirClases(
                                'h-8 w-8 rounded-suave border border-ceniza text-grafito',
                                indice === lista.length - 1
                                  ? 'opacity-30'
                                  : 'hover:bg-ceniza/40 hover:text-tinta',
                              )}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => asignarPorQuitar(indice)}
                              title="Quitarla de la web"
                              aria-label="Quitarla de la web"
                              className="ml-auto h-8 w-8 rounded-suave text-humo transicion-natural hover:bg-cinabrio/10 hover:text-cinabrio"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {verWeb && (
              <div className="min-w-0 xl:sticky xl:top-6 xl:self-start">
                <VistaPrevia
                  codigoSitio={sitioActivo.codigo}
                  baseDelSitio={baseDelSitio}
                  ruta={coleccion.paginaWeb}
                  bloque={coleccion.bloque}
                  textoEnfocado={textoEnfocado}
                  respaldoEnfocado={respaldoEnfocado}
                  sustituciones={[]}
                  alCerrar={() => asignarVerWeb(false)}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* El formulario de una ficha, encima de todo. Se abre al añadir y al
          cambiar; hasta que no se guarda, la web no se entera de nada. */}
      {borrador && editando !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/40 p-0 sm:items-center sm:p-6">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-marco bg-papel sm:rounded-marco">
            <header className="flex items-center gap-3 border-b border-ceniza px-5 py-3.5">
              <div className="min-w-0">
                <p className="meta-tipografia text-humo">
                  {editando >= lista.length ? 'Nueva ficha' : 'Cambiar'}
                </p>
                <p className="truncate text-sm text-tinta">
                  {textoDe(borrador, coleccion.campoTitulo) || coleccion.nombre}
                </p>
              </div>
              <Boton
                tono="fantasma"
                tamano="compacto"
                type="button"
                className="ml-auto"
                onClick={cerrarEditor}
              >
                Cancelar
              </Boton>
            </header>

            <div
              className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5"
              onFocus={(evento) => {
                const enfocado = leerCampoEnfocado(evento.target);
                if (!enfocado) return;
                asignarTextoEnfocado(enfocado.texto);
                asignarRespaldoEnfocado(enfocado.respaldo);
              }}
              onClick={(evento) => {
                const tocado = leerCampoEnfocado(evento.target);
                if (!tocado) return;
                asignarTextoEnfocado(tocado.texto);
                asignarRespaldoEnfocado(tocado.respaldo);
              }}
            >
              {camposOrdenados(coleccion, borrador).map((campo) => (
                <CampoDocumento
                  key={campo}
                  nombre={campo}
                  valor={borrador[campo]}
                  baseDelSitio={baseDelSitio}
                  documentoRaiz={documento ?? undefined}
                  alSubirArchivo={alSubirArchivo}
                  alCambiar={(nuevo) =>
                    asignarBorrador((previo) => (previo ? { ...previo, [campo]: nuevo } : previo))
                  }
                />
              ))}
            </div>

            <footer className="flex items-center gap-3 border-t border-ceniza px-5 py-3.5">
              <p className="text-xs text-humo flex-1">
                Al guardar, la web sigue igual hasta que pulses Publicar.
              </p>
              <Boton
                type="button"
                cargando={guardado.isPending}
                onClick={guardarFicha}
                disabled={!textoDe(borrador, coleccion.campoTitulo)}
                title={
                  textoDe(borrador, coleccion.campoTitulo)
                    ? undefined
                    : `Ponle ${nombreDeCampo(coleccion.campoTitulo).toLowerCase()} antes de guardar`
                }
              >
                Guardar
              </Boton>
            </footer>
          </div>
        </div>
      )}

      <DialogoConfirmacion
        abierto={porQuitar !== null}
        titulo={`¿Quitar ${coleccion.unaDeEstas}?`}
        mensaje={
          porQuitar !== null && lista[porQuitar]
            ? `«${textoDe(lista[porQuitar], coleccion.campoTitulo) || 'Sin título'}» dejará de salir en la web en cuanto publiques.`
            : ''
        }
        textoConfirmar="Quitarla"
        tonoConfirmar="peligro"
        cargando={guardado.isPending}
        alConfirmar={() => porQuitar !== null && quitar(porQuitar)}
        alCancelar={() => asignarPorQuitar(null)}
      />
    </div>
  );
};
