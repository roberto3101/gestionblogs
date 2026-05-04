import { obtener, enviar } from '@integraciones/http/clienteHttp';
import { aCadenaConsulta, type ListadoPaginado, type Paginacion } from '@compartido/tipos/paginacion';
import { normalizarListado } from '@compartido/utilidades/normalizarListado';
import type { Empresa, SolicitudCrearEmpresa } from '../contratos/empresa';

export const listarEmpresas = async (paginacion: Paginacion): Promise<ListadoPaginado<Empresa>> => {
  const crudo = await obtener<unknown>(`/organizacion/empresas?${aCadenaConsulta(paginacion)}`);
  return normalizarListado<Empresa>(crudo);
};

export const crearEmpresa = (solicitud: SolicitudCrearEmpresa): Promise<Empresa> =>
  enviar<Empresa>('/organizacion/empresas', solicitud);
