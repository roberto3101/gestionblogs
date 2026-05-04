import { obtener, enviar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Permiso, SolicitudRegistrarPermiso } from '../contratos/permiso';

export const listarPermisos = async (paginacion: Paginacion): Promise<ListadoPaginado<Permiso>> => {
  const crudo = await obtener<unknown>(`/gobierno/permisos?${aCadenaConsulta(paginacion)}`);
  return normalizarListado<Permiso>(crudo);
};

export const registrarPermiso = (solicitud: SolicitudRegistrarPermiso): Promise<Permiso> =>
  enviar<Permiso>('/gobierno/permisos', solicitud);
