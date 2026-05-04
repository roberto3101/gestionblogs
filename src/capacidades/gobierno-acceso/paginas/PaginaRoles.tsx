import { useMemo, useState, type FormEvent } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { BuscadorTabla } from '@compartido/interfaz/visualizacion-datos/BuscadorTabla';
import { PaginadorTabla } from '@compartido/interfaz/visualizacion-datos/PaginadorTabla';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { useListarRoles, useRegistrarRol } from '../ganchos/useGobierno';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import type { Rol } from '../contratos/rol';

const columnas: ColumnaTabla<Rol>[] = [
  { clave: 'nombre', etiqueta: 'Nombre', obtener: (r) => <span className="font-medium text-tinta">{r.nombre}</span> },
  { clave: 'desc', etiqueta: 'Descripción', obtener: (r) => <span className="text-grafito">{r.descripcion}</span> },
  { clave: 'estado', etiqueta: 'Estado', obtener: (r) => <Etiqueta tono={r.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{r.estado}</Etiqueta> },
];

export const PaginaRoles = () => {
  const [paginacion, asignarPaginacion] = useState<Paginacion>(paginacionInicial);
  const [busqueda, asignarBusqueda] = useState('');
  const consulta = useListarRoles(paginacion);
  const registro = useRegistrarRol();
  const [mostrar, asignarMostrar] = useState(false);
  const [nombre, asignarNombre] = useState('');
  const [descripcion, asignarDescripcion] = useState('');

  const filasFiltradas = useMemo(() => {
    const elementos = consulta.data?.elementos ?? [];
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return elementos;
    return elementos.filter((r) => r.nombre.toLowerCase().includes(texto));
  }, [consulta.data, busqueda]);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    registro.mutate(
      { nombre: nombre.trim().toUpperCase(), descripcion: descripcion.trim() || undefined },
      {
        onSuccess: () => {
          asignarNombre('');
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
        titulo="Roles"
        descripcion="Conjuntos de permisos. Cada usuario tiene un rol dentro de cada empresa."
        acciones={<Boton onClick={() => asignarMostrar((v) => !v)}>{mostrar ? 'Cerrar' : 'Nuevo rol'}</Boton>}
      />
      {mostrar && (
        <form onSubmit={enviar} className="lamina p-6 mb-6 max-w-2xl space-y-4">
          <CampoTexto
            etiqueta="Nombre"
            ayuda="En MAYUSCULAS_CON_GUION_BAJO"
            value={nombre}
            onChange={(e) => asignarNombre(e.target.value)}
            required
            placeholder="REDACTOR_INVITADO"
          />
          <AreaTexto
            etiqueta="Descripción"
            value={descripcion}
            onChange={(e) => asignarDescripcion(e.target.value)}
            placeholder="¿Qué puede hacer alguien con este rol?"
          />
          {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
          <Boton type="submit" cargando={registro.isPending}>Crear rol</Boton>
        </form>
      )}
      {consulta.isLoading && <Cargando etiqueta="Cargando roles" />}
      {consulta.data && consulta.data.elementos.length === 0 && !mostrar && (
        <EstadoVacio titulo="Sin roles registrados" />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <div className="space-y-3">
          <div className="max-w-sm">
            <BuscadorTabla valor={busqueda} alCambiar={asignarBusqueda} marcador="Buscar por nombre" />
          </div>
          <Tabla columnas={columnas} filas={filasFiltradas} obtenerLlave={(r) => r.id} />
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
