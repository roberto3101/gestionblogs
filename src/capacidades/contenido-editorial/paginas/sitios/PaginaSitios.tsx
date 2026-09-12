import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { TablaResponsiva } from '@compartido/interfaz/visualizacion-datos/TablaResponsiva';
import { TabsEstado } from '@compartido/interfaz/visualizacion-datos/TabsEstado';
import { DialogoConfirmacion } from '@compartido/interfaz/retroalimentacion/DialogoConfirmacion';
import { BuscadorTabla } from '@compartido/interfaz/visualizacion-datos/BuscadorTabla';
import { PaginadorTabla } from '@compartido/interfaz/visualizacion-datos/PaginadorTabla';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { formatearFecha } from '@compartido/utilidades/formatearFecha';
import {
  useCambiarEstadoSitio,
  useEditarSitio,
  useEliminarSitio,
  useListarSitios,
} from '../../ganchos/useSitios';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import type { Sitio } from '../../contratos/sitio';

type Vista = 'ACTIVO' | 'INACTIVO';

interface FormularioEdicion {
  abierto: boolean;
  sitio: Sitio | null;
  nombre: string;
  dominio: string;
  descripcion: string;
  idioma_default: string;
}

const formularioVacio: FormularioEdicion = {
  abierto: false,
  sitio: null,
  nombre: '',
  dominio: '',
  descripcion: '',
  idioma_default: '',
};

export const PaginaSitios = () => {
  const [paginacion, asignarPaginacion] = useState<Paginacion>(paginacionInicial);
  const [busqueda, asignarBusqueda] = useState('');
  const [vista, asignarVista] = useState<Vista>('ACTIVO');
  const [accion, asignarAccion] = useState<{ tipo: 'desactivar' | 'reactivar' | 'eliminar'; sitio: Sitio } | null>(null);
  const [edicion, asignarEdicion] = useState<FormularioEdicion>(formularioVacio);
  const navegar = useNavigate();

  const consultaActivos = useListarSitios(paginacion, 'ACTIVO');
  const consultaArchivados = useListarSitios(paginacion, 'INACTIVO');
  const consulta = vista === 'ACTIVO' ? consultaActivos : consultaArchivados;

  const cambiarEstado = useCambiarEstadoSitio();
  const editar = useEditarSitio();
  const eliminar = useEliminarSitio();

  const filasFiltradas = useMemo(() => {
    const elementos = consulta.data?.elementos ?? [];
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return elementos;
    return elementos.filter(
      (s) => s.nombre.toLowerCase().includes(texto) || s.codigo.toLowerCase().includes(texto),
    );
  }, [consulta.data, busqueda]);

  const abrirEdicion = (s: Sitio) =>
    asignarEdicion({
      abierto: true,
      sitio: s,
      nombre: s.nombre,
      dominio: s.dominio,
      descripcion: s.descripcion ?? '',
      idioma_default: s.idioma_default,
    });

  const guardarEdicion = () => {
    if (!edicion.sitio) return;
    editar.mutate(
      {
        id: edicion.sitio.id,
        datos: {
          nombre: edicion.nombre,
          dominio: edicion.dominio,
          descripcion: edicion.descripcion,
          idioma_default: edicion.idioma_default,
        },
      },
      { onSuccess: () => asignarEdicion(formularioVacio) },
    );
  };

  const confirmar = () => {
    if (!accion) return;
    if (accion.tipo === 'desactivar') {
      cambiarEstado.mutate({ id: accion.sitio.id, estado: 'INACTIVO' }, { onSuccess: () => asignarAccion(null) });
    } else if (accion.tipo === 'reactivar') {
      cambiarEstado.mutate({ id: accion.sitio.id, estado: 'ACTIVO' }, { onSuccess: () => asignarAccion(null) });
    } else {
      eliminar.mutate(accion.sitio.id, { onSuccess: () => asignarAccion(null) });
    }
  };

  const columnas: ColumnaTabla<Sitio>[] = [
    {
      clave: 'nombre',
      etiqueta: 'Sitio',
      obtener: (s) => (
        <div>
          <p className="font-medium text-tinta">{s.nombre}</p>
          <p className="text-xs text-humo">{s.dominio}</p>
        </div>
      ),
    },
    { clave: 'codigo', etiqueta: 'Código', obtener: (s) => <span className="font-codigo text-xs text-grafito">{s.codigo}</span> },
    { clave: 'idioma', etiqueta: 'Idioma', obtener: (s) => <Etiqueta>{s.idioma_default}</Etiqueta> },
    { clave: 'estado', etiqueta: 'Estado', obtener: (s) => <Etiqueta tono={s.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{s.estado}</Etiqueta> },
    { clave: 'creado', etiqueta: 'Creado', obtener: (s) => <span className="text-humo">{formatearFecha(s.creado_en)}</span>, alineacion: 'derecha' },
    {
      clave: 'acciones',
      etiqueta: 'Acciones',
      alineacion: 'derecha',
      obtener: (s) => (
        <div className="flex gap-2 justify-end flex-wrap">
          <Boton tono="discreto" tamano="compacto" onClick={() => abrirEdicion(s)}>
            Editar
          </Boton>
          {s.estado === 'ACTIVO' ? (
            <Boton tono="discreto" tamano="compacto" onClick={() => asignarAccion({ tipo: 'desactivar', sitio: s })}>
              Desactivar
            </Boton>
          ) : (
            <Boton tono="discreto" tamano="compacto" onClick={() => asignarAccion({ tipo: 'reactivar', sitio: s })}>
              Reactivar
            </Boton>
          )}
          <Boton tono="peligro" tamano="compacto" onClick={() => asignarAccion({ tipo: 'eliminar', sitio: s })}>
            Eliminar
          </Boton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Estructura"
        titulo="Sitios"
        descripcion="Cada sitio agrupa posts, categorías, etiquetas y autores con su propio dominio."
        acciones={<Boton onClick={() => navegar('/panel/sitios/nuevo')}>Nuevo sitio</Boton>}
      />

      <TabsEstado
        valor={vista}
        alCambiar={(v) => asignarVista(v as Vista)}
        opciones={[
          { valor: 'ACTIVO', etiqueta: 'Activos', conteo: consultaActivos.data?.elementos.length },
          { valor: 'INACTIVO', etiqueta: 'Archivados', conteo: consultaArchivados.data?.elementos.length },
        ]}
      />

      {consulta.isLoading && <Cargando etiqueta="Cargando sitios" />}
      {consulta.data && consulta.data.elementos.length === 0 && (
        <EstadoVacio
          titulo={vista === 'ACTIVO' ? 'Tu primer sitio' : 'Sin sitios archivados'}
          descripcion={
            vista === 'ACTIVO'
              ? 'Un sitio es donde viven tus posts. Necesitas al menos uno antes de publicar.'
              : 'Los sitios que desactives aparecerán aquí.'
          }
          accion={vista === 'ACTIVO' ? <Boton onClick={() => navegar('/panel/sitios/nuevo')}>Crear sitio</Boton> : undefined}
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <div className="space-y-3">
          <div className="max-w-sm">
            <BuscadorTabla valor={busqueda} alCambiar={asignarBusqueda} marcador="Buscar por nombre o código" />
          </div>
          <TablaResponsiva columnas={columnas} filas={filasFiltradas} obtenerLlave={(s) => s.id} />
          <PaginadorTabla
            pagina={consulta.data.pagina}
            tamanoPagina={consulta.data.tamano_pagina}
            totalFilas={consulta.data.total_filas}
            totalPaginas={consulta.data.total_paginas}
            alCambiarPagina={(pagina) => asignarPaginacion((p) => ({ ...p, pagina }))}
          />
        </div>
      )}

      {/* Modal de edición */}
      {edicion.abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-tinta/40 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => !editar.isPending && asignarEdicion(formularioVacio)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-papel w-full sm:max-w-xl rounded-t-marco sm:rounded-marco shadow-levantado border border-ceniza max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="titulo-editorial text-xl text-tinta">Editar sitio</h3>
              <p className="text-sm text-humo">Código <span className="font-codigo">{edicion.sitio?.codigo}</span> (no editable)</p>
              <CampoTexto
                etiqueta="Nombre"
                value={edicion.nombre}
                onChange={(e) => asignarEdicion({ ...edicion, nombre: e.target.value })}
              />
              <CampoTexto
                etiqueta="Dominio"
                value={edicion.dominio}
                onChange={(e) => asignarEdicion({ ...edicion, dominio: e.target.value })}
              />
              <CampoTexto
                etiqueta="Idioma por defecto"
                value={edicion.idioma_default}
                onChange={(e) => asignarEdicion({ ...edicion, idioma_default: e.target.value })}
              />
              <AreaTexto
                etiqueta="Descripción"
                value={edicion.descripcion}
                onChange={(e) => asignarEdicion({ ...edicion, descripcion: e.target.value })}
              />
            </div>
            <div className="px-6 py-4 border-t border-ceniza flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Boton tono="discreto" onClick={() => asignarEdicion(formularioVacio)} disabled={editar.isPending}>
                Cancelar
              </Boton>
              <Boton onClick={guardarEdicion} cargando={editar.isPending}>
                Guardar cambios
              </Boton>
            </div>
          </div>
        </div>
      )}

      <DialogoConfirmacion
        abierto={Boolean(accion)}
        cargando={cambiarEstado.isPending || eliminar.isPending}
        titulo={
          accion?.tipo === 'eliminar' ? 'Eliminar sitio' : accion?.tipo === 'desactivar' ? 'Desactivar sitio' : 'Reactivar sitio'
        }
        tonoConfirmar={accion?.tipo === 'eliminar' ? 'peligro' : 'primario'}
        textoConfirmar={
          accion?.tipo === 'eliminar'
            ? 'Eliminar definitivamente'
            : accion?.tipo === 'desactivar'
            ? 'Sí, desactivar'
            : 'Sí, reactivar'
        }
        mensaje={
          accion?.tipo === 'eliminar' ? (
            <>
              Vas a eliminar <strong>{accion.sitio.nombre}</strong>. Sus posts y categorías quedarán huérfanos.
              Esta acción no se puede deshacer fácilmente.
            </>
          ) : accion?.tipo === 'desactivar' ? (
            <>
              <strong>{accion.sitio.nombre}</strong> pasará a Archivados. Sus posts dejarán de servirse hasta que lo reactives.
            </>
          ) : accion?.tipo === 'reactivar' ? (
            <>
              <strong>{accion.sitio.nombre}</strong> volverá a activos y sus posts publicados volverán a servirse.
            </>
          ) : (
            ''
          )
        }
        alConfirmar={confirmar}
        alCancelar={() => asignarAccion(null)}
      />
    </div>
  );
};
