import { obtener, enviar, reemplazar, ajustar, eliminar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Empresa, SolicitudCrearEmpresa } from '../contratos/empresa';

export interface SolicitudEditarEmpresa {
  ruc?: string;
  razon_social?: string;
}

export const listarEmpresas = async (
  paginacion: Paginacion,
  filtroEstado?: string,
): Promise<ListadoPaginado<Empresa>> => {
  const consulta = aCadenaConsulta(paginacion);
  const con = filtroEstado ? `${consulta}&estado=${encodeURIComponent(filtroEstado)}` : consulta;
  const crudo = await obtener<unknown>(`/organizacion/empresas?${con}`);
  return normalizarListado<Empresa>(crudo);
};

export const crearEmpresa = (solicitud: SolicitudCrearEmpresa): Promise<Empresa> =>
  enviar<Empresa>('/organizacion/empresas', solicitud);

export const editarEmpresa = (id: string, solicitud: SolicitudEditarEmpresa): Promise<Empresa> =>
  reemplazar<Empresa>(`/organizacion/empresas/${id}`, solicitud);

// Estados de empresa en backend: ACTIVO | SUSPENDIDO | ELIMINADO.
// "SUSPENDIDO" = archivada.
export const cambiarEstadoEmpresa = (id: string, estado: 'ACTIVO' | 'SUSPENDIDO'): Promise<{ id: string; estado: string }> =>
  ajustar(`/organizacion/empresas/${id}/estado`, { estado });

export const eliminarEmpresa = (id: string): Promise<{ id: string }> =>
  eliminar(`/organizacion/empresas/${id}`);
