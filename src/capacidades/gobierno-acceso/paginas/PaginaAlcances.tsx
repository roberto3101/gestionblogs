import { useMemo, useState, type FormEvent } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { Lamina } from '@compartido/interfaz/primitivas/Lamina';
import { Selector } from '@compartido/interfaz/primitivas/Selector';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { SelectorEmpresa } from '@capacidades/contenido-editorial/componentes/selectores/SelectorEmpresa';
import {
  useAsignarAlcance,
  useListarAlcances,
  useListarRoles,
  useListarUsuariosAdmin,
  useRevocarAlcance,
} from '../ganchos/useGobierno';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import type { Identificador } from '@compartido/tipos/identificador';
import type { AlcanceEnriquecido } from '../servicios/servicioAlcances';

export const PaginaAlcances = () => {
  const consulta = useListarAlcances();
  const usuarios = useListarUsuariosAdmin();
  const roles = useListarRoles();
  const asignacion = useAsignarAlcance();
  const revocacion = useRevocarAlcance();

  const [mostrarForm, asignarMostrarForm] = useState(false);
  const [usuarioId, asignarUsuarioId] = useState<Identificador | ''>('');
  const [empresaId, asignarEmpresaId] = useState<Identificador | ''>('');
  const [rolId, asignarRolId] = useState<Identificador | ''>('');

  const opcionesUsuarios = useMemo(
    () =>
      (usuarios.data?.elementos ?? []).map((u) => ({
        valor: u.id,
        etiqueta: u.correo_electronico,
      })),
    [usuarios.data],
  );
  const opcionesRoles = useMemo(
    () => (roles.data?.elementos ?? []).map((r) => ({ valor: r.id, etiqueta: r.nombre })),
    [roles.data],
  );

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!usuarioId || !empresaId || !rolId) return;
    asignacion.mutate(
      { usuario_id: usuarioId as Identificador, empresa_id: empresaId, rol_id: rolId as Identificador },
      {
        onSuccess: () => {
          asignarUsuarioId('');
          asignarEmpresaId('');
          asignarRolId('');
          asignarMostrarForm(false);
        },
      },
    );
  };

  const columnas: ColumnaTabla<AlcanceEnriquecido>[] = [
    {
      clave: 'usuario',
      etiqueta: 'Usuario',
      obtener: (a) => <span className="font-medium text-tinta">{a.usuario_correo}</span>,
    },
    {
      clave: 'empresa',
      etiqueta: 'Empresa',
      obtener: (a) => <span className="text-grafito">{a.empresa_nombre}</span>,
    },
    {
      clave: 'rol',
      etiqueta: 'Rol',
      obtener: (a) => <Etiqueta tono="oliva">{a.rol_nombre}</Etiqueta>,
    },
    {
      clave: 'acciones',
      etiqueta: '',
      obtener: (a) => (
        <div className="flex justify-end">
          <Boton
            tono="peligro"
            tamano="compacto"
            cargando={revocacion.isPending && revocacion.variables === a.id}
            onClick={() => {
              if (window.confirm(`¿Revocar el acceso de ${a.usuario_correo} a ${a.empresa_nombre} (${a.rol_nombre})?`)) {
                revocacion.mutate(a.id);
              }
            }}
          >
            Revocar
          </Boton>
        </div>
      ),
      anchoMinimo: '120px',
    },
  ];

  const mensajeError = asignacion.error instanceof ErrorHttp ? asignacion.error.message : null;

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Gobierno de acceso"
        titulo="Alcances"
        descripcion="Quién tiene acceso a qué empresa y con qué rol. Revoca o asigna desde aquí."
        acciones={
          <Boton onClick={() => asignarMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cerrar' : 'Asignar acceso'}
          </Boton>
        }
      />

      {mostrarForm && (
        <Lamina className="p-6 mb-6 max-w-2xl">
          <form onSubmit={enviar} className="space-y-5">
            <Selector
              etiqueta="Usuario"
              opciones={opcionesUsuarios}
              marcadorPosicion="Selecciona un usuario"
              value={usuarioId}
              onChange={(e) => asignarUsuarioId(e.target.value as Identificador | '')}
              required
            />
            <SelectorEmpresa valor={empresaId} alCambiar={asignarEmpresaId} />
            <Selector
              etiqueta="Rol"
              opciones={opcionesRoles}
              marcadorPosicion="Selecciona un rol"
              value={rolId}
              onChange={(e) => asignarRolId(e.target.value as Identificador | '')}
              required
            />
            {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
            <div className="flex justify-end gap-3 pt-2">
              <Boton type="button" tono="discreto" onClick={() => asignarMostrarForm(false)}>
                Cancelar
              </Boton>
              <Boton type="submit" cargando={asignacion.isPending}>
                Asignar acceso
              </Boton>
            </div>
          </form>
        </Lamina>
      )}

      {consulta.isLoading && <Cargando etiqueta="Cargando alcances" />}
      {consulta.data && consulta.data.length === 0 && !mostrarForm && (
        <EstadoVacio
          titulo="Sin accesos asignados"
          descripcion="Aún nadie tiene acceso. Asigna el primero para empezar."
          accion={<Boton onClick={() => asignarMostrarForm(true)}>Asignar acceso</Boton>}
        />
      )}
      {consulta.data && consulta.data.length > 0 && (
        <Tabla columnas={columnas} filas={consulta.data} obtenerLlave={(a) => a.id} />
      )}
    </div>
  );
};
