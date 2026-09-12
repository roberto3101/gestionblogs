import { useRef, useState } from 'react';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { subirArchivo } from '../../servicios/servicioSubidaArchivos';

/**
 * Campo para fotos, vídeos y documentos.
 *
 * Antes había que escribir a mano el nombre del archivo y acertar. Ahora se
 * elige desde el ordenador, se sube y se ve al momento.
 *
 * Sigue aceptando los nombres antiguos que ya estaban en el contenido: una
 * foto que ponga «article-city-ai» se muestra igual, buscándola donde vive.
 */

type Clase = 'foto' | 'video' | 'archivo';

interface Propiedades {
  etiqueta: string;
  clase: Clase;
  valor: string;
  alCambiar: (nuevo: string) => void;
  /** Dirección de la web, para mostrar las fotos que aún viven en el sitio. */
  baseDelSitio: string;
}

const ACEPTA: Record<Clase, string> = {
  foto: 'image/*',
  video: 'video/mp4,video/webm,video/quicktime',
  archivo: '.pdf,.xlsx,.docx,.csv,.zip',
};

const VERBO: Record<Clase, string> = {
  foto: 'foto',
  video: 'vídeo',
  archivo: 'archivo',
};

const LIMITE_MB = 100;

/** Reproduce lo que hace la web: un nombre suelto vive en /images. */
const direccionDeVista = (valor: string, clase: Clase, baseDelSitio: string): string => {
  const limpio = valor.trim();
  if (!limpio) return '';
  if (/^(https?:)?\/\//.test(limpio) || limpio.startsWith('data:')) return limpio;
  if (limpio.startsWith('/')) return baseDelSitio.replace(/\/+$/, '') + limpio;
  if (clase === 'foto') return `${baseDelSitio.replace(/\/+$/, '')}/images/${limpio}.webp`;
  return baseDelSitio.replace(/\/+$/, '') + '/' + limpio;
};

const nombreVisible = (valor: string): string => {
  const limpio = valor.trim();
  if (!limpio) return '';
  const trozos = limpio.split('/');
  return trozos[trozos.length - 1] || limpio;
};

export const CampoArchivo = ({ etiqueta, clase, valor, alCambiar, baseDelSitio }: Propiedades) => {
  const { sitioActivo } = useSitioActivo();
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, asignarSubiendo] = useState(false);
  const [fallo, asignarFallo] = useState('');

  const vista = direccionDeVista(valor, clase, baseDelSitio);

  const elegir = async (archivo: File | undefined) => {
    if (!archivo) return;
    asignarFallo('');
    if (archivo.size > LIMITE_MB * 1024 * 1024) {
      asignarFallo(`El archivo pesa demasiado. El máximo son ${LIMITE_MB} MB.`);
      return;
    }
    asignarSubiendo(true);
    try {
      const subido = await subirArchivo(archivo, sitioActivo?.id);
      alCambiar(subido.url);
    } catch (error) {
      asignarFallo(
        error instanceof Error
          ? `No se pudo subir: ${error.message}`
          : 'No se pudo subir el archivo.',
      );
    } finally {
      asignarSubiendo(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="meta-tipografia text-grafito">{etiqueta}</span>

      <div className="flex items-start gap-4">
        <div className="shrink-0 w-40 h-24 rounded-suave border border-ceniza bg-lienzo overflow-hidden flex items-center justify-center">
          {!vista && <span className="text-xs text-humo">Sin {VERBO[clase]}</span>}
          {vista && clase === 'foto' && (
            <img src={vista} alt="" className="w-full h-full object-cover" />
          )}
          {vista && clase === 'video' && (
            <video src={vista} className="w-full h-full object-cover" muted playsInline />
          )}
          {vista && clase === 'archivo' && (
            <span className="text-xs text-grafito px-2 text-center break-all">
              {nombreVisible(valor)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <Boton
              tono="discreto"
              tamano="compacto"
              type="button"
              cargando={subiendo}
              onClick={() => entrada.current?.click()}
            >
              {valor ? `Cambiar ${VERBO[clase]}` : `Elegir ${VERBO[clase]}`}
            </Boton>
            {valor && !subiendo && (
              <Boton
                tono="fantasma"
                tamano="compacto"
                type="button"
                onClick={() => alCambiar('')}
              >
                Quitar
              </Boton>
            )}
          </div>

          {valor && (
            <span className="text-xs text-humo break-all">{nombreVisible(valor)}</span>
          )}
          {!valor && !fallo && (
            <span className="text-xs text-humo">
              Elige un archivo de tu ordenador. Máximo {LIMITE_MB} MB.
            </span>
          )}
          {fallo && <span className="text-xs text-cinabrio">{fallo}</span>}
        </div>
      </div>

      <input
        ref={entrada}
        type="file"
        accept={ACEPTA[clase]}
        className="hidden"
        onChange={(evento) => {
          void elegir(evento.target.files?.[0]);
          // Permite volver a elegir el mismo archivo si hizo falta reintentar.
          evento.target.value = '';
        }}
      />
    </div>
  );
};
