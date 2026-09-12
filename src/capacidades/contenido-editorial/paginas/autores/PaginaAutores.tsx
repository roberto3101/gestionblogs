import { useState } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { TablaResponsiva } from '@compartido/interfaz/visualizacion-datos/TablaResponsiva';
import { TabsEstado } from '@compartido/interfaz/visualizacion-datos/TabsEstado';
import { DialogoConfirmacion } from '@compartido/interfaz/retroalimentacion/DialogoConfirmacion';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import {
  useCambiarEstadoAutor,
  useEliminarAutor,
  useListarAutores,
} from '../../ganchos/useAutores';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { FormularioAutor } from '../../componentes/listado/FormularioAutor';
import type { Autor } from '../../contratos/autor';

type Vista = 'ACTIVO' | 'INACTIVO';
type AccionAutor =
  | { tipo: 'desactivar'; autor: Autor }
  | { tipo: 'reactivar'; autor: Autor }
  | { tipo: 'eliminar'; autor: Autor }
  | null;

export const PaginaAutores = () => {
  const { sitioActivo } = useSitioActivo();
  const [mostrandoFormulario, asignarMostrandoFormulario] = useState(false);
  const [vista, asignarVista] = useState<Vista>('ACTIVO');
  const [accion, asignarAccion] = useState<AccionAutor>(null);

  const consultaActivos = useListarAutores(sitioActivo?.codigo ?? null, undefined, 'ACTIVO');
  const consultaArchivados = useListarAutores(sitioActivo?.codigo ?? null, undefined, 'INACTIVO');
  const consulta = vista === 'ACTIVO' ? consultaActivos : consultaArchivados;

  const cambiarEstado = useCambiarEstadoAutor();
  const eliminar = useEliminarAutor();

  if (!sitioActivo) {
    return (
      <EstadoVacio
        titulo="Selecciona un sitio"
        descripcion="Los autores se asocian a un sitio. Crea un sitio primero."
      />
    );
  }

  const columnas: ColumnaTabla<Autor>[] = [
    {
      clave: 'nombre',
      etiqueta: 'Nombre público',
      obtener: (a) => <span className="font-medium text-tinta">{a.nombre_publico}</span>,
    },
    {
      clave: 'slug',
      etiqueta: 'Slug',
      obtener: (a) => <span className="font-codigo text-xs text-grafito">{a.slug}</span>,
    },
    {
      clave: 'estado',
      etiqueta: 'Estado',
      obtener: (a) => <Etiqueta tono={a.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{a.estado}</Etiqueta>,
    },
    {
      clave: 'acciones',
      etiqueta: 'Acciones',
      alineacion: 'derecha',
      obtener: (a) => (
        <div className="flex gap-2 justify-end flex-wrap">
          {a.estado === 'ACTIVO' ? (
            <Boton tono="discreto" tamano="compacto" onClick={() => asignarAccion({ tipo: 'desactivar', autor: a })}>
              Desactivar
            </Boton>
          ) : (
            <Boton tono="discreto" tamano="compacto" onClick={() => asignarAccion({ tipo: 'reactivar', autor: a })}>
              Reactivar
            </Boton>
          )}
          <Boton tono="peligro" tamano="compacto" onClick={() => asignarAccion({ tipo: 'eliminar', autor: a })}>
            Eliminar
          </Boton>
        </div>
      ),
    },
  ];

  const confirmar = () => {
    if (!accion) return;
    if (accion.tipo === 'desactivar') {
      cambiarEstado.mutate(
        { id: accion.autor.id, estado: 'INACTIVO' },
        { onSuccess: () => asignarAccion(null) },
      );
    } else if (accion.tipo === 'reactivar') {
      cambiarEstado.mutate(
        { id: accion.autor.id, estado: 'ACTIVO' },
        { onSuccess: () => asignarAccion(null) },
      );
    } else if (accion.tipo === 'eliminar') {
      eliminar.mutate(accion.autor.id, { onSuccess: () => asignarAccion(null) });
    }
  };

  const ejecutando = cambiarEstado.isPending || eliminar.isPending;

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Redacción"
        titulo="Autores"
        descripcion="Las personas o equipos que firman tus posts."
        acciones={
          <Boton onClick={() => asignarMostrandoFormulario((v) => !v)}>
            {mostrandoFormulario ? 'Cerrar formulario' : 'Nuevo autor'}
          </Boton>
        }
      />
      {mostrandoFormulario && (
        <div className="lamina p-6 mb-6 max-w-2xl">
          <FormularioAutor alCrear={() => asignarMostrandoFormulario(false)} />
        </div>
      )}

      <TabsEstado
        valor={vista}
        alCambiar={(v) => asignarVista(v as Vista)}
        opciones={[
          { valor: 'ACTIVO', etiqueta: 'Activos', conteo: consultaActivos.data?.elementos.length },
          { valor: 'INACTIVO', etiqueta: 'Archivados', conteo: consultaArchivados.data?.elementos.length },
        ]}
      />

      {consulta.isLoading && <Cargando etiqueta="Cargando autores" />}
      {consulta.data && consulta.data.elementos.length === 0 && (
        <EstadoVacio
          titulo={vista === 'ACTIVO' ? 'Sin autores activos' : 'Sin autores archivados'}
          descripcion={
            vista === 'ACTIVO'
              ? 'Crea un autor para empezar a publicar.'
              : 'Los autores que desactives aparecerán aquí.'
          }
          accion={
            vista === 'ACTIVO' ? (
              <Boton onClick={() => asignarMostrandoFormulario(true)}>Crear autor</Boton>
            ) : undefined
          }
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <TablaResponsiva columnas={columnas} filas={consulta.data.elementos} obtenerLlave={(a) => a.id} />
      )}

      <DialogoConfirmacion
        abierto={Boolean(accion)}
        cargando={ejecutando}
        titulo={
          accion?.tipo === 'eliminar'
            ? 'Eliminar autor'
            : accion?.tipo === 'desactivar'
            ? 'Desactivar autor'
            : 'Reactivar autor'
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
              Vas a eliminar a <strong>{accion.autor.nombre_publico}</strong>. Esta acción no se puede deshacer.
            </>
          ) : accion?.tipo === 'desactivar' ? (
            <>
              <strong>{accion.autor.nombre_publico}</strong> pasará a Archivados. Podrás reactivarlo cuando quieras.
            </>
          ) : accion?.tipo === 'reactivar' ? (
            <>
              <strong>{accion.autor.nombre_publico}</strong> volverá a la lista de activos.
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
