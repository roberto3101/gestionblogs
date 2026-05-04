import { enviar } from '@integraciones/http/clienteHttp';
import type { Medio, SolicitudSubirMedio } from '../contratos/medio';

export const subirMedio = (solicitud: SolicitudSubirMedio): Promise<Medio> =>
  enviar<Medio>('/contenido/medios', solicitud);
