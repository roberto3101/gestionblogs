import { useState, useEffect, type FormEvent } from 'react';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { generarSlug } from '@compartido/utilidades/generarSlug';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import { useCrearAutor } from '../../ganchos/useAutores';
import { useSesion } from '@plataforma/identidad/ganchos/useSesion';
import type { Autor } from '../../contratos/autor';

interface PropiedadesFormularioAutor {
  alCrear?: (autor: Autor) => void;
}

export const FormularioAutor = ({ alCrear }: PropiedadesFormularioAutor) => {
  const { sesion } = useSesion();
  const [nombrePublico, asignarNombrePublico] = useState('');
  const [slug, asignarSlug] = useState('');
  const [biografia, asignarBiografia] = useState('');
  const [sitioWeb, asignarSitioWeb] = useState('');
  const creacion = useCrearAutor();

  useEffect(() => {
    if (nombrePublico && !slug) asignarSlug(generarSlug(nombrePublico));
  }, [nombrePublico, slug]);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!sesion?.usuario_id) return;
    creacion.mutate(
      {
        usuario_id: sesion.usuario_id,
        nombre_publico: nombrePublico.trim(),
        slug: slug.trim(),
        biografia: biografia.trim() || undefined,
        sitio_web: sitioWeb.trim() || undefined,
      },
      { onSuccess: alCrear },
    );
  };

  const mensajeError = creacion.error instanceof ErrorHttp ? creacion.error.message : null;

  return (
    <form onSubmit={enviar} className="space-y-5">
      <CampoTexto
        etiqueta="Nombre público"
        ayuda="Como aparecerá firmado en cada post."
        value={nombrePublico}
        onChange={(e) => asignarNombrePublico(e.target.value)}
        required
        placeholder="Equipo Editorial"
      />
      <CampoTexto
        etiqueta="Slug"
        ayuda="URL pública del autor."
        value={slug}
        onChange={(e) => asignarSlug(generarSlug(e.target.value))}
        required
        placeholder="equipo-editorial"
      />
      <AreaTexto
        etiqueta="Biografía"
        ayuda="Una breve presentación. Opcional."
        value={biografia}
        onChange={(e) => asignarBiografia(e.target.value)}
        placeholder="Equipo que cuida la voz editorial del blog."
      />
      <CampoTexto
        etiqueta="Sitio web"
        ayuda="Opcional."
        value={sitioWeb}
        onChange={(e) => asignarSitioWeb(e.target.value)}
        placeholder="https://miempresa.com"
      />
      {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
      <div className="flex justify-end pt-2">
        <Boton type="submit" cargando={creacion.isPending} tamano="amplio">
          Crear autor
        </Boton>
      </div>
    </form>
  );
};
