/**
 * Escribir un post.
 *
 * La versión anterior repartía los campos en tres tarjetas apiladas en una
 * columna de 320 px a la derecha, y dejaba al editor —con su vista previa
 * dentro— en el hueco que sobraba. Quien escribía no encontraba el tema, no
 * tenía dónde poner la portada, y veía el post en un recuadro estrecho que
 * además no se parecía a la web.
 *
 * Aquí el orden es el de la cabeza de quien escribe: título, foto, entradilla,
 * quién firma, de qué va. Debajo, el cuerpo del post a todo el ancho, escrito
 * ya con el aspecto que tendrá publicado. Lo que casi nunca se toca queda
 * plegado abajo.
 */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { Lamina } from '@compartido/interfaz/primitivas/Lamina';
import { TituloEditorial } from '@compartido/interfaz/primitivas/TituloEditorial';
import { Migajas } from '@compartido/interfaz/primitivas/Migajas';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { IndicadorAutosalvado } from '@compartido/interfaz/retroalimentacion/IndicadorAutosalvado';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { useNotificaciones } from '@plataforma/gobierno/errores/contextoNotificaciones';
import { useCrearPost, usePublicarPost } from '../../ganchos/usePosts';
import { useListarAutores } from '../../ganchos/useAutores';
import { useListarCategorias } from '../../ganchos/useCategorias';
import { useListarEtiquetas } from '../../ganchos/useEtiquetas';
import { reemplazarCategoriasPost, reemplazarEtiquetasPost } from '../../servicios/servicioEdicion';
import { useBorradorAutosalvado } from '@compartido/biblioteca/useBorradorAutosalvado';
import { generarSlug } from '@compartido/utilidades/generarSlug';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import { EditorRico } from '../../componentes/editor/EditorRico';
import { VistaPostComoSeVera } from '../../componentes/editor/VistaPostComoSeVera';
import { CampoPortada } from '../../componentes/editor/CampoPortada';
import { SelectorMultiple } from '../../componentes/editor/SelectorMultiple';
import { BannerSitioDestino } from '../../componentes/editor/BannerSitioDestino';
import { construirUrlPublicaPost } from '@compartido/constantes/sitiosProduccion';
import type { Identificador } from '@compartido/tipos/identificador';
import type { Sitio } from '../../contratos/sitio';

interface BorradorPost {
  sitioId: Identificador | '';
  sitioCodigo: string;
  autorId: Identificador | '';
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  idioma: string;
  imagenPortadaId: Identificador | '';
  imagenPortadaUrl: string;
  seoTitulo: string;
  seoDescripcion: string;
  categoriasIds: string[];
  etiquetasIds: string[];
}

const borradorVacio: BorradorPost = {
  sitioId: '',
  sitioCodigo: '',
  autorId: '',
  titulo: '',
  slug: '',
  resumen: '',
  contenido: '',
  idioma: 'es',
  imagenPortadaId: '',
  imagenPortadaUrl: '',
  seoTitulo: '',
  seoDescripcion: '',
  categoriasIds: [],
  etiquetasIds: [],
};

export const PaginaCrearPost = () => {
  const { sitioActivo } = useSitioActivo();
  const navegar = useNavigate();
  const { publicar } = useNotificaciones();
  const creacion = useCrearPost();
  const publicacion = usePublicarPost();

  const { contenido: borrador, asignarContenido: asignarBorrador, marcaTiempo, descartarBorrador } =
    useBorradorAutosalvado<BorradorPost>({
      clave: 'post-nuevo',
      estadoInicial: { ...borradorVacio, sitioId: sitioActivo?.id ?? '', sitioCodigo: sitioActivo?.codigo ?? '' },
    });

  const [erroresValidacion, asignarErroresValidacion] = useState<string | null>(null);
  const [ajustesAbiertos, asignarAjustesAbiertos] = useState(false);
  const [confirmandoLimpiar, asignarConfirmandoLimpiar] = useState(false);
  const [viendoEntero, asignarViendoEntero] = useState(false);

  useEffect(() => {
    if (!borrador.sitioId && sitioActivo) {
      asignarBorrador((b) => ({ ...b, sitioId: sitioActivo.id, sitioCodigo: sitioActivo.codigo }));
    }
  }, [sitioActivo, borrador.sitioId, asignarBorrador]);

  useEffect(() => {
    if (borrador.titulo && !borrador.slug) {
      asignarBorrador((b) => ({ ...b, slug: generarSlug(b.titulo) }));
    }
  }, [borrador.titulo, borrador.slug, asignarBorrador]);

  const consultaAutores = useListarAutores(borrador.sitioCodigo || null);
  const autoresDisponibles = consultaAutores.data?.elementos ?? [];
  const consultaCategorias = useListarCategorias(borrador.sitioId || null);
  const categoriasDisponibles = consultaCategorias.data?.elementos ?? [];
  const consultaEtiquetas = useListarEtiquetas(borrador.sitioId || null);
  const etiquetasDisponibles = consultaEtiquetas.data?.elementos ?? [];

  const cambiarSitio = (id: Identificador, sitio: Sitio | null) => {
    asignarBorrador((b) => ({
      ...b,
      sitioId: id,
      sitioCodigo: sitio?.codigo ?? '',
      autorId: '',
      categoriasIds: [],
      etiquetasIds: [],
      // La portada vive en la biblioteca de su sitio: al cambiar de web deja
      // de ser válida y se quita en vez de guardar una referencia ajena.
      imagenPortadaId: '',
      imagenPortadaUrl: '',
    }));
  };

  const cambiarCampo = <K extends keyof BorradorPost>(campo: K, valor: BorradorPost[K]) => {
    asignarBorrador((b) => ({ ...b, [campo]: valor }));
  };

  const validar = (): string | null => {
    if (!borrador.sitioId) return 'Elige en qué web va este post.';
    if (!borrador.autorId) return 'Elige quién firma el post.';
    if (!borrador.titulo.trim()) return 'Ponle un título.';
    if (!borrador.slug.trim()) return 'Falta el nombre para la dirección web. Está en «Más ajustes».';
    if (!borrador.contenido.trim()) return 'Escribe algo antes de guardar.';
    return null;
  };

  const guardar = (publicarTrasGuardar: boolean) => async (evento?: FormEvent) => {
    evento?.preventDefault();
    const error = validar();
    if (error) {
      asignarErroresValidacion(error);
      return;
    }
    asignarErroresValidacion(null);
    try {
      const post = await creacion.mutateAsync({
        sitio_id: borrador.sitioId as Identificador,
        autor_id: borrador.autorId as Identificador,
        titulo: borrador.titulo.trim(),
        slug: borrador.slug.trim(),
        resumen: borrador.resumen.trim() || undefined,
        contenido: borrador.contenido,
        formato_contenido: 'MARKDOWN',
        idioma: borrador.idioma,
        imagen_portada_id: (borrador.imagenPortadaId || undefined) as Identificador | undefined,
        seo_titulo: borrador.seoTitulo.trim() || undefined,
        seo_descripcion: borrador.seoDescripcion.trim() || undefined,
      });

      // Los temas y las etiquetas se asignan aparte, en dos llamadas más.
      // Si una falla hay que decirlo: antes se tragaba el error en silencio y
      // el post salía publicado sin tema, sin que nadie se enterara.
      const falladas: string[] = [];
      if (borrador.categoriasIds.length > 0) {
        try {
          await reemplazarCategoriasPost(post.id, { categorias_ids: borrador.categoriasIds });
        } catch {
          falladas.push('los temas');
        }
      }
      if (borrador.etiquetasIds.length > 0) {
        try {
          await reemplazarEtiquetasPost(post.id, { etiquetas_ids: borrador.etiquetasIds });
        } catch {
          falladas.push('las etiquetas');
        }
      }
      if (falladas.length > 0) {
        publicar({
          tono: 'error',
          titulo: `El post se guardó, pero no se pudieron asignar ${falladas.join(' ni ')}`,
          detalle: 'Ábrelo y vuelve a intentarlo desde su ficha.',
        });
      }

      if (publicarTrasGuardar) {
        await publicacion.mutateAsync(post.id);
        const urlPublica = construirUrlPublicaPost(borrador.sitioCodigo, borrador.slug, borrador.idioma);
        publicar({
          tono: 'exito',
          titulo: 'Publicado',
          detalle: urlPublica
            ? `${urlPublica} — la web se reconstruye en menos de un minuto`
            : 'La web se reconstruye en menos de un minuto',
        });
      }
      descartarBorrador();
      navegar(`/panel/posts/${post.id}`);
    } catch {
      // El error de creación ya se enseña debajo del editor.
    }
  };

  const referenciaGuardarBorrador = useRef(guardar(false));
  referenciaGuardarBorrador.current = guardar(false);

  useEffect(() => {
    const alPresionarTecla = (evento: KeyboardEvent) => {
      const esCombinacionGuardar = (evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 's';
      if (esCombinacionGuardar) {
        evento.preventDefault();
        void referenciaGuardarBorrador.current();
      }
    };
    window.addEventListener('keydown', alPresionarTecla);
    return () => window.removeEventListener('keydown', alPresionarTecla);
  }, []);

  if (!sitioActivo && !borrador.sitioId) {
    return (
      <EstadoVacio
        titulo="Aún no tienes webs"
        descripcion="Crea una web antes de empezar a escribir tu primer post."
      />
    );
  }

  const mensajeError = creacion.error instanceof ErrorHttp ? creacion.error.message : null;
  const esCargando = creacion.isPending || publicacion.isPending;

  const autorElegido = autoresDisponibles.find((a) => a.id === borrador.autorId);
  const temaElegido = categoriasDisponibles.find((c) => borrador.categoriasIds.includes(c.id));

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* ------------------------------------------------------- cabecera */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <Migajas
            items={[
              { etiqueta: 'Artículos del blog', ruta: '/panel/posts' },
              { etiqueta: 'Nuevo' },
            ]}
          />
          <TituloEditorial nivel={2}>Tu próximo post</TituloEditorial>
        </div>
        <div className="flex items-center gap-3">
          <IndicadorAutosalvado marcaTiempo={marcaTiempo} />
          {confirmandoLimpiar ? (
            <div className="flex items-center gap-2 rounded-suave border border-cinabrio/40 bg-cinabrio/5 px-2.5 py-1.5">
              <span className="text-xs text-grafito">¿Borrar todo lo escrito?</span>
              <button
                type="button"
                onClick={() => {
                  descartarBorrador();
                  asignarConfirmandoLimpiar(false);
                }}
                className="h-7 rounded-suave bg-cinabrio px-2.5 text-xs text-lienzo"
              >
                Sí, borrar
              </button>
              <button
                type="button"
                onClick={() => asignarConfirmandoLimpiar(false)}
                className="h-7 rounded-suave px-2 text-xs text-humo hover:bg-ceniza/40"
              >
                No
              </button>
            </div>
          ) : (
            <Boton
              tono="discreto"
              tamano="compacto"
              type="button"
              onClick={() => asignarConfirmandoLimpiar(true)}
            >
              Empezar de cero
            </Boton>
          )}
        </div>
      </div>

      <BannerSitioDestino
        sitioIdSeleccionado={borrador.sitioId}
        alCambiar={cambiarSitio}
        idiomaSeleccionado={borrador.idioma}
        alCambiarIdioma={(idioma) => cambiarCampo('idioma', idioma)}
      />

      {/* ----------------------------------------------- lo imprescindible */}
      <Lamina className="mt-4 p-4">
        <div className="space-y-3">
          <CampoTexto
            etiqueta="Título"
            value={borrador.titulo}
            onChange={(e) => cambiarCampo('titulo', e.target.value)}
            placeholder="De qué trata el post"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CampoPortada
              valorId={borrador.imagenPortadaId}
              valorUrl={borrador.imagenPortadaUrl}
              alCambiar={(id, url) =>
                asignarBorrador((b) => ({ ...b, imagenPortadaId: id, imagenPortadaUrl: url }))
              }
              sitioId={borrador.sitioId}
            />

            <AreaTexto
              etiqueta="Entradilla"
              value={borrador.resumen}
              onChange={(e) => cambiarCampo('resumen', e.target.value)}
              ayuda="Dos líneas. Es lo que se lee en la lista de artículos."
            />

            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="meta-tipografia">Quién lo firma</span>
                <select
                  value={borrador.autorId}
                  onChange={(e) => cambiarCampo('autorId', e.target.value)}
                  className="h-10 w-full rounded-suave border border-ceniza bg-papel px-3 text-sm text-tinta outline-none focus:border-tinta"
                >
                  <option value="">
                    {consultaAutores.isLoading ? 'Cargando…' : 'Elige una firma'}
                  </option>
                  {autoresDisponibles.map((autor) => (
                    <option key={autor.id} value={autor.id}>
                      {autor.nombre_publico}
                    </option>
                  ))}
                </select>
                {autoresDisponibles.length === 0 && !consultaAutores.isLoading && borrador.sitioCodigo && (
                  <p className="text-xs text-ambar">
                    Esta web no tiene firmas.{' '}
                    <button type="button" onClick={() => navegar('/panel/autores')} className="text-oliva underline">
                      Crear una
                    </button>
                  </p>
                )}
              </div>

              <SelectorMultiple
                etiqueta="Tema"
                opciones={categoriasDisponibles.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
                seleccionados={borrador.categoriasIds}
                alCambiar={(ids) => cambiarCampo('categoriasIds', ids)}
                marcadorVacio={
                  consultaCategorias.isLoading
                    ? 'Cargando…'
                    : borrador.sitioId
                      ? 'Esta web no tiene temas todavía.'
                      : 'Elige una web primero.'
                }
              />
              {borrador.categoriasIds.length === 0 && categoriasDisponibles.length > 0 && (
                <p className="text-xs text-humo">
                  Sin tema, el post no aparece en los filtros del blog.
                </p>
              )}
            </div>
          </div>
        </div>
      </Lamina>

      {/* ------------------------------------------- escribir y ver el post */}
      <div className="mt-4">
        <EditorRico
          valor={borrador.contenido}
          alCambiar={(v) => cambiarCampo('contenido', v)}
          sitioId={borrador.sitioId}
          alPedirPantallaCompleta={() => asignarViendoEntero(true)}
        />
      </div>

      <VistaPostComoSeVera
        abierto={viendoEntero}
        alCerrar={() => asignarViendoEntero(false)}
        titulo={borrador.titulo}
        resumen={borrador.resumen}
        contenido={borrador.contenido}
        urlPortada={borrador.imagenPortadaUrl || null}
        autor={autorElegido?.nombre_publico}
        tema={temaElegido?.nombre}
      />

      {(erroresValidacion || mensajeError) && (
        <div className="mt-4">
          <AvisoError titulo={erroresValidacion ? 'Falta algo' : 'No pudimos guardar'}>
            {erroresValidacion ?? mensajeError ?? ''}
          </AvisoError>
        </div>
      )}

      {/* ------------------------------------------------------- lo de rara vez */}
      <Lamina className="mt-4 overflow-hidden">
        <button
          type="button"
          onClick={() => asignarAjustesAbiertos((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-left transicion-natural hover:bg-ceniza/20"
        >
          <span className="meta-tipografia">Más ajustes</span>
          <span className="text-xs text-humo">
            {ajustesAbiertos ? 'Ocultar' : 'Dirección web, etiquetas y buscadores'}
          </span>
        </button>

        {ajustesAbiertos && (
          <div className="grid grid-cols-1 gap-5 border-t border-ceniza p-5 md:grid-cols-3">
            <CampoTexto
              etiqueta="Nombre para la dirección web"
              value={borrador.slug}
              onChange={(e) => cambiarCampo('slug', generarSlug(e.target.value))}
              ayuda="Lo que va al final de la dirección. Solo minúsculas y guiones."
            />
            <SelectorMultiple
              etiqueta="Etiquetas"
              opciones={etiquetasDisponibles.map((e) => ({ valor: e.id, etiqueta: e.nombre }))}
              seleccionados={borrador.etiquetasIds}
              alCambiar={(ids) => cambiarCampo('etiquetasIds', ids)}
              marcadorVacio={
                consultaEtiquetas.isLoading
                  ? 'Cargando…'
                  : borrador.sitioId
                    ? 'Esta web no tiene etiquetas.'
                    : 'Elige una web primero.'
              }
            />
            <div className="space-y-4">
              <CampoTexto
                etiqueta="Título en Google"
                value={borrador.seoTitulo}
                onChange={(e) => cambiarCampo('seoTitulo', e.target.value)}
                placeholder={borrador.titulo || 'Se usa el título del post'}
              />
              <AreaTexto
                etiqueta="Descripción en Google"
                value={borrador.seoDescripcion}
                onChange={(e) => cambiarCampo('seoDescripcion', e.target.value)}
                placeholder={borrador.resumen || 'Se usa la entradilla'}
              />
            </div>
          </div>
        )}
      </Lamina>

      {/* ------------------------------------------------------------ acciones */}
      <div className="sticky bottom-0 z-20 mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-ceniza bg-lienzo/95 px-1 py-3 backdrop-blur">
        <Boton
          type="button"
          tono="discreto"
          tamano="compacto"
          cargando={esCargando}
          onClick={guardar(false) as unknown as () => void}
        >
          Guardar sin publicar
        </Boton>
        <Boton
          type="button"
          tono="primario"
          tamano="compacto"
          cargando={esCargando}
          onClick={guardar(true) as unknown as () => void}
        >
          Publicar ahora
        </Boton>
      </div>
    </form>
  );
};
