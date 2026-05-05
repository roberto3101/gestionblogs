import { useMemo, useState } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { Lamina } from '@compartido/interfaz/primitivas/Lamina';
import {
  useListarAlcances,
  useListarPermisos,
  useListarRoles,
  useListarUsuariosAdmin,
} from '../ganchos/useGobierno';
import type { Identificador } from '@compartido/tipos/identificador';
import type { UsuarioAdmin } from '../servicios/servicioAlcances';

interface UsuarioConRoles extends UsuarioAdmin {
  asignaciones: Array<{ empresa: string; rol: string; alcanceId: Identificador }>;
}

export const PaginaRolesPermisos = () => {
  const usuarios = useListarUsuariosAdmin();
  const alcances = useListarAlcances();
  const roles = useListarRoles();
  const permisos = useListarPermisos();
  const [mostrarCatalogo, asignarMostrarCatalogo] = useState(false);

  // Junta usuarios con sus alcances ya enriquecidos (empresa nombre + rol nombre)
  const usuariosConRoles = useMemo<UsuarioConRoles[]>(() => {
    if (!usuarios.data || !alcances.data) return [];
    return usuarios.data.elementos.map((u) => ({
      ...u,
      asignaciones: alcances.data
        .filter((a) => a.usuario_id === u.id)
        .map((a) => ({ empresa: a.empresa_nombre, rol: a.rol_nombre, alcanceId: a.id })),
    }));
  }, [usuarios.data, alcances.data]);

  const columnas: ColumnaTabla<UsuarioConRoles>[] = [
    {
      clave: 'correo',
      etiqueta: 'Usuario',
      obtener: (u) => (
        <div className="space-y-0.5">
          <span className="font-medium text-tinta">{u.correo_electronico}</span>
          {!u.correo_electronico_verificado && (
            <span className="block text-xs text-ambar">Correo no verificado</span>
          )}
        </div>
      ),
    },
    {
      clave: 'estado',
      etiqueta: 'Estado',
      obtener: (u) => (
        <Etiqueta tono={u.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{u.estado}</Etiqueta>
      ),
    },
    {
      clave: 'asignaciones',
      etiqueta: 'Roles por empresa',
      obtener: (u) =>
        u.asignaciones.length === 0 ? (
          <span className="text-sm text-grafito italic">Sin accesos</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {u.asignaciones.map((a) => (
              <span
                key={a.alcanceId}
                className="inline-flex items-center gap-1 rounded-suave border border-ceniza bg-papel px-2 py-1 text-xs text-tinta"
              >
                <span className="text-grafito">{a.empresa}:</span>
                <span className="font-medium">{a.rol}</span>
              </span>
            ))}
          </div>
        ),
    },
  ];

  const cargandoTodo = usuarios.isLoading || alcances.isLoading;

  return (
    <div className="space-y-8">
      <div>
        <EncabezadoSeccion
          preTitulo="Gobierno de acceso"
          titulo="Roles y permisos"
          descripcion="Cada usuario con sus roles asignados por empresa. Para cambiar accesos ve a Alcances."
        />
        {cargandoTodo && <Cargando etiqueta="Cargando usuarios y roles" />}
        {!cargandoTodo && usuariosConRoles.length === 0 && (
          <EstadoVacio
            titulo="No hay usuarios todavía"
            descripcion="Cuando registres usuarios aparecerán aquí con sus roles."
          />
        )}
        {!cargandoTodo && usuariosConRoles.length > 0 && (
          <Tabla columnas={columnas} filas={usuariosConRoles} obtenerLlave={(u) => u.id} />
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => asignarMostrarCatalogo((v) => !v)}
          className="meta-tipografia hover:text-tinta inline-flex items-center gap-2"
        >
          <span>{mostrarCatalogo ? '−' : '+'}</span>
          Catálogo de roles y permisos disponibles (referencia)
        </button>

        {mostrarCatalogo && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Lamina className="p-5 space-y-3">
              <p className="meta-tipografia">Roles disponibles</p>
              {roles.isLoading && <Cargando etiqueta="Cargando roles" />}
              {roles.data && (
                <ul className="space-y-2">
                  {roles.data.elementos.map((r) => (
                    <li key={r.id} className="border-b border-ceniza last:border-0 pb-2 last:pb-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-tinta">{r.nombre}</span>
                        <Etiqueta tono={r.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{r.estado}</Etiqueta>
                      </div>
                      {r.descripcion && <p className="text-xs text-grafito">{r.descripcion}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Lamina>

            <Lamina className="p-5 space-y-3">
              <p className="meta-tipografia">Permisos disponibles</p>
              {permisos.isLoading && <Cargando etiqueta="Cargando permisos" />}
              {permisos.data && (
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {permisos.data.elementos.map((p) => (
                    <li key={p.id} className="border-b border-ceniza last:border-0 pb-2 last:pb-0">
                      <span className="block font-codigo text-xs text-tinta">{p.codigo}</span>
                      {p.descripcion && <p className="text-xs text-grafito mt-0.5">{p.descripcion}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Lamina>
          </div>
        )}
      </div>
    </div>
  );
};
