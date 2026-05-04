import { useMemo, useState, type FormEvent } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { BuscadorTabla } from '@compartido/interfaz/visualizacion-datos/BuscadorTabla';
import { PaginadorTabla } from '@compartido/interfaz/visualizacion-datos/PaginadorTabla';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { useListarPermisos, useRegistrarPermiso } from '../ganchos/useGobierno';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import { type Paginacion } from '@compartido/tipos/paginacion';
import type { Permiso } from '../contratos/permiso';

const columnas: ColumnaTabla<Permiso>[] = [
  { clave: 'codigo', etiqueta: 'Código', obtener: (p) => <span className="font-codigo text-xs font-medium text-tinta">{p.codigo}</span> },
  { clave: 'desc', etiqueta: 'Descripción', obtener: (p) => <span className="text-grafito">{p.descripcion}</span> },
  { clave: 'estado', etiqueta: 'Estado', obtener: (p) => <Etiqueta tono={p.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{p.estado}</Etiqueta> },
];

const paginacionInicialPermisos: Paginacion = { pagina: 1, tamano_pagina: 100 };

export const PaginaPermisos = () => {
  const [paginacion, asignarPaginacion] = useState<Paginacion>(paginacionInicialPermisos);
  const [busqueda, asignarBusqueda] = useState('');
  const consulta = useListarPermisos(paginacion);
  const registro = useRegistrarPermiso();
  const [mostrar, asignarMostrar] = useState(false);
  const [codigo, asignarCodigo] = useState('');
  const [descripcion, asignarDescripcion] = useState('');

  const filasFiltradas = useMemo(() => {
    const elementos = consulta.data?.elementos ?? [];
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return elementos;
    return elementos.filter((p) => p.codigo.toLowerCase().includes(texto));
  }, [consulta.data, busqueda]);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    registro.mutate(
      { codigo: codigo.trim().toUpperCase(), descripcion: descripcion.trim() || undefined },
      {
        onSuccess: () => {
          asignarCodigo('');
          asignarDescripcion('');
          asignarMostrar(false);
        },
      },
    );
  };

  const mensajeError = registro.error instanceof ErrorHttp ? registro.error.message : null;

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Gobierno de acceso"
        titulo="Permisos"
        descripcion="Acciones puntuales que se asignan a roles. Crea solo los que necesites."
        acciones={<Boton onClick={() => asignarMostrar((v) => !v)}>{mostrar ? 'Cerrar' : 'Nuevo permiso'}</Boton>}
      />
      {mostrar && (
        <form onSubmit={enviar} className="lamina p-6 mb-6 max-w-2xl space-y-4">
          <CampoTexto
            etiqueta="Código"
            ayuda="MAYUSCULAS_CON_GUION_BAJO. Por ejemplo: POST_AGENDAR"
            value={codigo}
            onChange={(e) => asignarCodigo(e.target.value)}
            required
            placeholder="POST_AGENDAR"
          />
          <AreaTexto
            etiqueta="Descripción"
            value={descripcion}
            onChange={(e) => asignarDescripcion(e.target.value)}
          />
          {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
          <Boton type="submit" cargando={registro.isPending}>Crear permiso</Boton>
        </form>
      )}
      {consulta.isLoading && <Cargando etiqueta="Cargando permisos" />}
      {consulta.data && (
        <div className="space-y-3">
          <div className="max-w-sm">
            <BuscadorTabla valor={busqueda} alCambiar={asignarBusqueda} marcador="Buscar por código" />
          </div>
          <Tabla columnas={columnas} filas={filasFiltradas} obtenerLlave={(p) => p.id} />
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
