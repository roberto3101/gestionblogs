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
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { formatearFecha } from '@compartido/utilidades/formatearFecha';
import {
  useCambiarEstadoEmpresa,
  useEditarEmpresa,
  useEliminarEmpresa,
  useListarEmpresas,
} from '../ganchos/useEmpresas';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import type { Empresa } from '../contratos/empresa';

// Backend empresa: estados ACTIVO | SUSPENDIDO | ELIMINADO. "SUSPENDIDO" = archivada.
type Vista = 'ACTIVO' | 'SUSPENDIDO';

interface FormularioEdicion {
  abierto: boolean;
  empresa: Empresa | null;
  ruc: string;
  razon_social: string;
}

const formularioVacio: FormularioEdicion = {
  abierto: false,
  empresa: null,
  ruc: '',
  razon_social: '',
};

export const PaginaEmpresas = () => {
  const [paginacion, asignarPaginacion] = useState<Paginacion>(paginacionInicial);
  const [busqueda, asignarBusqueda] = useState('');
  const [vista, asignarVista] = useState<Vista>('ACTIVO');
  const [accion, asignarAccion] = useState<{ tipo: 'desactivar' | 'reactivar' | 'eliminar'; empresa: Empresa } | null>(null);
  const [edicion, asignarEdicion] = useState<FormularioEdicion>(formularioVacio);
  const navegar = useNavigate();

  const consultaActivas = useListarEmpresas(paginacion, 'ACTIVO');
  const consultaArchivadas = useListarEmpresas(paginacion, 'SUSPENDIDO');
  const consulta = vista === 'ACTIVO' ? consultaActivas : consultaArchivadas;

  const cambiarEstado = useCambiarEstadoEmpresa();
  const editar = useEditarEmpresa();
  const eliminar = useEliminarEmpresa();

  const filasFiltradas = useMemo(() => {
    const elementos = consulta.data?.elementos ?? [];
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return elementos;
    return elementos.filter(
      (e) => e.razon_social.toLowerCase().includes(texto) || e.ruc.toLowerCase().includes(texto),
    );
  }, [consulta.data, busqueda]);

  const abrirEdicion = (e: Empresa) =>
    asignarEdicion({ abierto: true, empresa: e, ruc: e.ruc, razon_social: e.razon_social });

  const guardarEdicion = () => {
    if (!edicion.empresa) return;
    editar.mutate(
      { id: edicion.empresa.id, datos: { ruc: edicion.ruc, razon_social: edicion.razon_social } },
      { onSuccess: () => asignarEdicion(formularioVacio) },
    );
  };

  const confirmar = () => {
    if (!accion) return;
    if (accion.tipo === 'desactivar') {
      cambiarEstado.mutate({ id: accion.empresa.id, estado: 'SUSPENDIDO' }, { onSuccess: () => asignarAccion(null) });
    } else if (accion.tipo === 'reactivar') {
      cambiarEstado.mutate({ id: accion.empresa.id, estado: 'ACTIVO' }, { onSuccess: () => asignarAccion(null) });
    } else {
      eliminar.mutate(accion.empresa.id, { onSuccess: () => asignarAccion(null) });
    }
  };

  const columnas: ColumnaTabla<Empresa>[] = [
    { clave: 'razon', etiqueta: 'Razón social', obtener: (e) => <span className="font-medium text-tinta">{e.razon_social}</span> },
    { clave: 'ruc', etiqueta: 'RUC', obtener: (e) => <span className="font-codigo text-xs text-grafito">{e.ruc}</span> },
    { clave: 'estado', etiqueta: 'Estado', obtener: (e) => <Etiqueta tono={e.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{e.estado}</Etiqueta> },
    { clave: 'creado', etiqueta: 'Creada', obtener: (e) => <span className="text-humo">{formatearFecha(e.creado_en)}</span>, alineacion: 'derecha' },
    {
      clave: 'acciones',
      etiqueta: 'Acciones',
      alineacion: 'derecha',
      obtener: (e) => (
        <div className="flex gap-2 justify-end flex-wrap">
          <Boton tono="discreto" tamano="compacto" onClick={() => abrirEdicion(e)}>
            Editar
          </Boton>
          {e.estado === 'ACTIVO' ? (
            <Boton tono="discreto" tamano="compacto" onClick={() => asignarAccion({ tipo: 'desactivar', empresa: e })}>
              Desactivar
            </Boton>
          ) : (
            <Boton tono="discreto" tamano="compacto" onClick={() => asignarAccion({ tipo: 'reactivar', empresa: e })}>
              Reactivar
            </Boton>
          )}
          <Boton tono="peligro" tamano="compacto" onClick={() => asignarAccion({ tipo: 'eliminar', empresa: e })}>
            Eliminar
          </Boton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Organización"
        titulo="Empresas"
        descripcion="Cada empresa es un espacio independiente con sus propios sitios, autores y posts."
        acciones={<Boton onClick={() => navegar('/panel/empresas/nueva')}>Nueva empresa</Boton>}
      />

      <TabsEstado
        valor={vista}
        alCambiar={(v) => asignarVista(v as Vista)}
        opciones={[
          { valor: 'ACTIVO', etiqueta: 'Activas', conteo: consultaActivas.data?.elementos.length },
          { valor: 'SUSPENDIDO', etiqueta: 'Archivadas', conteo: consultaArchivadas.data?.elementos.length },
        ]}
      />

      {consulta.isLoading && <Cargando etiqueta="Cargando empresas" />}
      {consulta.data && consulta.data.elementos.length === 0 && (
        <EstadoVacio
          titulo={vista === 'ACTIVO' ? 'Crea tu primera empresa' : 'Sin empresas archivadas'}
          descripcion={
            vista === 'ACTIVO'
              ? 'Necesitas al menos una empresa para empezar a publicar contenido.'
              : 'Las empresas que desactives aparecerán aquí.'
          }
          accion={vista === 'ACTIVO' ? <Boton onClick={() => navegar('/panel/empresas/nueva')}>Crear empresa</Boton> : undefined}
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <div className="space-y-3">
          <div className="max-w-sm">
            <BuscadorTabla valor={busqueda} alCambiar={asignarBusqueda} marcador="Buscar por razón social o RUC" />
          </div>
          <TablaResponsiva columnas={columnas} filas={filasFiltradas} obtenerLlave={(e) => e.id} />
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
              <h3 className="titulo-editorial text-xl text-tinta">Editar empresa</h3>
              <CampoTexto
                etiqueta="RUC"
                value={edicion.ruc}
                onChange={(e) => asignarEdicion({ ...edicion, ruc: e.target.value })}
              />
              <CampoTexto
                etiqueta="Razón social"
                value={edicion.razon_social}
                onChange={(e) => asignarEdicion({ ...edicion, razon_social: e.target.value })}
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
          accion?.tipo === 'eliminar' ? 'Eliminar empresa' : accion?.tipo === 'desactivar' ? 'Desactivar empresa' : 'Reactivar empresa'
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
              Vas a eliminar <strong>{accion.empresa.razon_social}</strong>. Sus sitios, autores y posts quedarán huérfanos.
              Esta acción no se puede deshacer fácilmente.
            </>
          ) : accion?.tipo === 'desactivar' ? (
            <>
              <strong>{accion.empresa.razon_social}</strong> pasará a Archivadas. Podrás reactivarla cuando quieras.
            </>
          ) : accion?.tipo === 'reactivar' ? (
            <>
              <strong>{accion.empresa.razon_social}</strong> volverá a la lista de activas.
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
