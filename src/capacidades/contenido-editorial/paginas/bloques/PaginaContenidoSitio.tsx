import { useEffect, useMemo, useState } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { unirClases } from '@compartido/utilidades/unirClases';
import { urlDeLaWeb } from '@compartido/constantes/sitiosProduccion';
import {
  useDescartarBorrador,
  useGuardarBloque,
  useListarBloques,
  usePublicarBloques,
  useResumenBloques,
} from '../../ganchos/useBloques';
import { CampoDocumento } from '../../componentes/bloques/CampoDocumento';
import { VistaPrevia } from '../../componentes/bloques/VistaPrevia';
import {
  documentoVigente,
  elementosVacios,
  sinElementosVacios,
  type Bloque,
  type DocumentoBloque,
} from '../../contratos/bloque';
import {
  descripcionDeBloque,
  nombreDeBloque,
  ordenDeBloque,
  paginaDe,
  paginas,
} from '../../contratos/diccionario';
import { DialogoConfirmacion } from '@compartido/interfaz/retroalimentacion/DialogoConfirmacion';

/**
 * Edición de los textos y las fotos de la web.
 *
 * Está montada alrededor de una idea: quien edita no tiene por qué saber cómo
 * se llaman las cosas por dentro. Todo se agrupa por la página en la que sale,
 * cada trozo lleva su explicación, y al lado se ve la web de verdad.
 *
 * Guardar no cambia nada de cara al público. Solo publicar.
 */

const IDIOMAS: Record<string, string> = { es: 'Español', en: 'Inglés' };
const nombreDeIdioma = (codigo: string) => IDIOMAS[codigo] ?? codigo.toUpperCase();

/**
 * Recoge los textos que han cambiado entre lo publicado y lo que se escribe
 * ahora, para poder enseñarlos en la vista previa.
 */
function textosCambiados(
  publicado: unknown,
  borrador: unknown,
  acumulado: Array<{ antes: string; ahora: string }> = [],
): Array<{ antes: string; ahora: string }> {
  if (typeof publicado === 'string' && typeof borrador === 'string') {
    // Los textos muy cortos dan falsos positivos al sustituir en la página.
    if (publicado !== borrador && publicado.trim().length > 3) {
      acumulado.push({ antes: publicado, ahora: borrador });
    }
    return acumulado;
  }
  if (Array.isArray(publicado) && Array.isArray(borrador)) {
    const hasta = Math.min(publicado.length, borrador.length);
    for (let i = 0; i < hasta; i++) textosCambiados(publicado[i], borrador[i], acumulado);
    return acumulado;
  }
  if (publicado && borrador && typeof publicado === 'object' && typeof borrador === 'object') {
    const a = publicado as Record<string, unknown>;
    const b = borrador as Record<string, unknown>;
    for (const clave of Object.keys(a)) textosCambiados(a[clave], b[clave], acumulado);
  }
  return acumulado;
}

export const PaginaContenidoSitio = () => {
  const { sitioActivo } = useSitioActivo();
  const resumen = useResumenBloques(sitioActivo?.id ?? null);

  const idiomas = useMemo(() => (resumen.data ?? []).map((r) => r.idioma), [resumen.data]);
  const [idioma, asignarIdioma] = useState('');
  useEffect(() => {
    if (idioma || idiomas.length === 0) return;
    // El idioma principal del sitio primero: es el que se edita a diario.
    const principal = sitioActivo?.idioma_default ?? 'es';
    asignarIdioma(idiomas.includes(principal) ? principal : idiomas[0]);
  }, [idiomas, idioma, sitioActivo]);

  const consulta = useListarBloques(sitioActivo?.id ?? null, idioma);
  const guardado = useGuardarBloque(sitioActivo?.id ?? null);
  const descarte = useDescartarBorrador(sitioActivo?.id ?? null);
  const publicacion = usePublicarBloques(sitioActivo?.id ?? null);

  const [claveAbierta, asignarClaveAbierta] = useState<string | null>(null);
  const [borrador, asignarBorrador] = useState<DocumentoBloque | null>(null);
  const [verWeb, asignarVerWeb] = useState(true);
  // Que hay que deshacer: un trozo concreto o todo lo guardado sin publicar.
  const [porDeshacer, asignarPorDeshacer] = useState<
    { alcance: 'todos' } | { alcance: 'uno'; clave: string } | null
  >(null);
  const [vaciosDetectados, asignarVaciosDetectados] = useState<
    ReturnType<typeof elementosVacios>
  >([]);

  const bloques = consulta.data ?? [];
  const pendientes = bloques.filter((b) => b.tiene_pendiente);
  const bloqueAbierto = bloques.find((b) => b.clave === claveAbierta) ?? null;
  const baseDelSitio = urlDeLaWeb(sitioActivo?.codigo ?? '');

  const abrir = (bloque: Bloque) => {
    asignarVaciosDetectados([]);
    if (claveAbierta === bloque.clave) {
      asignarClaveAbierta(null);
      asignarBorrador(null);
      return;
    }
    asignarClaveAbierta(bloque.clave);
    asignarBorrador(JSON.parse(JSON.stringify(documentoVigente(bloque))) as DocumentoBloque);
  };

  const cerrar = () => {
    asignarVaciosDetectados([]);
    asignarClaveAbierta(null);
    asignarBorrador(null);
  };

  // Agrupar por la página de la web donde sale cada cosa, en el orden del menú.
  const porPagina = useMemo(() => {
    const grupos = new Map<string, Bloque[]>();
    for (const bloque of bloques) {
      const prefijo = bloque.clave.split('/')[0];
      grupos.set(prefijo, [...(grupos.get(prefijo) ?? []), bloque]);
    }
    const porRecorrido = (lista: Bloque[]) =>
      [...lista].sort((a, b) => ordenDeBloque(a.clave) - ordenDeBloque(b.clave));
    const conocidas = paginas
      .filter((p) => grupos.has(p.prefijo))
      .map((p) => ({ pagina: p, lista: porRecorrido(grupos.get(p.prefijo)!) }));
    // Lo que no esté en el diccionario se muestra igual, al final.
    const resto = [...grupos.entries()]
      .filter(([prefijo]) => !paginas.some((p) => p.prefijo === prefijo))
      .map(([prefijo, lista]) => ({
        pagina: { prefijo, nombre: prefijo, descripcion: '', ruta: '/' },
        lista: porRecorrido(lista),
      }));
    return [...conocidas, ...resto];
  }, [bloques]);

  const sustituciones = useMemo(() => {
    if (!bloqueAbierto || !borrador) return [];
    return textosCambiados(bloqueAbierto.datos, borrador);
  }, [bloqueAbierto, borrador]);

  const rutaPrevia = claveAbierta ? (paginaDe(claveAbierta)?.ruta ?? '/') : '/';

  if (!sitioActivo) {
    return (
      <EstadoVacio
        titulo="Elige una web arriba"
        descripcion="Cada web tiene sus propios textos y sus propias fotos."
      />
    );
  }

  if (resumen.isLoading) return <Cargando />;

  if (idiomas.length === 0) {
    return (
      <div>
        <EncabezadoSeccion
          preTitulo="La web"
          titulo="Textos y fotos"
          descripcion="Aquí se cambia lo que se lee y se ve en la web."
        />
        <EstadoVacio
          titulo="Todavía no hay nada que editar"
          descripcion="Hay que traer los textos de la web una primera vez. Pídeselo a quien lleve la parte técnica."
        />
      </div>
    );
  }

  const mostrarPrevia = verWeb && baseDelSitio !== '' && claveAbierta !== null;

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="La web"
        titulo="Textos y fotos"
        descripcion="Cambia lo que quieras y guárdalo. La web no cambia hasta que pulses Publicar."
        acciones={
          <>
            {pendientes.length > 0 && (
              <Boton
                tono="discreto"
                onClick={() => asignarPorDeshacer({ alcance: 'todos' })}
              >
                Deshacer lo guardado
              </Boton>
            )}
            <Boton
              cargando={publicacion.isPending}
              disabled={pendientes.length === 0}
              onClick={() => publicacion.mutate({ idioma })}
            >
              {pendientes.length === 0
                ? 'Todo está publicado'
                : `Publicar ${pendientes.length} cambio${pendientes.length === 1 ? '' : 's'}`}
            </Boton>
          </>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <span className="meta-tipografia text-humo">Idioma</span>
        {(resumen.data ?? []).map((r) => (
          <button
            key={r.idioma}
            type="button"
            onClick={() => {
              asignarIdioma(r.idioma);
              cerrar();
            }}
            className={unirClases(
              'h-8 px-3 rounded-suave text-sm border transition-colors',
              r.idioma === idioma
                ? 'bg-tinta text-lienzo border-tinta'
                : 'bg-papel text-grafito border-ceniza hover:border-humo',
            )}
          >
            {nombreDeIdioma(r.idioma)}
            {r.pendientes > 0 && (
              <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-ambar align-middle" />
            )}
          </button>
        ))}
        {pendientes.length > 0 && (
          <span className="text-sm text-ambar">
            {pendientes.length === 1
              ? 'Tienes 1 cambio sin publicar'
              : `Tienes ${pendientes.length} cambios sin publicar`}
          </span>
        )}
      </div>

      {publicacion.isError && <AvisoError>{(publicacion.error as Error).message}</AvisoError>}
      {guardado.isError && <AvisoError>{(guardado.error as Error).message}</AvisoError>}

      {consulta.isLoading ? (
        <Cargando />
      ) : (
        <div
          className={unirClases(
            'grid gap-6 items-start',
            mostrarPrevia ? 'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,46%)]' : 'grid-cols-1',
          )}
        >
          <div className="flex flex-col gap-8 min-w-0">
            {porPagina.map(({ pagina, lista }) => (
              <section key={pagina.prefijo}>
                <header className="mb-3">
                  <h3 className="text-base font-medium text-tinta">{pagina.nombre}</h3>
                  {pagina.descripcion && (
                    <p className="text-sm text-grafito mt-0.5">{pagina.descripcion}</p>
                  )}
                </header>

                <div className="flex flex-col gap-2">
                  {lista.map((bloque) => {
                    const abierto = bloque.clave === claveAbierta;
                    return (
                      <article
                        key={bloque.clave}
                        className={unirClases(
                          'border rounded-suave bg-papel overflow-hidden transition-colors',
                          abierto ? 'border-tinta/40' : 'border-ceniza',
                        )}
                      >
                        <header className="flex items-center gap-3 px-4 py-3">
                          <button
                            type="button"
                            onClick={() => abrir(bloque)}
                            className="flex-1 text-left min-w-0"
                          >
                            <span className="block text-sm font-medium text-tinta">
                              {nombreDeBloque(bloque.clave)}
                            </span>
                            <span className="block text-xs text-grafito mt-0.5">
                              {descripcionDeBloque(bloque.clave)}
                            </span>
                          </button>
                          {bloque.tiene_pendiente && (
                            <Etiqueta tono="ambar">Guardado, sin publicar</Etiqueta>
                          )}
                          <Boton tono="fantasma" tamano="compacto" onClick={() => abrir(bloque)}>
                            {abierto ? 'Cerrar' : 'Cambiar'}
                          </Boton>
                        </header>

                        {abierto && borrador && (
                          <div className="border-t border-ceniza/60 p-5 bg-lienzo">
                            <div className="flex flex-col gap-5">
                              {Object.entries(borrador).map(([clave, valor]) => (
                                <CampoDocumento
                                  key={clave}
                                  nombre={clave}
                                  valor={valor}
                                  baseDelSitio={baseDelSitio}
                                  alCambiar={(nuevo) =>
                                    asignarBorrador((previo) =>
                                      previo ? { ...previo, [clave]: nuevo } : previo,
                                    )
                                  }
                                />
                              ))}
                            </div>

                            {vaciosDetectados.length > 0 && (
                              <div className="mt-5 border border-ambar/40 bg-ambar/5 rounded-suave px-4 py-3">
                                <p className="meta-tipografia text-ambar">
                                  {vaciosDetectados.length === 1
                                    ? 'Hay un hueco sin rellenar'
                                    : `Hay ${vaciosDetectados.length} huecos sin rellenar`}
                                </p>
                                <p className="mt-1.5 text-sm text-grafito">
                                  Si se publican así, en la web saldrán recuadros en blanco. Están
                                  marcados en naranja arriba.
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                  <Boton
                                    tamano="compacto"
                                    cargando={guardado.isPending}
                                    onClick={() => {
                                      const limpio = sinElementosVacios(borrador);
                                      asignarVaciosDetectados([]);
                                      guardado.mutate(
                                        { idioma, clave: bloque.clave, datos: limpio },
                                        { onSuccess: cerrar },
                                      );
                                    }}
                                  >
                                    Quitarlos y guardar
                                  </Boton>
                                  <Boton
                                    tono="discreto"
                                    tamano="compacto"
                                    onClick={() => asignarVaciosDetectados([])}
                                  >
                                    Voy a rellenarlos
                                  </Boton>
                                </div>
                              </div>
                            )}

                            <footer className="flex items-center gap-2 mt-6 pt-4 border-t border-ceniza/60">
                              <Boton
                                cargando={guardado.isPending}
                                onClick={() => {
                                  const vacios = elementosVacios(borrador);
                                  if (vacios.length > 0) {
                                    asignarVaciosDetectados(vacios);
                                    return;
                                  }
                                  guardado.mutate(
                                    { idioma, clave: bloque.clave, datos: borrador },
                                    { onSuccess: cerrar },
                                  );
                                }}
                              >
                                Guardar
                              </Boton>
                              <Boton tono="discreto" onClick={cerrar}>
                                Dejarlo como estaba
                              </Boton>
                              {bloque.tiene_pendiente && (
                                <Boton
                                  tono="peligro"
                                  onClick={() =>
                                    asignarPorDeshacer({ alcance: 'uno', clave: bloque.clave })
                                  }
                                >
                                  Deshacer
                                </Boton>
                              )}
                              {baseDelSitio && !verWeb && (
                                <Boton
                                  tono="fantasma"
                                  className="ml-auto"
                                  onClick={() => asignarVerWeb(true)}
                                >
                                  Ver la web
                                </Boton>
                              )}
                            </footer>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {mostrarPrevia && (
            <div className="xl:sticky xl:top-6">
              <VistaPrevia
                codigoSitio={sitioActivo.codigo}
                baseDelSitio={baseDelSitio}
                ruta={rutaPrevia}
                bloque={claveAbierta ?? ''}
                sustituciones={sustituciones}
                alCerrar={() => asignarVerWeb(false)}
              />
            </div>
          )}
        </div>
      )}

      <DialogoConfirmacion
        abierto={porDeshacer !== null}
        titulo="¿Deshacer lo guardado?"
        mensaje={
          porDeshacer?.alcance === 'todos' ? (
            <>
              Vas a tirar {pendientes.length}{' '}
              {pendientes.length === 1 ? 'cambio guardado' : 'cambios guardados'} que todavía no
              habías publicado. La web no cambia: sigue como está ahora.
            </>
          ) : (
            <>
              Vas a tirar lo que guardaste en este trozo y volver a lo que hay publicado en la
              web ahora mismo.
            </>
          )
        }
        textoConfirmar="Sí, deshacer"
        textoCancelar="No, seguir editando"
        tonoConfirmar="peligro"
        cargando={descarte.isPending}
        alConfirmar={() => {
          if (!porDeshacer) return;
          if (porDeshacer.alcance === 'todos') {
            pendientes.forEach((b) => descarte.mutate({ idioma, clave: b.clave }));
            asignarPorDeshacer(null);
            cerrar();
            return;
          }
          descarte.mutate(
            { idioma, clave: porDeshacer.clave },
            {
              onSuccess: cerrar,
              onSettled: () => asignarPorDeshacer(null),
            },
          );
        }}
        alCancelar={() => asignarPorDeshacer(null)}
      />
    </div>
  );
};
