import { configuracionEntorno } from '@compartido/constantes/configuracionEntorno';
import { obtenerToken } from '@integraciones/http/almacenSesion';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import type { Identificador } from '@compartido/tipos/identificador';

export interface ArchivoSubido {
  id: Identificador;
  url: string;
  tipo: 'IMAGEN' | 'VIDEO' | 'AUDIO' | 'DOCUMENTO';
  nombre: string;
  formato: string;
  tamano_bytes: number;
  creado_en: string;
}

interface SobreApi<T> {
  exito: boolean;
  datos: T | null;
  error?: { codigo: string; mensaje: string };
}

export const subirArchivo = async (archivo: File, sitioId?: Identificador): Promise<ArchivoSubido> => {
  const formulario = new FormData();
  formulario.append('archivo', archivo);
  if (sitioId) formulario.append('sitio_id', sitioId);

  const cabeceras: Record<string, string> = { Accept: 'application/json' };
  const token = obtenerToken();
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(`${configuracionEntorno.urlBaseApi}/contenido/medios/subir`, {
    method: 'POST',
    headers: cabeceras,
    body: formulario,
  });
  const texto = await respuesta.text();
  let sobre: SobreApi<ArchivoSubido> | null = null;
  try {
    sobre = JSON.parse(texto) as SobreApi<ArchivoSubido>;
  } catch {
    throw new ErrorHttp(respuesta.status, 'RESPUESTA_INVALIDA', 'El servidor no devolvió JSON');
  }
  if (!respuesta.ok || !sobre.exito || !sobre.datos) {
    const codigo = sobre.error?.codigo ?? `HTTP_${respuesta.status}`;
    const mensaje = sobre.error?.mensaje ?? 'Falló la subida';
    throw new ErrorHttp(respuesta.status, codigo, mensaje);
  }
  return sobre.datos;
};
