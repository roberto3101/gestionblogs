import { obtener, enviar, reemplazar } from '@integraciones/http/clienteHttp';
import type { Identificador } from '@compartido/tipos/identificador';
import type {
  Bloque,
  ResultadoPublicacion,
  ResumenIdioma,
  RevisionBloque,
  SolicitudGuardarBloque,
  SolicitudPublicarBloques,
} from '../contratos/bloque';

export const listarBloques = (sitioId: Identificador, idioma: string): Promise<Bloque[]> =>
  obtener<Bloque[]>(`/contenido/sitios/${sitioId}/bloques?idioma=${encodeURIComponent(idioma)}`);

export const resumenPorIdioma = (sitioId: Identificador): Promise<ResumenIdioma[]> =>
  obtener<ResumenIdioma[]>(`/contenido/sitios/${sitioId}/bloques/resumen`);

/** Guarda como borrador. No cambia lo que ve el público. */
export const guardarBloque = (
  sitioId: Identificador,
  solicitud: SolicitudGuardarBloque,
): Promise<Bloque> => reemplazar<Bloque>(`/contenido/sitios/${sitioId}/bloques`, solicitud);

export const descartarBorrador = (
  sitioId: Identificador,
  idioma: string,
  clave: string,
): Promise<Bloque> =>
  enviar<Bloque>(`/contenido/sitios/${sitioId}/bloques/descartar`, { idioma, clave });

/** Lleva los borradores a producción y dispara la reconstrucción del sitio. */
export const publicarBloques = (
  sitioId: Identificador,
  solicitud: SolicitudPublicarBloques,
): Promise<ResultadoPublicacion> =>
  enviar<ResultadoPublicacion>(`/contenido/sitios/${sitioId}/bloques/publicar`, solicitud);

export const listarRevisiones = (
  sitioId: Identificador,
  idioma: string,
  clave: string,
): Promise<RevisionBloque[]> =>
  obtener<RevisionBloque[]>(
    `/contenido/sitios/${sitioId}/bloques/revisiones` +
      `?idioma=${encodeURIComponent(idioma)}&clave=${encodeURIComponent(clave)}`,
  );

/** Carga una revisión antigua como borrador. No toca lo publicado. */
export const restaurarRevision = (
  sitioId: Identificador,
  idioma: string,
  clave: string,
  numero: number,
): Promise<Bloque> =>
  enviar<Bloque>(`/contenido/sitios/${sitioId}/bloques/restaurar`, { idioma, clave, numero });
