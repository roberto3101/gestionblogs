import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { Lamina } from '@compartido/interfaz/primitivas/Lamina';
import { TituloEditorial } from '@compartido/interfaz/primitivas/TituloEditorial';
import { Migajas } from '@compartido/interfaz/primitivas/Migajas';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { IndicadorAutosalvado } from '@compartido/interfaz/retroalimentacion/IndicadorAutosalvado';
import { useNotificaciones } from '@plataforma/gobierno/errores/contextoNotificaciones';
import { useObtenerPost, usePublicarPost } from '../../ganchos/usePosts';
import { useEditarPost, useEliminarPost, useReemplazarCategoriasPost, useReemplazarEtiquetasPost } from '../../ganchos/useEdicion';
import { useListarAutores } from '../../ganchos/useAutores';
import { useListarCategorias } from '../../ganchos/useCategorias';
import { useListarEtiquetas } from '../../ganchos/useEtiquetas';
import { useListarSitios } from '../../ganchos/useSitios';
import { generarSlug } from '@compartido/utilidades/generarSlug';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import { EditorRico } from '../../componentes/editor/EditorRico';
import { VistaPostComoSeVera } from '../../componentes/editor/VistaPostComoSeVera';
import { CampoPortada } from '../../componentes/editor/CampoPortada';
import { DialogoConfirmacion } from '@compartido/interfaz/retroalimentacion/DialogoConfirmacion';
import { SelectorMultiple } from '../../componentes/editor/SelectorMultiple';
import { construirUrlPublicaPost } from '@compartido/constantes/sitiosProduccion';
import type { Identificador } from '@compartido/tipos/identificador';

export const PaginaEditarPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const navegar = useNavigate();
  const { publicar } = useNotificaciones();

  const consulta = useObtenerPost(postId ?? null);
  const sitios = useListarSitios();
  const edicion = useEditarPost(postId ?? null);
  const eliminacion = useEliminarPost();
  const publicacion = usePublicarPost();
  const editarCategorias = useReemplazarCategoriasPost(postId ?? null);
  const editarEtiquetas = useReemplazarEtiquetasPost(postId ?? null);

  const post = consulta.data;
  const sitio = post ? sitios.data?.elementos.find((s) => s.id === post.sitio_id) ?? null : null;
  const autores = useListarAutores(sitio?.codigo ?? null);
  const categorias = useListarCategorias(sitio?.id ?? null);
  const etiquetas = useListarEtiquetas(sitio?.id ?? null);

  const [titulo, asignarTitulo] = useState('');
  const [slug, asignarSlug] = useState('');
  const [resumen, asignarResumen] = useState('');
  const [contenido, asignarContenido] = useState('');
  const [autorId, asignarAutorId] = useState<Identificador | ''>('');
  const [seoTitulo, asignarSeoTitulo] = useState('');
  const [seoDescripcion, asignarSeoDescripcion] = useState('');
  const [categoriasIds, asignarCategoriasIds] = useState<string[]>([]);
  const [etiquetasIds, asignarEtiquetasIds] = useState<string[]>([]);
  const [portadaId, asignarPortadaId] = useState<Identificador | ''>('');
  const [portadaUrl, asignarPortadaUrl] = useState('');
  const [confirmandoBorrar, asignarConfirmandoBorrar] = useState(false);
  const [viendoEntero, asignarViendoEntero] = useState(false);
  const [marcaTiempoLocal, asignarMarcaTiempoLocal] = useState<string | null>(null);

  useEffect(() => {
    if (!post) return;
    asignarTitulo(post.titulo);
    asignarSlug(post.slug);
    asignarResumen(post.resumen ?? '');
    asignarContenido(post.contenido);
    asignarAutorId(post.autor_id);
    asignarSeoTitulo(post.seo_titulo ?? '');
    asignarSeoDescripcion(post.seo_descripcion ?? '');
    asignarPortadaId(post.imagen_portada_id ?? '');
    // La ficha de administracion devuelve el id de la portada, no su
    // direccion, asi que aqui no siempre se puede ensenar la miniatura.
    asignarPortadaUrl((post as { imagen_portada?: { url?: string } }).imagen_portada?.url ?? '');
  }, [post]);

  // Mapea {nombre,slug} (lo que devuelve la API) -> IDs (lo que usa el SelectorMultiple)
  // cuando termina de cargar el listado de categorías/etiquetas del sitio.
  useEffect(() => {
    if (!post?.categorias || !categorias.data) return;
    const slugs = new Set(post.categorias.map((c) => c.slug));
    const ids = (categorias.data.elementos ?? []).filter((c) => slugs.has(c.slug)).map((c) => c.id);
    asignarCategoriasIds(ids);
  }, [post?.categorias, categorias.data]);

  useEffect(() => {
    if (!post?.etiquetas || !etiquetas.data) return;
    const slugs = new Set(post.etiquetas.map((e) => e.slug));
    const ids = (etiquetas.data.elementos ?? []).filter((e) => slugs.has(e.slug)).map((e) => e.id);
    asignarEtiquetasIds(ids);
  }, [post?.etiquetas, etiquetas.data]);

  if (consulta.isLoading) return <Cargando etiqueta="Cargando post" />;
  if (consulta.isError || !post) {
    return (
      <div className="space-y-4">
        <Link to="/panel/posts" className="meta-tipografia hover:text-tinta">← Volver a posts</Link>
        <AvisoError titulo="No pudimos cargar el post">
          {consulta.error instanceof Error ? consulta.error.message : 'Post no encontrado'}
        </AvisoError>
      </div>
    );
  }

  const guardarCambios = async () => {
    try {
      await edicion.mutateAsync({
        titulo: titulo.trim(),
        slug: slug.trim(),
        resumen: resumen.trim(),
        contenido,
        autor_id: (autorId || undefined) as Identificador | undefined,
        seo_titulo: seoTitulo.trim(),
        seo_descripcion: seoDescripcion.trim(),
        // null quita la portada; undefined la dejaria como estaba.
        imagen_portada_id: (portadaId || null) as Identificador | null,
      });
      // Se envian siempre, tambien vacias: es como se quita un tema.
      await editarCategorias.mutateAsync({ categorias_ids: categoriasIds });
      await editarEtiquetas.mutateAsync({ etiquetas_ids: etiquetasIds });
      asignarMarcaTiempoLocal(new Date().toISOString());
    } catch (error) {
      // Antes este catch estaba vacio: si fallaba al asignar el tema, el post
      // se quedaba guardado sin el y nadie se enteraba.
      publicar({
        tono: 'error',
        titulo: 'No se pudo guardar todo',
        detalle: error instanceof Error ? error.message : 'Vuelve a intentarlo.',
      });
      throw error;
    }
  };

  const publicarAhora = async () => {
    await guardarCambios();
    await publicacion.mutateAsync(post.id);
    if (sitio) {
      const url = construirUrlPublicaPost(sitio.codigo, slug, post.idioma);
      if (url) publicar({ tono: 'exito', titulo: 'Publicado en producción', detalle: url });
    }
  };

  const eliminarYVolver = async () => {
    await eliminacion.mutateAsync(post.id);
    navegar('/panel/posts', { replace: true });
  };

  const cargando = edicion.isPending || publicacion.isPending || editarCategorias.isPending || editarEtiquetas.isPending;
  const mensajeError = edicion.error instanceof ErrorHttp ? edicion.error.message : null;

  return (
    <div>
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div className="space-y-1.5 min-w-0">
          <Migajas
            items={[
                            { etiqueta: 'Artículos del blog', ruta: '/panel/posts' },
              { etiqueta: titulo || 'Editar' },
            ]}
          />
          <TituloEditorial nivel={2}>Editar el artículo</TituloEditorial>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <IndicadorAutosalvado marcaTiempo={marcaTiempoLocal} />
          <Boton tono="discreto" tamano="compacto" onClick={() => navegar(`/panel/posts/${post.id}`)}>
            Ver la ficha
          </Boton>
          <Boton tono="peligro" tamano="compacto" cargando={eliminacion.isPending} onClick={() => asignarConfirmandoBorrar(true)}>
            Eliminar
          </Boton>
        </div>
      </div>

      <Lamina className="mb-4 p-5 space-y-4">
        <CampoTexto etiqueta="Título" value={titulo} onChange={(e) => asignarTitulo(e.target.value)} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <CampoPortada
            valorId={portadaId}
            valorUrl={portadaUrl}
            alCambiar={(id, url) => {
              asignarPortadaId(id);
              asignarPortadaUrl(url);
            }}
            sitioId={post.sitio_id}
          />
          <AreaTexto
            etiqueta="Entradilla"
            value={resumen}
            onChange={(e) => asignarResumen(e.target.value)}
            ayuda="Dos líneas. Es lo que se lee en la lista de artículos."
          />
        </div>
      </Lamina>

      <div className="mb-4">
        <EditorRico
          valor={contenido}
          alCambiar={asignarContenido}
          sitioId={post.sitio_id}
          alPedirPantallaCompleta={() => asignarViendoEntero(true)}
        />
        <VistaPostComoSeVera
          abierto={viendoEntero}
          alCerrar={() => asignarViendoEntero(false)}
          titulo={titulo}
          resumen={resumen}
          contenido={contenido}
          urlPortada={portadaUrl || null}
          autor={autores.data?.elementos.find((a) => a.id === autorId)?.nombre_publico}
          tema={categorias.data?.elementos.find((c) => categoriasIds.includes(c.id))?.nombre}
        />
        {mensajeError && <div className="mt-4"><AvisoError titulo="No pudimos guardar">{mensajeError}</AvisoError></div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        <div />

        <aside className="space-y-4">
          <Lamina className="p-5 space-y-4">
            <p className="meta-tipografia">Detalles</p>
            <div className="space-y-1.5">
              <span className="meta-tipografia">Autor</span>
              <select
                value={autorId}
                onChange={(e) => asignarAutorId(e.target.value)}
                className="w-full bg-papel border border-ceniza rounded-suave outline-none text-sm text-tinta h-10 px-3 focus:border-tinta"
              >
                <option value="">Sin autor</option>
                {(autores.data?.elementos ?? []).map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre_publico}</option>
                ))}
              </select>
            </div>
            <CampoTexto
              etiqueta="Nombre para la dirección web"
              value={slug}
              onChange={(e) => asignarSlug(generarSlug(e.target.value))}
              ayuda="Así se verá al final de la dirección. Solo minúsculas y guiones."
            />
          </Lamina>

          <Lamina className="p-5 space-y-4">
            <SelectorMultiple
              etiqueta="Categorías"
              opciones={(categorias.data?.elementos ?? []).map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
              seleccionados={categoriasIds}
              alCambiar={asignarCategoriasIds}
              marcadorVacio="Sin categorías en este sitio"
            />
            <SelectorMultiple
              etiqueta="Etiquetas"
              opciones={(etiquetas.data?.elementos ?? []).map((e) => ({ valor: e.id, etiqueta: e.nombre }))}
              seleccionados={etiquetasIds}
              alCambiar={asignarEtiquetasIds}
              marcadorVacio="Sin etiquetas en este sitio"
            />
          </Lamina>

          <Lamina className="p-5 space-y-4">
            <p className="meta-tipografia">SEO</p>
            <CampoTexto etiqueta="Título en Google" value={seoTitulo} onChange={(e) => asignarSeoTitulo(e.target.value)} placeholder={titulo} />
            <AreaTexto etiqueta="Descripción en Google" value={seoDescripcion} onChange={(e) => asignarSeoDescripcion(e.target.value)} placeholder={resumen} />
          </Lamina>

          <div className="space-y-2 sticky bottom-4">
            <Boton tono="primario" tamano="amplio" cargando={cargando} onClick={publicarAhora} className="w-full">
              {post.estado === 'PUBLICADO' ? 'Guardar y republicar' : 'Guardar y publicar'}
            </Boton>
            <Boton tono="discreto" tamano="amplio" cargando={cargando} onClick={guardarCambios} className="w-full">
              Guardar cambios
            </Boton>
          </div>
        </aside>
      </div>

      <DialogoConfirmacion
        abierto={confirmandoBorrar}
        titulo="¿Borrar este artículo?"
        mensaje={
          <>
            Se va a quitar <strong>{post.titulo}</strong>. No se borra del todo: si te
            arrepientes, se puede recuperar.
          </>
        }
        textoConfirmar="Sí, borrar"
        textoCancelar="No, dejarlo"
        tonoConfirmar="peligro"
        cargando={eliminacion.isPending}
        alConfirmar={() => {
          asignarConfirmandoBorrar(false);
          void eliminarYVolver();
        }}
        alCancelar={() => asignarConfirmandoBorrar(false)}
      />
    </div>
  );
};
