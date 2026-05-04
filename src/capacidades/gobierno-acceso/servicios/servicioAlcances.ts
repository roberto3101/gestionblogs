import { enviar } from '@integraciones/http/clienteHttp';
import type { SolicitudAsignarAlcance, SolicitudAsignarRolPermiso } from '../contratos/alcance';

export const asignarAlcance = (solicitud: SolicitudAsignarAlcance): Promise<unknown> =>
  enviar<unknown>('/gobierno/alcances', solicitud);

export const asignarRolPermiso = (solicitud: SolicitudAsignarRolPermiso): Promise<unknown> =>
  enviar<unknown>('/gobierno/rol-permiso', solicitud);
