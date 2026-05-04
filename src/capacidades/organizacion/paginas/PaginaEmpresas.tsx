import { useMemo, useState } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import type { ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { BuscadorTabla } from '@compartido/interfaz/visualizacion-datos/BuscadorTabla';
import { PaginadorTabla } from '@compartido/interfaz/visualizacion-datos/PaginadorTabla';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { formatearFecha } from '@compartido/utilidades/formatearFecha';
import { useListarEmpresas } from '../ganchos/useEmpresas';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import type { Empresa } from '../contratos/empresa';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { useNavigate } from 'react-router-dom';

const columnas: ColumnaTabla<Empresa>[] = [
  { clave: 'razon', etiqueta: 'Razón social', obtener: (e) => <span className="font-medium text-tinta">{e.razon_social}</span> },
  { clave: 'ruc', etiqueta: 'RUC', obtener: (e) => <span className="font-codigo text-xs text-grafito">{e.ruc}</span> },
  { clave: 'estado', etiqueta: 'Estado', obtener: (e) => <Etiqueta tono={e.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{e.estado}</Etiqueta> },
  { clave: 'creado', etiqueta: 'Creada', obtener: (e) => <span className="text-humo">{formatearFecha(e.creado_en)}</span>, alineacion: 'derecha' },
];

export const PaginaEmpresas = () => {
  const [paginacion, asignarPaginacion] = useState<Paginacion>(paginacionInicial);
  const [busqueda, asignarBusqueda] = useState('');
  const consulta = useListarEmpresas(paginacion);
  const navegar = useNavigate();

  const filasFiltradas = useMemo(() => {
    const elementos = consulta.data?.elementos ?? [];
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return elementos;
    return elementos.filter((e) =>
      e.razon_social.toLowerCase().includes(texto) || e.ruc.toLowerCase().includes(texto),
    );
  }, [consulta.data, busqueda]);

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Organización"
        titulo="Empresas"
        descripcion="Cada empresa es un espacio independiente con sus propios sitios, autores y posts."
        acciones={<Boton onClick={() => navegar('/panel/empresas/nueva')}>Nueva empresa</Boton>}
      />
      {consulta.isLoading && <Cargando etiqueta="Cargando empresas" />}
      {consulta.data && consulta.data.elementos.length === 0 && (
        <EstadoVacio
          titulo="Crea tu primera empresa"
          descripcion="Necesitas al menos una empresa para empezar a publicar contenido."
          accion={<Boton onClick={() => navegar('/panel/empresas/nueva')}>Crear empresa</Boton>}
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <div className="space-y-3">
          <div className="max-w-sm">
            <BuscadorTabla valor={busqueda} alCambiar={asignarBusqueda} marcador="Buscar por razón social o RUC" />
          </div>
          <Tabla columnas={columnas} filas={filasFiltradas} obtenerLlave={(e) => e.id} />
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
