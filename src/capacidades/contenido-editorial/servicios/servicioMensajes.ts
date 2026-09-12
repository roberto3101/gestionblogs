import { obtener, ajustar, enviar } from '@integraciones/http/clienteHttp';
import type { Identificador } from '@compartido/tipos/identificador';
import type { ListadoPaginado, Paginacion } from '@compartido/tipos/paginacion';
import { aCadenaConsulta } from '@compartido/tipos/paginacion';
import type { MensajeContacto, Suscriptor } from '../contratos/mensaje';

export const listarMensajes = (
  sitioId: Identificador,
  paginacion: Paginacion,
  estado: string,
): Promise<ListadoPaginado<MensajeContacto>> =>
  obtener<ListadoPaginado<MensajeContacto>>(
    `/contenido/sitios/${sitioId}/mensajes?${aCadenaConsulta(paginacion)}` +
      (estado ? `&estado=${encodeURIComponent(estado)}` : ''),
  );

export const cambiarEstadoMensaje = (
  mensajeId: Identificador,
  estado: string,
): Promise<MensajeContacto> =>
  ajustar<MensajeContacto>(`/contenido/mensajes/${mensajeId}/estado`, { estado });

export const listarSuscriptores = (
  sitioId: Identificador,
  paginacion: Paginacion,
): Promise<ListadoPaginado<Suscriptor>> =>
  obtener<ListadoPaginado<Suscriptor>>(
    `/contenido/sitios/${sitioId}/suscriptores?${aCadenaConsulta(paginacion)}`,
  );

/** Manda un correo de prueba a los destinatarios configurados. */
export const probarCorreo = (sitioId: Identificador, idioma: string) =>
  enviar<{ enviado: boolean; destinatarios: string[] }>(
    `/contenido/sitios/${sitioId}/correo/prueba?idioma=${encodeURIComponent(idioma)}`,
    {},
  );
