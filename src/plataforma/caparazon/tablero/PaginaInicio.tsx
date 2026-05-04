import { TituloEditorial } from '@compartido/interfaz/primitivas/TituloEditorial';
import { useSesion } from '@plataforma/identidad/ganchos/useSesion';
import { AsistenteFlujoPublicacion } from '@plataforma/activacion/AsistenteFlujoPublicacion';

export const PaginaInicio = () => {
  const { sesion } = useSesion();
  const correo = sesion?.correo_electronico ?? 'editor';
  const nombreCorto = correo.split('@')[0];

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="meta-tipografia">Hoy en el panel</p>
        <TituloEditorial nivel={1}>
          Hola, <span className="italic text-oliva">{nombreCorto}</span>.
        </TituloEditorial>
        <p className="text-grafito max-w-lectura">
          Te llevamos paso a paso desde cero hasta tu primer post publicado.
          Cuando termines un paso, aparece marcado y avanzamos al siguiente.
        </p>
      </div>
      <AsistenteFlujoPublicacion />
    </div>
  );
};
