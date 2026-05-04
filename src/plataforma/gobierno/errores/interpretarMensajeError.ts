import { ErrorHttp } from '@integraciones/http/errorHttp';

const mensajePorCodigo: Record<string, string> = {
  HTTP_401: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  HTTP_403: 'No tienes permiso para esta acción.',
  HTTP_404: 'No encontramos lo que buscabas.',
  HTTP_409: 'Ya existe un registro con esos datos.',
  HTTP_422: 'Revisa los datos del formulario.',
  HTTP_500: 'Algo se rompió de nuestro lado. Reintenta en un momento.',
  RESPUESTA_INVALIDA: 'El servidor respondió en un formato que no entendimos.',
};

export const interpretarMensajeError = (
  error: unknown,
): { titulo: string; detalle?: string } => {
  if (error instanceof ErrorHttp) {
    const tituloLegible = mensajePorCodigo[error.codigo];
    if (tituloLegible) return { titulo: tituloLegible, detalle: error.message };
    return { titulo: error.message, detalle: error.codigo };
  }
  if (error instanceof Error) {
    return { titulo: 'Algo salió mal', detalle: error.message };
  }
  return { titulo: 'Algo salió mal', detalle: 'Error desconocido. Intenta nuevamente.' };
};
