import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { BuscadorTabla } from '@compartido/interfaz/visualizacion-datos/BuscadorTabla';
import { PaginadorTabla } from '@compartido/interfaz/visualizacion-datos/PaginadorTabla';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { useListarPosts } from '../../ganchos/usePosts';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { formatearFecha } from '@compartido/utilidades/formatearFecha';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import type { Post } from '../../contratos/post';

const obtenerTonoEstado = (estado: string): 'oliva' | 'ambar' | 'neutro' => {
  if (estado === 'PUBLICADO') return 'oliva';
  if (estado === 'BORRADOR') return 'ambar';
  return 'neutro';
};

const columnas: ColumnaTabla<Post>[] = [
  {
    clave: 'titulo',
    etiqueta: 'Título',
    obtener: (p) => (
      <div>
        <p className="font-medium text-tinta">{p.titulo}</p>
        <p className="text-xs text-humo font-codigo">{p.slug}</p>
      </div>
    ),
  },
  {
    clave: 'estado',
    etiqueta: 'Estado',
    obtener: (p) => <Etiqueta tono={obtenerTonoEstado(p.estado)}>{p.estado}</Etiqueta>,
  },
  {
    clave: 'idioma',
    etiqueta: 'Idioma',
    obtener: (p) => <span className="text-grafito uppercase text-xs">{p.idioma}</span>,
  },
  {
    clave: 'publicado',
    etiqueta: 'Publicado',
    obtener: (p) => <span className="text-humo">{formatearFecha(p.publicado_en)}</span>,
    alineacion: 'derecha',
  },
];

export const PaginaPosts = () => {
  const { sitioActivo } = useSitioActivo();
  const navegar = useNavigate();
  const [paginacion, asignarPaginacion] = useState<Paginacion>(paginacionInicial);
  const [busqueda, asignarBusqueda] = useState('');
  const consulta = useListarPosts(sitioActivo?.codigo ?? null, paginacion);

  const filasFiltradas = useMemo(() => {
    const elementos = consulta.data?.elementos ?? [];
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return elementos;
    return elementos.filter((p) =>
      p.titulo.toLowerCase().includes(texto) || p.slug.toLowerCase().includes(texto),
    );
  }, [consulta.data, busqueda]);

  if (!sitioActivo) {
    return <EstadoVacio titulo="Selecciona un sitio" descripcion="Cada post pertenece a un sitio." />;
  }

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Redacción"
        titulo="Posts"
        descripcion={`Tu redacción del sitio ${sitioActivo.nombre}.`}
        acciones={<Boton onClick={() => navegar('/panel/posts/nuevo')}>Nuevo post</Boton>}
      />
      {consulta.isLoading && <Cargando etiqueta="Cargando posts" />}
      {consulta.data && consulta.data.elementos.length === 0 && (
        <EstadoVacio
          titulo="Aún no has publicado nada"
          descripcion="Tu primer post está a un click."
          accion={<Boton onClick={() => navegar('/panel/posts/nuevo')}>Escribir post</Boton>}
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <div className="space-y-3">
          <div className="max-w-sm">
            <BuscadorTabla valor={busqueda} alCambiar={asignarBusqueda} marcador="Buscar por título o slug" />
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
    </div>
  );
};
