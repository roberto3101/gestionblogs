import type { SobreApi } from '@compartido/tipos/sobre';
import { ErrorHttp } from './errorHttp';
import { guardarRefresh, guardarToken, obtenerRefresh, obtenerToken, olvidarSesion } from './almacenSesion';
import { configuracionEntorno } from '@compartido/constantes/configuracionEntorno';

interface OpcionesPeticion {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  cuerpo?: unknown;
  cabeceras?: Record<string, string>;
  sinAutenticacion?: boolean;
  /** Uso interno: marca el reintento para no entrar en bucle. */
  yaReintentado?: boolean;
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

/* --------------------------------------------------------------------------
 * Sesión caducada
 *
 * El token de acceso dura una hora. Antes, al caducar, cada peticion empezaba
 * a devolver 401 y aqui no se hacia nada con ello: el error subia a la
 * pantalla, que lo convertia en una lista vacia. El panel seguia pintandose
 * como si todo fuera bien y decia cosas como «esta web no tiene firmas»,
 * que era falso. Quien lo usaba pensaba que habia perdido sus datos.
 *
 * Ahora un 401 se intenta arreglar solo: se cambia el token de refresco por
 * uno nuevo y se repite la peticion. Si el refresco tampoco vale, se cierra la
 * sesion y se manda a la pantalla de entrada explicando por que.
 * -------------------------------------------------------------------------- */

/**
 * Renovación en curso, si la hay.
 *
 * El panel lanza varias peticiones a la vez, asi que al caducar el token
 * llegan varios 401 casi simultaneos. Sin esto, cada uno pediria su propia
 * renovacion; como el servidor rota el refresco en cada uso, la primera
 * ganaria y las demas invalidarian la sesion recien renovada. Compartiendo
 * una sola promesa, todas esperan a la misma.
 */
let renovacionEnCurso: Promise<boolean> | null = null;

const irAEntrada = (): void => {
  olvidarSesion();
  // Se avisa a la pantalla de entrada para que diga que la sesion caduco, en
  // vez de aparecer sin explicacion.
  try {
    sessionStorage.setItem('panel.sesionCaducada', '1');
  } catch {
    // Navegador con el almacenamiento cerrado: se pierde el aviso, no el
    // redirigir, que es lo importante.
  }
  if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/iniciar-sesion')) {
    window.location.assign(`${import.meta.env.BASE_URL}iniciar-sesion`.replace('//','/'));
  }
};

const renovarSesion = async (): Promise<boolean> => {
  const refresco = obtenerRefresh();
  if (!refresco) return false;
  try {
    // Con fetch directo, no con las funciones de abajo: si esta llamada
    // pasara por el mismo camino, un 401 aqui volveria a intentar renovar.
    const respuesta = await fetch(`${configuracionEntorno.urlBaseApi}/sesiones/renovar`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresco }),
    });
    if (!respuesta.ok) return false;
    const sobre = (await respuesta.json()) as SobreApi<{ token: string; refresh_token: string }>;
    if (!sobre?.exito || !sobre.datos?.token) return false;
    guardarToken(sobre.datos.token);
    guardarRefresh(sobre.datos.refresh_token);
    return true;
  } catch {
    return false;
  }
};

const asegurarSesionFresca = (): Promise<boolean> => {
  if (!renovacionEnCurso) {
    renovacionEnCurso = renovarSesion().finally(() => {
      renovacionEnCurso = null;
    });
  }
  return renovacionEnCurso;
};

export const peticionar = async <T = unknown>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> => {
  const respuesta = await fetch(`${configuracionEntorno.urlBaseApi}${ruta}`, {
    method: opciones.metodo ?? 'GET',
    headers: construirCabeceras(opciones),
    body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
  });

  const puedeRenovar =
    respuesta.status === 401 && !opciones.sinAutenticacion && !opciones.yaReintentado;

  if (puedeRenovar) {
    const renovada = await asegurarSesionFresca();
    if (renovada) {
      return peticionar<T>(ruta, { ...opciones, yaReintentado: true });
    }
    irAEntrada();
    throw new ErrorHttp(401, 'SESION_CADUCADA', 'Tu sesión caducó. Entra otra vez.');
  }

  return interpretarSobre<T>(respuesta);
};

export const obtener = <T>(ruta: string): Promise<T> => peticionar<T>(ruta, { metodo: 'GET' });
export const enviar = <T>(ruta: string, cuerpo: unknown): Promise<T> => peticionar<T>(ruta, { metodo: 'POST', cuerpo });
export const enviarSinAuth = <T>(ruta: string, cuerpo: unknown): Promise<T> =>
  peticionar<T>(ruta, { metodo: 'POST', cuerpo, sinAutenticacion: true });
export const reemplazar = <T>(ruta: string, cuerpo: unknown): Promise<T> => peticionar<T>(ruta, { metodo: 'PUT', cuerpo });
export const ajustar = <T>(ruta: string, cuerpo: unknown): Promise<T> => peticionar<T>(ruta, { metodo: 'PATCH', cuerpo });
export const eliminar = <T>(ruta: string): Promise<T> => peticionar<T>(ruta, { metodo: 'DELETE' });
