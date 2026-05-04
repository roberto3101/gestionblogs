import { useState, useEffect, type FormEvent } from 'react';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { generarSlug } from '@compartido/utilidades/generarSlug';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import { useCrearEtiqueta } from '../../ganchos/useEtiquetas';
import type { Identificador } from '@compartido/tipos/identificador';
import type { EtiquetaContenido } from '../../contratos/etiqueta';

interface PropiedadesFormularioEtiqueta {
  sitioId: Identificador | null;
  alCrear?: (etiqueta: EtiquetaContenido) => void;
}

export const FormularioEtiqueta = ({ sitioId, alCrear }: PropiedadesFormularioEtiqueta) => {
  const [nombre, asignarNombre] = useState('');
  const [slug, asignarSlug] = useState('');
  const creacion = useCrearEtiqueta(sitioId);

  useEffect(() => {
    if (nombre && !slug) asignarSlug(generarSlug(nombre));
  }, [nombre, slug]);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    creacion.mutate(
      { nombre: nombre.trim(), slug: slug.trim() },
      { onSuccess: alCrear },
    );
  };

  const mensajeError = creacion.error instanceof ErrorHttp ? creacion.error.message : null;

  return (
    <form onSubmit={enviar} className="space-y-5">
      <CampoTexto
        etiqueta="Nombre"
        value={nombre}
        onChange={(e) => asignarNombre(e.target.value)}
        required
        placeholder="Lanzamientos"
      />
      <CampoTexto
        etiqueta="Slug"
        value={slug}
        onChange={(e) => asignarSlug(generarSlug(e.target.value))}
        required
        placeholder="lanzamientos"
      />
      {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
      <div className="flex justify-end pt-2">
        <Boton type="submit" cargando={creacion.isPending} disabled={!sitioId}>
          Crear etiqueta
        </Boton>
      </div>
    </form>
  );
};
