import { useNavigate } from 'react-router-dom';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { unirClases } from '@compartido/utilidades/unirClases';
import { useFlujoPublicacion, type EstadoPaso, type PasoFlujo } from './detectorProgresoFlujo';

const estiloPorEstado: Record<EstadoPaso, { contenedor: string; numero: string; titulo: string }> = {
  cumplido: {
    contenedor: 'border-oliva/30 bg-oliva-suave/30',
    numero: 'bg-oliva text-lienzo',
    titulo: 'text-grafito line-through decoration-oliva/40 decoration-2',
  },
  pendiente: {
    contenedor: 'border-tinta bg-papel shadow-levantado',
    numero: 'bg-tinta text-lienzo',
    titulo: 'text-tinta',
  },
  bloqueado: {
    contenedor: 'border-ceniza bg-papel/40 opacity-60',
    numero: 'bg-ceniza text-humo',
    titulo: 'text-humo',
  },
};

const TarjetaPaso = ({ paso, esActual, alAccionar }: { paso: PasoFlujo; esActual: boolean; alAccionar: () => void }) => {
  const estilos = estiloPorEstado[paso.estado];
  return (
    <div className={unirClases('border rounded-seccion p-5 transicion-natural', estilos.contenedor)}>
      <div className="flex items-start gap-4">
        <span
          className={unirClases(
            'flex-shrink-0 h-9 w-9 grid place-items-center rounded-full font-medium font-codigo text-sm',
            estilos.numero,
          )}
        >
          {paso.estado === 'cumplido' ? '✓' : paso.numero}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className={unirClases('titulo-editorial text-lg', estilos.titulo)}>{paso.titulo}</h3>
          <p className="text-sm text-grafito mt-1">{paso.descripcion}</p>
        </div>
        {esActual && (
          <Boton onClick={alAccionar} tamano="estandar">
            {paso.textoAccion}
          </Boton>
        )}
      </div>
    </div>
  );
};

export const AsistenteFlujoPublicacion = () => {
  const navegar = useNavigate();
  const { pasos, pasoActual, cargando } = useFlujoPublicacion();
  const completados = pasos.filter((p) => p.estado === 'cumplido').length;
  const totalPasos = pasos.length;
  const porcentaje = Math.round((completados / totalPasos) * 100);

  if (cargando) {
    return (
      <div className="lamina p-8">
        <p className="meta-tipografia mb-2">Calculando tu progreso…</p>
        <div className="h-1 bg-ceniza rounded-full overflow-hidden">
          <div className="h-full bg-oliva animate-pulse" style={{ width: '40%' }} />
        </div>
      </div>
    );
  }

  if (!pasoActual) {
    return (
      <div className="lamina p-8 border-oliva/30 bg-oliva-suave/30">
        <p className="meta-tipografia mb-2">Listo</p>
        <h3 className="titulo-editorial text-xl text-tinta">
          Ya tienes todo configurado. Sigue escribiendo.
        </h3>
        <p className="text-grafito text-sm mt-2 max-w-lectura">
          Si quieres, puedes ir directo a <button onClick={() => navegar('/panel/posts')} className="text-oliva underline">tus posts</button> o usar el menú lateral para gestionar lo que quieras.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="meta-tipografia">Asistente · Publicar tu primer post</p>
          <h2 className="titulo-editorial text-2xl text-tinta mt-1">
            Vas en {completados} de {totalPasos} pasos
          </h2>
        </div>
        <span className="text-sm text-humo font-codigo">{porcentaje}%</span>
      </div>
      <div className="h-1.5 bg-ceniza rounded-full overflow-hidden">
        <div
          className="h-full bg-oliva transicion-natural"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <div className="space-y-3">
        {pasos.map((paso) => (
          <TarjetaPaso
            key={paso.clave}
            paso={paso}
            esActual={paso === pasoActual}
            alAccionar={() => navegar(paso.rutaAccion)}
          />
        ))}
      </div>
    </section>
  );
};
