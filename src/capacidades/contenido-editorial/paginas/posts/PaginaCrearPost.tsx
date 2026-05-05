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
import { useBorradorAutosalvado } from '@compartido/biblioteca/useBorradorAutosalvado';
import { generarSlug } from '@compartido/utilidades/generarSlug';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import { EditorMarkdownDual } from '../../componentes/editor/EditorMarkdownDual';
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
  seoTitulo: string;
  seoDescripcion: string;
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
  seoTitulo: '',
  seoDescripcion: '',
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

  const cambiarSitio = (id: Identificador, sitio: Sitio | null) => {
    asignarBorrador((b) => ({ ...b, sitioId: id, sitioCodigo: sitio?.codigo ?? '', autorId: '' }));
  };

  const cambiarCampo = <K extends keyof BorradorPost>(campo: K, valor: BorradorPost[K]) => {
    asignarBorrador((b) => ({ ...b, [campo]: valor }));
  };

  const validar = (): string | null => {
    if (!borrador.sitioId) return 'Selecciona un sitio destino.';
    if (!borrador.autorId) return 'Selecciona un autor.';
    if (!borrador.titulo.trim()) return 'El título no puede estar vacío.';
    if (!borrador.slug.trim()) return 'El slug no puede estar vacío.';
    if (!borrador.contenido.trim()) return 'Escribe algo de contenido antes de guardar.';
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
        seo_titulo: borrador.seoTitulo.trim() || undefined,
        seo_descripcion: borrador.seoDescripcion.trim() || undefined,
      });
      if (publicarTrasGuardar) {
        await publicacion.mutateAsync(post.id);
        const urlPublica = construirUrlPublicaPost(borrador.sitioCodigo, borrador.slug, borrador.idioma);
        if (urlPublica) {
          publicar({ tono: 'exito', titulo: 'Publicado en producción', detalle: urlPublica });
        }
      }
      descartarBorrador();
      navegar(`/panel/posts/${post.id}`);
    } catch {}
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
        titulo="Aún no tienes sitios"
        descripcion="Crea un sitio antes de empezar a escribir tu primer post."
      />
    );
  }

  const mensajeError = creacion.error instanceof ErrorHttp ? creacion.error.message : null;
  const esCargando = creacion.isPending || publicacion.isPending;

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="flex items-end justify-between mb-6 gap-4">
        <div className="space-y-1.5">
          <Migajas items={[{ etiqueta: 'Redacción', ruta: '/panel/posts' }, { etiqueta: 'Posts', ruta: '/panel/posts' }, { etiqueta: 'Nuevo post' }]} />
          <TituloEditorial nivel={2}>
            Tu próximo post
          </TituloEditorial>
        </div>
        <div className="flex items-center gap-3">
          <IndicadorAutosalvado marcaTiempo={marcaTiempo} />
          <Boton
            tono="discreto"
            tamano="compacto"
            type="button"
            onClick={() => {
              if (window.confirm('¿Descartar el borrador? Se perderán todos los cambios no publicados.')) {
                descartarBorrador();
              }
            }}
          >
            Limpiar borrador
          </Boton>
        </div>
      </div>

      <BannerSitioDestino
        sitioIdSeleccionado={borrador.sitioId}
        alCambiar={cambiarSitio}
        idiomaSeleccionado={borrador.idioma}
        alCambiarIdioma={(idioma) => cambiarCampo('idioma', idioma)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        <div className="space-y-4">
          <CampoTexto
            etiqueta="Título"
            value={borrador.titulo}
            onChange={(e) => cambiarCampo('titulo', e.target.value)}
            placeholder="Tu título aquí"
          />
          <EditorMarkdownDual
            valor={borrador.contenido}
            alCambiar={(v) => cambiarCampo('contenido', v)}
            titulo={borrador.titulo}
            resumen={borrador.resumen}
            sitioId={borrador.sitioId}
          />
          {(erroresValidacion || mensajeError) && (
            <AvisoError titulo={erroresValidacion ? 'Falta algo' : 'No pudimos guardar'}>
              {erroresValidacion ?? mensajeError ?? ''}
            </AvisoError>
          )}
        </div>

        <aside className="space-y-4">
          <Lamina className="p-5 space-y-4">
            <p className="meta-tipografia">Detalles</p>
            <div className="space-y-1.5">
              <span className="meta-tipografia">Autor</span>
              <select
                value={borrador.autorId}
                onChange={(e) => cambiarCampo('autorId', e.target.value)}
                className="w-full bg-papel border border-ceniza rounded-suave outline-none text-sm text-tinta h-10 px-3 focus:border-tinta"
              >
                <option value="">
                  {consultaAutores.isLoading ? 'Cargando autores…' : 'Selecciona un autor'}
                </option>
                {autoresDisponibles.map((autor) => (
                  <option key={autor.id} value={autor.id}>
                    {autor.nombre_publico}
                  </option>
                ))}
              </select>
              {autoresDisponibles.length === 0 && !consultaAutores.isLoading && borrador.sitioCodigo && (
                <p className="text-xs text-ambar">
                  No hay autores en este sitio.{' '}
                  <button
                    type="button"
                    onClick={() => navegar('/panel/autores')}
                    className="text-oliva underline"
                  >
                    Crear uno
                  </button>
                </p>
              )}
            </div>
            <CampoTexto
              etiqueta="Slug"
              value={borrador.slug}
              onChange={(e) => cambiarCampo('slug', generarSlug(e.target.value))}
              ayuda="Aparece en la URL pública."
            />
            <AreaTexto
              etiqueta="Resumen"
              value={borrador.resumen}
              onChange={(e) => cambiarCampo('resumen', e.target.value)}
              ayuda="2 líneas que aparecen en listados."
            />
          </Lamina>

          <Lamina className="p-5 space-y-4">
            <p className="meta-tipografia">SEO</p>
            <CampoTexto
              etiqueta="Título SEO"
              value={borrador.seoTitulo}
              onChange={(e) => cambiarCampo('seoTitulo', e.target.value)}
              placeholder={borrador.titulo}
            />
            <AreaTexto
              etiqueta="Descripción SEO"
              value={borrador.seoDescripcion}
              onChange={(e) => cambiarCampo('seoDescripcion', e.target.value)}
              placeholder={borrador.resumen}
            />
          </Lamina>

          <div className="space-y-2 sticky bottom-4">
            <Boton type="button" tono="primario" tamano="amplio" cargando={esCargando} onClick={guardar(true) as unknown as () => void} className="w-full">
              Publicar ahora
            </Boton>
            <Boton type="button" tono="discreto" tamano="amplio" cargando={esCargando} onClick={guardar(false) as unknown as () => void} className="w-full">
              Guardar borrador
            </Boton>
          </div>
        </aside>
      </div>
    </form>
  );
};
