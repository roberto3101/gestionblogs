import { obtener, enviar, eliminar, reemplazar, ajustar } from '@integraciones/http/clienteHttp';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Identificador } from '@compartido/tipos/identificador';
import type { ListadoPaginado, Paginacion } from '@compartido/tipos/paginacion';
import { aCadenaConsulta } from '@compartido/tipos/paginacion';
import type { SolicitudAsignarAlcance, SolicitudAsignarRolPermiso } from '../contratos/alcance';

export interface AlcanceEnriquecido {
  id: Identificador;
  usuario_id: Identificador;
  usuario_correo: string;
  empresa_id: Identificador;
  empresa_nombre: string;
  rol_id: Identificador;
  rol_nombre: string;
  tipo: string;
  estado: string;
  creado_en: string;
}

export interface UsuarioAdmin {
  id: Identificador;
  correo_electronico: string;
  correo_electronico_verificado: boolean;
  estado: string;
  ultimo_inicio_sesion_en?: string | null;
  creado_en: string;
}

export const asignarAlcance = (solicitud: SolicitudAsignarAlcance): Promise<unknown> =>
  enviar<unknown>('/gobierno/alcances', solicitud);

export const asignarRolPermiso = (solicitud: SolicitudAsignarRolPermiso): Promise<unknown> =>
  enviar<unknown>('/gobierno/rol-permiso', solicitud);

export const listarAlcances = async (): Promise<AlcanceEnriquecido[]> => {
  const crudo = await obtener<{ elementos: AlcanceEnriquecido[] } | AlcanceEnriquecido[]>(
    '/gobierno/alcances',
  );
  if (Array.isArray(crudo)) return crudo;
  return crudo?.elementos ?? [];
};

export const revocarAlcance = (alcanceId: Identificador): Promise<{ id: string }> =>
  eliminar<{ id: string }>(`/gobierno/alcances/${alcanceId}`);

export const listarUsuariosAdmin = async (
  paginacion: Paginacion,
  filtroEstado?: string,
): Promise<ListadoPaginado<UsuarioAdmin>> => {
  const consulta = aCadenaConsulta(paginacion);
  const con = filtroEstado ? `${consulta}&estado=${encodeURIComponent(filtroEstado)}` : consulta;
  const crudo = await obtener<unknown>(`/gobierno/usuarios?${con}`);
  return normalizarListado<UsuarioAdmin>(crudo);
};

export interface SolicitudCrearUsuarioAdmin {
  correo_electronico: string;
  password: string;
  empresa_id?: Identificador;
  rol_id?: Identificador;
}

export const crearUsuarioAdmin = (solicitud: SolicitudCrearUsuarioAdmin): Promise<UsuarioAdmin> =>
  enviar<UsuarioAdmin>('/gobierno/usuarios', solicitud);

export const editarUsuarioAdmin = (id: Identificador, correoElectronico: string): Promise<{ id: string; correo_electronico: string }> =>
  reemplazar(`/gobierno/usuarios/${id}`, { correo_electronico: correoElectronico });

// Estados de usuario en backend: ACTIVO | INACTIVO | BLOQUEADO | PENDIENTE | ELIMINADO.
// Aquí solo manejamos toggle ACTIVO ↔ INACTIVO.
export const cambiarEstadoUsuarioAdmin = (id: Identificador, estado: 'ACTIVO' | 'INACTIVO'): Promise<{ id: string; estado: string }> =>
  ajustar(`/gobierno/usuarios/${id}/estado`, { estado });

export const eliminarUsuarioAdmin = (id: Identificador): Promise<{ id: string }> =>
  eliminar(`/gobierno/usuarios/${id}`);
