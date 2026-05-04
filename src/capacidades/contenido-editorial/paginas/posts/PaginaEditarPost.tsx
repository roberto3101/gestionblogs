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
import { EditorMarkdownDual } from '../../componentes/editor/EditorMarkdownDual';
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
  const categorias = useListarCategorias(sitio?.codigo ?? null);
  const etiquetas = useListarEtiquetas(sitio?.codigo ?? null);

  const [titulo, asignarTitulo] = useState('');
  const [slug, asignarSlug] = useState('');
  const [resumen, asignarResumen] = useState('');
  const [contenido, asignarContenido] = useState('');
  const [autorId, asignarAutorId] = useState<Identificador | ''>('');
  const [seoTitulo, asignarSeoTitulo] = useState('');
  const [seoDescripcion, asignarSeoDescripcion] = useState('');
  const [categoriasIds, asignarCategoriasIds] = useState<string[]>([]);
  const [etiquetasIds, asignarEtiquetasIds] = useState<string[]>([]);
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
  }, [post]);

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
      });
      if (categoriasIds.length > 0 || categoriasIds.length === 0) {
        await editarCategorias.mutateAsync({ categorias_ids: categoriasIds });
      }
      if (etiquetasIds.length > 0 || etiquetasIds.length === 0) {
        await editarEtiquetas.mutateAsync({ etiquetas_ids: etiquetasIds });
      }
      asignarMarcaTiempoLocal(new Date().toISOString());
    } catch {}
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
    if (!window.confirm('¿Eliminar este post? Esta acción es lógica (se puede recuperar).')) return;
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
              { etiqueta: 'Redacción', ruta: '/panel/posts' },
              { etiqueta: 'Posts', ruta: '/panel/posts' },
              { etiqueta: titulo || 'Editar' },
            ]}
          />
          <TituloEditorial nivel={2}>Editar post</TituloEditorial>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <IndicadorAutosalvado marcaTiempo={marcaTiempoLocal} />
          <Boton tono="discreto" tamano="compacto" onClick={() => navegar(`/panel/posts/${post.id}`)}>
            Volver al detalle
          </Boton>
          <Boton tono="peligro" tamano="compacto" cargando={eliminacion.isPending} onClick={eliminarYVolver}>
            Eliminar
          </Boton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        <div className="space-y-4">
          <CampoTexto etiqueta="Título" value={titulo} onChange={(e) => asignarTitulo(e.target.value)} />
          <EditorMarkdownDual valor={contenido} alCambiar={asignarContenido} titulo={titulo} resumen={resumen} />
          {mensajeError && <AvisoError titulo="No pudimos guardar">{mensajeError}</AvisoError>}
        </div>

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
              etiqueta="Slug"
              value={slug}
              onChange={(e) => asignarSlug(generarSlug(e.target.value))}
              ayuda="Aparece en la URL pública."
            />
            <AreaTexto etiqueta="Resumen" value={resumen} onChange={(e) => asignarResumen(e.target.value)} />
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
            <CampoTexto etiqueta="Título SEO" value={seoTitulo} onChange={(e) => asignarSeoTitulo(e.target.value)} placeholder={titulo} />
            <AreaTexto etiqueta="Descripción SEO" value={seoDescripcion} onChange={(e) => asignarSeoDescripcion(e.target.value)} placeholder={resumen} />
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
    </div>
  );
};
