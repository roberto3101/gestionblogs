import { useState, useEffect, type FormEvent } from 'react';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { generarSlug } from '@compartido/utilidades/generarSlug';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import { useCrearCategoria } from '../../ganchos/useCategorias';
import type { Identificador } from '@compartido/tipos/identificador';
import type { Categoria } from '../../contratos/categoria';

interface PropiedadesFormularioCategoria {
  sitioId: Identificador | null;
  alCrear?: (categoria: Categoria) => void;
}

export const FormularioCategoria = ({ sitioId, alCrear }: PropiedadesFormularioCategoria) => {
  const [nombre, asignarNombre] = useState('');
  const [slug, asignarSlug] = useState('');
  const [descripcion, asignarDescripcion] = useState('');
  const [color, asignarColor] = useState('#3f5c34');
  const creacion = useCrearCategoria(sitioId);

  useEffect(() => {
    if (nombre && !slug) asignarSlug(generarSlug(nombre));
  }, [nombre, slug]);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    creacion.mutate(
      {
        nombre: nombre.trim(),
        slug: slug.trim(),
        descripcion: descripcion.trim() || undefined,
        color,
      },
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
        placeholder="Anuncios"
      />
      <CampoTexto
        etiqueta="Slug"
        value={slug}
        onChange={(e) => asignarSlug(generarSlug(e.target.value))}
        required
        placeholder="anuncios"
      />
      <AreaTexto
        etiqueta="Descripción"
        value={descripcion}
        onChange={(e) => asignarDescripcion(e.target.value)}
        placeholder="Comunicados y novedades."
      />
      <label className="flex items-center gap-3">
        <span className="meta-tipografia">Color</span>
        <input
          type="color"
          value={color}
          onChange={(e) => asignarColor(e.target.value)}
          className="h-10 w-16 rounded-suave border border-ceniza cursor-pointer"
        />
        <span className="font-codigo text-xs text-humo">{color}</span>
      </label>
      {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
      <div className="flex justify-end pt-2">
        <Boton type="submit" cargando={creacion.isPending} disabled={!sitioId}>
          Crear categoría
        </Boton>
      </div>
    </form>
  );
};
