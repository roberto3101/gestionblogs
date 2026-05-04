import { obtener, enviar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Rol, SolicitudRegistrarRol } from '../contratos/rol';

export const listarRoles = async (paginacion: Paginacion): Promise<ListadoPaginado<Rol>> => {
  const crudo = await obtener<unknown>(`/gobierno/roles?${aCadenaConsulta(paginacion)}`);
  return normalizarListado<Rol>(crudo);
};

export const registrarRol = (solicitud: SolicitudRegistrarRol): Promise<Rol> =>
  enviar<Rol>('/gobierno/roles', solicitud);
