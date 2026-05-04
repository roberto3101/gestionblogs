import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { BuscadorTabla } from '@compartido/interfaz/visualizacion-datos/BuscadorTabla';
import { PaginadorTabla } from '@compartido/interfaz/visualizacion-datos/PaginadorTabla';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { formatearFecha } from '@compartido/utilidades/formatearFecha';
import { useListarSitios } from '../../ganchos/useSitios';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import type { Sitio } from '../../contratos/sitio';

const columnas: ColumnaTabla<Sitio>[] = [
  { clave: 'nombre', etiqueta: 'Sitio', obtener: (s) => (
    <div>
      <p className="font-medium text-tinta">{s.nombre}</p>
      <p className="text-xs text-humo">{s.dominio}</p>
    </div>
  )},
  { clave: 'codigo', etiqueta: 'Código', obtener: (s) => <span className="font-codigo text-xs text-grafito">{s.codigo}</span> },
  { clave: 'idioma', etiqueta: 'Idioma', obtener: (s) => <Etiqueta>{s.idioma_default}</Etiqueta> },
  { clave: 'estado', etiqueta: 'Estado', obtener: (s) => <Etiqueta tono={s.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{s.estado}</Etiqueta> },
  { clave: 'creado', etiqueta: 'Creado', obtener: (s) => <span className="text-humo">{formatearFecha(s.creado_en)}</span>, alineacion: 'derecha' },
];

export const PaginaSitios = () => {
  const [paginacion, asignarPaginacion] = useState<Paginacion>(paginacionInicial);
  const [busqueda, asignarBusqueda] = useState('');
  const consulta = useListarSitios(paginacion);
  const navegar = useNavigate();

  const filasFiltradas = useMemo(() => {
    const elementos = consulta.data?.elementos ?? [];
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return elementos;
    return elementos.filter((s) =>
      s.nombre.toLowerCase().includes(texto) || s.codigo.toLowerCase().includes(texto),
    );
  }, [consulta.data, busqueda]);

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Estructura"
        titulo="Sitios"
        descripcion="Cada sitio agrupa posts, categorías, etiquetas y autores con su propio dominio."
        acciones={<Boton onClick={() => navegar('/panel/sitios/nuevo')}>Nuevo sitio</Boton>}
      />
      {consulta.isLoading && <Cargando etiqueta="Cargando sitios" />}
      {consulta.data && consulta.data.elementos.length === 0 && (
        <EstadoVacio
          titulo="Tu primer sitio"
          descripcion="Un sitio es donde viven tus posts. Necesitas al menos uno antes de publicar."
          accion={<Boton onClick={() => navegar('/panel/sitios/nuevo')}>Crear sitio</Boton>}
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <div className="space-y-3">
          <div className="max-w-sm">
            <BuscadorTabla valor={busqueda} alCambiar={asignarBusqueda} marcador="Buscar por nombre o código" />
          </div>
          <Tabla columnas={columnas} filas={filasFiltradas} obtenerLlave={(s) => s.id} />
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
