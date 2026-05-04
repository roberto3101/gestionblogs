import { enviarSinAuth, eliminar, obtener } from '@integraciones/http/clienteHttp';
import type { SesionEmitida, SolicitudIniciarSesion } from '../contratos/sesion';

export const iniciarSesion = (solicitud: SolicitudIniciarSesion): Promise<SesionEmitida> =>
  enviarSinAuth<SesionEmitida>('/sesiones/', solicitud);

export const consultarSesionActual = (): Promise<SesionEmitida> =>
  obtener<SesionEmitida>('/sesiones/actual');

export const cerrarSesion = (): Promise<unknown> =>
  eliminar<unknown>('/sesiones/actual');

export const renovarSesion = (refreshToken: string): Promise<SesionEmitida> =>
  enviarSinAuth<SesionEmitida>('/sesiones/renovar', { refresh_token: refreshToken });
