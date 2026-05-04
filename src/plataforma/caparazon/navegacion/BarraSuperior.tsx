import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { useSesion } from '@plataforma/identidad/ganchos/useSesion';
import { useCerrarSesion } from '@capacidades/identidad/ganchos/useCerrarSesion';
import { InterruptorSitioActivo } from './InterruptorSitioActivo';

interface PropiedadesBarraSuperior {
  alAbrirSidebar?: () => void;
}

export const BarraSuperior = ({ alAbrirSidebar }: PropiedadesBarraSuperior) => {
  const { sesion } = useSesion();
  const cerrar = useCerrarSesion();

  return (
    <header className="filete-bajo bg-papel/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {alAbrirSidebar && (
            <button
              type="button"
              onClick={alAbrirSidebar}
              className="lg:hidden h-9 w-9 grid place-items-center rounded-suave hover:bg-ceniza/40 text-tinta"
              aria-label="Abrir menú"
            >
              <span className="block w-4 h-px bg-current shadow-[0_-5px_0_currentColor,0_5px_0_currentColor]" />
            </button>
          )}
          <InterruptorSitioActivo />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-grafito truncate max-w-[200px]">
            {sesion?.correo_electronico}
          </span>
          <Boton
            tono="discreto"
            tamano="compacto"
            cargando={cerrar.isPending}
            onClick={() => cerrar.mutate()}
          >
            Cerrar sesión
          </Boton>
        </div>
      </div>
    </header>
  );
};
