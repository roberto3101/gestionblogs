import type { SobreApi } from '@compartido/tipos/sobre';
import { ErrorHttp } from './errorHttp';
import { obtenerToken } from './almacenSesion';
import { configuracionEntorno } from '@compartido/constantes/configuracionEntorno';

interface OpcionesPeticion {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  cuerpo?: unknown;
  cabeceras?: Record<string, string>;
  sinAutenticacion?: boolean;
}

const construirCabeceras = (opciones: OpcionesPeticion): Headers => {
  const cabeceras = new Headers(opciones.cabeceras ?? {});
  cabeceras.set('Accept', 'application/json');
  if (opciones.cuerpo !== undefined) {
    cabeceras.set('Content-Type', 'application/json');
  }
  if (!opciones.sinAutenticacion) {
    const token = obtenerToken();
    if (token) cabeceras.set('Authorization', `Bearer ${token}`);
  }
  return cabeceras;
};

const interpretarSobre = async <T>(respuesta: Response): Promise<T> => {
  const textoCrudo = await respuesta.text();
  let sobre: SobreApi<T> | null = null;
  if (textoCrudo) {
    try {
      sobre = JSON.parse(textoCrudo) as SobreApi<T>;
    } catch {
      throw new ErrorHttp(respuesta.status, 'RESPUESTA_INVALIDA', 'La respuesta no es JSON valido');
    }
  }
  if (!respuesta.ok || (sobre && sobre.exito === false)) {
    const codigo = sobre?.error?.codigo ?? `HTTP_${respuesta.status}`;
    const mensaje = sobre?.error?.mensaje ?? respuesta.statusText;
    throw new ErrorHttp(respuesta.status, codigo, mensaje);
  }
  return (sobre?.datos ?? null) as T;
};

export const peticionar = async <T = unknown>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> => {
  const respuesta = await fetch(`${configuracionEntorno.urlBaseApi}${ruta}`, {
    method: opciones.metodo ?? 'GET',
    headers: construirCabeceras(opciones),
    body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
  });
  return interpretarSobre<T>(respuesta);
};

export const obtener = <T>(ruta: string): Promise<T> => peticionar<T>(ruta, { metodo: 'GET' });
export const enviar = <T>(ruta: string, cuerpo: unknown): Promise<T> => peticionar<T>(ruta, { metodo: 'POST', cuerpo });
export const enviarSinAuth = <T>(ruta: string, cuerpo: unknown): Promise<T> =>
  peticionar<T>(ruta, { metodo: 'POST', cuerpo, sinAutenticacion: true });
export const reemplazar = <T>(ruta: string, cuerpo: unknown): Promise<T> => peticionar<T>(ruta, { metodo: 'PUT', cuerpo });
export const ajustar = <T>(ruta: string, cuerpo: unknown): Promise<T> => peticionar<T>(ruta, { metodo: 'PATCH', cuerpo });
export const eliminar = <T>(ruta: string): Promise<T> => peticionar<T>(ruta, { metodo: 'DELETE' });
