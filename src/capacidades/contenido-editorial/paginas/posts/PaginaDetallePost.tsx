import { useParams, Link, useNavigate } from 'react-router-dom';
import { TituloEditorial } from '@compartido/interfaz/primitivas/TituloEditorial';
import { Migajas } from '@compartido/interfaz/primitivas/Migajas';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { Lamina } from '@compartido/interfaz/primitivas/Lamina';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { useObtenerPost, usePublicarPost } from '../../ganchos/usePosts';
import { useListarSitios } from '../../ganchos/useSitios';
import { renderizarMarkdownLigero } from '@compartido/utilidades/renderizadorMarkdown';
import { formatearFecha } from '@compartido/utilidades/formatearFecha';
import { construirUrlPublicaPost } from '@compartido/constantes/sitiosProduccion';

const claseEstiloPreview = [
  'prose-editorial text-tinta leading-relaxed',
  '[&_h1]:titulo-editorial [&_h1]:text-3xl [&_h1]:mb-4',
  '[&_h2]:titulo-editorial [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3',
  '[&_h3]:titulo-editorial [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2',
  '[&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_li]:mb-1',
  '[&_a]:text-oliva [&_a]:underline',
].join(' ');

export const PaginaDetallePost = () => {
  const { postId } = useParams<{ postId: string }>();
  const navegar = useNavigate();
  const consulta = useObtenerPost(postId ?? null);
  const publicacion = usePublicarPost();
  const sitios = useListarSitios();

  if (consulta.isLoading) return <Cargando etiqueta="Cargando post" />;
  if (consulta.isError) {
    return (
      <div className="space-y-4">
        <Link to="/panel/posts" className="meta-tipografia hover:text-tinta">← Volver a posts</Link>
        <AvisoError titulo="No pudimos cargar el post">
          {consulta.error instanceof Error ? consulta.error.message : 'Error desconocido'}
        </AvisoError>
      </div>
    );
  }
  if (!consulta.data) return null;
  const post = consulta.data;
  const sitio = sitios.data?.elementos.find((s) => s.id === post.sitio_id) ?? null;
  const urlProduccion = sitio ? construirUrlPublicaPost(sitio.codigo, post.slug, post.idioma) : null;

  const tonoEstado = post.estado === 'PUBLICADO' ? 'oliva' : post.estado === 'BORRADOR' ? 'ambar' : 'neutro';

  return (
    <article>
      <div className="mb-6">
        <div className="mb-3">
          <Migajas items={[{ etiqueta: 'Redacción', ruta: '/panel/posts' }, { etiqueta: 'Posts', ruta: '/panel/posts' }, { etiqueta: post.titulo }]} />
        </div>
        <div className="flex items-start justify-between gap-6 pb-6 filete-bajo flex-wrap">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <Etiqueta tono={tonoEstado}>{post.estado}</Etiqueta>
              <span className="meta-tipografia">{post.idioma.toUpperCase()}</span>
              {sitio && (
                <span className="meta-tipografia">· {sitio.nombre} ({sitio.codigo})</span>
              )}
            </div>
            <TituloEditorial nivel={1}>{post.titulo}</TituloEditorial>
            {post.resumen && <p className="text-grafito text-base">{post.resumen}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {post.estado === 'PUBLICADO' && urlProduccion && (
              <a
                href={urlProduccion}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center h-10 px-4 text-sm rounded-suave border border-ceniza hover:border-grafito text-tinta transicion-natural"
              >
                Ver en producción ↗
              </a>
            )}
            {post.estado === 'BORRADOR' && (
              <Boton onClick={() => publicacion.mutate(post.id)} cargando={publicacion.isPending}>
                Publicar
              </Boton>
            )}
            <Boton tono="discreto" onClick={() => navegar(`/panel/posts/${post.id}/editar`)}>
              Editar
            </Boton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6">
        <Lamina className="p-8">
          <div
            className={claseEstiloPreview}
            dangerouslySetInnerHTML={{ __html: renderizarMarkdownLigero(post.contenido) }}
          />
        </Lamina>
        <aside className="space-y-3">
          <Lamina className="p-5 space-y-3">
            <p className="meta-tipografia">Metadatos</p>
            <div className="text-sm space-y-2">
              <p><span className="text-humo">Slug:</span> <span className="font-codigo text-xs text-grafito break-all">{post.slug}</span></p>
              <p><span className="text-humo">Creado:</span> {formatearFecha(post.creado_en)}</p>
              <p><span className="text-humo">Publicado:</span> {formatearFecha(post.publicado_en)}</p>
              {post.formato_contenido && (
                <p><span className="text-humo">Formato:</span> {post.formato_contenido}</p>
              )}
            </div>
          </Lamina>
          {(post.seo_titulo || post.seo_descripcion) && (
            <Lamina className="p-5 space-y-3">
              <p className="meta-tipografia">SEO</p>
              <div className="text-sm space-y-2">
                {post.seo_titulo && (
                  <p><span className="text-humo block mb-1">Título:</span><span className="text-tinta">{post.seo_titulo}</span></p>
                )}
                {post.seo_descripcion && (
                  <p><span className="text-humo block mb-1">Descripción:</span><span className="text-tinta">{post.seo_descripcion}</span></p>
                )}
              </div>
            </Lamina>
          )}
        </aside>
      </div>
    </article>
  );
};
