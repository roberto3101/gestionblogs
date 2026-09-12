/**
 * Foto de portada de un post.
 *
 * Antes no existía. El post se guardaba sin portada y la web le ponía una foto
 * de archivo para que la tarjeta no saliera desnuda, con el resultado de que
 * aparecían imágenes que nadie había subido. Ahora la web no inventa nada y
 * la portada se elige aquí, o el post va sin ella.
 */

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';
import { subirArchivo } from '../../servicios/servicioSubidaArchivos';
import { useNotificaciones } from '@plataforma/gobierno/errores/contextoNotificaciones';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import type { Identificador } from '@compartido/tipos/identificador';

interface PropiedadesCampoPortada {
  /** Id en la biblioteca de medios; es lo que se guarda en el post. */
  valorId: Identificador | '';
  /** Dirección de la foto, solo para poder enseñarla aquí y en la vista previa. */
  valorUrl: string;
  alCambiar: (id: Identificador | '', url: string) => void;
  sitioId: Identificador | '';
}

export const CampoPortada = ({ valorId, valorUrl, alCambiar, sitioId }: PropiedadesCampoPortada) => {
  const entradaRef = useRef<HTMLInputElement | null>(null);
  const [subiendo, asignarSubiendo] = useState(false);
  const [arrastrando, asignarArrastrando] = useState(false);
  const { publicar } = useNotificaciones();

  const subir = async (archivo: File) => {
    if (!sitioId) {
      publicar({
        tono: 'error',
        titulo: 'Elige primero la web',
        detalle: 'La foto se guarda en la biblioteca de esa web.',
      });
      return;
    }
    asignarSubiendo(true);
    try {
      const subido = await subirArchivo(archivo, sitioId as Identificador);
      // Sin registro no hay id que guardar en el post: se avisa en vez de
      // dejar una portada que al guardar sería rechazada.
      if (!subido.registrado || !subido.id) {
        publicar({
          tono: 'error',
          titulo: 'La foto no quedó registrada',
          detalle: 'Vuelve a intentarlo con una web seleccionada.',
        });
        return;
      }
      alCambiar(subido.id, subido.url);
    } catch (error) {
      const mensaje = error instanceof ErrorHttp ? error.message : 'No se pudo subir la foto';
      publicar({ tono: 'error', titulo: 'La subida falló', detalle: mensaje });
    } finally {
      asignarSubiendo(false);
    }
  };

  const alElegir = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (archivo) void subir(archivo);
    evento.target.value = '';
  };

  const alSoltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    asignarArrastrando(false);
    const archivo = evento.dataTransfer.files?.[0];
    if (archivo) void subir(archivo);
  };

  return (
    <div className="space-y-1.5">
      <span className="meta-tipografia">Foto de portada</span>

      <input ref={entradaRef} type="file" accept="image/*" className="hidden" onChange={alElegir} />

      {valorUrl ? (
        <div className="overflow-hidden rounded-suave border border-ceniza">
          <img src={valorUrl} alt="" className="block h-32 w-full object-cover" />
          <div className="flex items-center justify-between gap-2 bg-papel px-2.5 py-2">
            <span className="meta-tipografia text-xs text-humo">Se verá arriba del post</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => entradaRef.current?.click()}
                className="h-7 rounded-suave border border-ceniza px-2 text-xs text-grafito hover:bg-ceniza/40 hover:text-tinta"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={() => alCambiar('', '')}
                className="h-7 rounded-suave px-2 text-xs text-humo hover:bg-cinabrio/10 hover:text-cinabrio"
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            asignarArrastrando(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            asignarArrastrando(false);
          }}
          onDrop={alSoltar}
          className={unirClases(
            'rounded-suave border border-dashed border-ceniza bg-papel px-3 py-5 text-center transicion-natural',
            arrastrando && 'border-oliva bg-oliva-suave/40',
          )}
        >
          <button
            type="button"
            onClick={() => entradaRef.current?.click()}
            disabled={subiendo}
            className="h-8 rounded-suave bg-tinta px-3 text-xs font-medium text-lienzo transicion-natural hover:bg-grafito disabled:opacity-60"
          >
            {subiendo ? 'Subiendo…' : 'Elegir foto'}
          </button>
          <p className="meta-tipografia mt-2 text-xs text-humo">
            O arrástrala aquí. Si no pones ninguna, el post sale sin foto.
          </p>
        </div>
      )}

      {valorId && !valorUrl && (
        <p className="text-xs text-ambar">La portada está puesta pero no se puede mostrar aquí.</p>
      )}
    </div>
  );
};
