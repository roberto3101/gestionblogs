/**
 * Lista de artículos del blog.
 *
 * La versión anterior tenía un problema serio de manejo: la fila entera era
 * pulsable, pero nada lo indicaba salvo el cursor, no era un enlace de verdad
 * —no se podía abrir en otra pestaña ni con el teclado— y el único botón con
 * nombre era «Eliminar». La acción más destructiva era la única explícita.
 *
 * Ahora el título es un enlace, abrir y ver en la web están a la vista, y
 * borrar pide confirmación sin bloquear el navegador.
 */

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { BuscadorTabla } from '@compartido/interfaz/visualizacion-datos/BuscadorTabla';
import { PaginadorTabla } from '@compartido/interfaz/visualizacion-datos/PaginadorTabla';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { DialogoConfirmacion } from '@compartido/interfaz/retroalimentacion/DialogoConfirmacion';
import { useListarPosts } from '../../ganchos/usePosts';
import { useEliminarPost } from '../../ganchos/useEdicion';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { formatearFecha } from '@compartido/utilidades/formatearFecha';
import { construirUrlPublicaPost } from '@compartido/constantes/sitiosProduccion';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import type { Post } from '../../contratos/post';

const obtenerTonoEstado = (estado: string): 'oliva' | 'ambar' | 'neutro' => {
  if (estado === 'PUBLICADO') return 'oliva';
  if (estado === 'BORRADOR') return 'ambar';
  return 'neutro';
};

/** En pantalla no se enseña PUBLICADO a gritos, sino «Publicado». */
const NOMBRE_ESTADO: Record<string, string> = {
  PUBLICADO: 'Publicado',
  BORRADOR: 'Sin publicar',
  ARCHIVADO: 'Archivado',
};

export const PaginaPosts = () => {
  const { sitioActivo } = useSitioActivo();
  const navegar = useNavigate();
  const [paginacion, asignarPaginacion] = useState<Paginacion>(paginacionInicial);
  const [busqueda, asignarBusqueda] = useState('');
  const [aBorrar, asignarABorrar] = useState<Post | null>(null);
  const consulta = useListarPosts(sitioActivo?.codigo ?? null, paginacion);
  const eliminacion = useEliminarPost();

  const columnas: ColumnaTabla<Post>[] = [
    {
      clave: 'titulo',
      etiqueta: 'Título',
      obtener: (p) => (
        <div onClick={(e) => e.stopPropagation()}>
          {/* Enlace de verdad: se abre con el teclado y en otra pestaña. */}
          <Link
            to={`/panel/posts/${p.id}`}
            className="font-medium text-tinta underline decoration-ceniza decoration-1 underline-offset-2 transicion-natural hover:decoration-tinta"
          >
            {p.titulo}
          </Link>
          <p className="text-xs text-humo font-codigo">{p.slug}</p>
        </div>
      ),
    },
    {
      clave: 'estado',
      etiqueta: 'Estado',
      obtener: (p) => (
        <Etiqueta tono={obtenerTonoEstado(p.estado)}>{NOMBRE_ESTADO[p.estado] ?? p.estado}</Etiqueta>
      ),
    },
    {
      clave: 'idioma',
      etiqueta: 'Idioma',
      obtener: (p) => (
        <span className="text-grafito text-xs">{p.idioma === 'en' ? 'Inglés' : 'Español'}</span>
      ),
    },
    {
      clave: 'publicado',
      etiqueta: 'Publicado',
      obtener: (p) => <span className="text-humo">{formatearFecha(p.publicado_en) || '—'}</span>,
      alineacion: 'derecha',
    },
    {
      clave: 'acciones',
      etiqueta: '',
      obtener: (p) => {
        const urlPublica =
          p.estado === 'PUBLICADO' && sitioActivo
            ? construirUrlPublicaPost(sitioActivo.codigo, p.slug, p.idioma)
            : null;
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Link
              to={`/panel/posts/${p.id}`}
              className="grid h-8 place-items-center rounded-suave border border-ceniza px-2.5 text-xs text-grafito transicion-natural hover:bg-ceniza/40 hover:text-tinta"
            >
              Abrir
            </Link>
            {urlPublica && (
              <a
                href={urlPublica}
                target="_blank"
                rel="noreferrer"
                className="grid h-8 place-items-center rounded-suave border border-ceniza px-2.5 text-xs text-grafito transicion-natural hover:bg-ceniza/40 hover:text-tinta"
                title="Abrir el artículo publicado en la web"
              >
                Ver en la web
              </a>
            )}
            {/* Borrar queda discreto: es lo último que se quiere pulsar sin querer. */}
            <button
              type="button"
              onClick={() => asignarABorrar(p)}
              className="grid h-8 w-8 place-items-center rounded-suave text-humo transicion-natural hover:bg-cinabrio/10 hover:text-cinabrio"
              aria-label={`Borrar ${p.titulo}`}
              title="Borrar"
            >
              ✕
            </button>
          </div>
        );
      },
      anchoMinimo: '220px',
    },
  ];

  const filasFiltradas = useMemo(() => {
    const elementos = consulta.data?.elementos ?? [];
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return elementos;
    return elementos.filter(
      (p) => p.titulo.toLowerCase().includes(texto) || p.slug.toLowerCase().includes(texto),
    );
  }, [consulta.data, busqueda]);

  if (!sitioActivo) {
    return (
      <EstadoVacio titulo="Elige una web" descripcion="Cada artículo pertenece a una web." />
    );
  }

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Blog"
        titulo="Artículos del blog"
        descripcion={`Lo que has escrito para ${sitioActivo.nombre}.`}
        acciones={<Boton onClick={() => navegar('/panel/posts/nuevo')}>Escribir un artículo</Boton>}
      />
      {consulta.isLoading && <Cargando etiqueta="Cargando artículos" />}
      {consulta.data && consulta.data.elementos.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hay artículos"
          descripcion="El primero se escribe en un par de minutos."
          accion={
            <Boton onClick={() => navegar('/panel/posts/nuevo')}>Escribir el primero</Boton>
          }
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <div className="space-y-3">
          <div className="max-w-sm">
            <BuscadorTabla
              valor={busqueda}
              alCambiar={asignarBusqueda}
              marcador="Buscar por título"
            />
          </div>
          <Tabla
            columnas={columnas}
            filas={filasFiltradas}
            obtenerLlave={(p) => p.id}
            alClickear={(p) => navegar(`/panel/posts/${p.id}`)}
          />
          <PaginadorTabla
            pagina={consulta.data.pagina}
            tamanoPagina={consulta.data.tamano_pagina}
            totalFilas={consulta.data.total_filas}
            totalPaginas={consulta.data.total_paginas}
            alCambiarPagina={(pagina) => asignarPaginacion((p) => ({ ...p, pagina }))}
          />
        </div>
      )}

      <DialogoConfirmacion
        abierto={aBorrar !== null}
        titulo="¿Borrar este artículo?"
        mensaje={
          <>
            Se va a quitar <strong>{aBorrar?.titulo}</strong>.
            {aBorrar?.estado === 'PUBLICADO' && (
              <> Está publicado, así que también desaparecerá de la web en la próxima reconstrucción.</>
            )}{' '}
            No se borra del todo: si te arrepientes, se puede recuperar.
          </>
        }
        textoConfirmar="Sí, borrar"
        textoCancelar="No, dejarlo"
        tonoConfirmar="peligro"
        cargando={eliminacion.isPending}
        alConfirmar={() => {
          if (!aBorrar) return;
          eliminacion.mutate(aBorrar.id, { onSettled: () => asignarABorrar(null) });
        }}
        alCancelar={() => asignarABorrar(null)}
      />
    </div>
  );
};
