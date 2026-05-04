import { useNotificaciones, type TonoNotificacion } from './contextoNotificaciones';
import { unirClases } from '@compartido/utilidades/unirClases';

const estiloPorTono: Record<TonoNotificacion, { contenedor: string; punto: string; titulo: string }> = {
  exito: {
    contenedor: 'border-oliva/40 bg-papel',
    punto: 'bg-oliva',
    titulo: 'text-tinta',
  },
  error: {
    contenedor: 'border-cinabrio/40 bg-papel',
    punto: 'bg-cinabrio',
    titulo: 'text-tinta',
  },
  aviso: {
    contenedor: 'border-ambar/40 bg-papel',
    punto: 'bg-ambar',
    titulo: 'text-tinta',
  },
  info: {
    contenedor: 'border-ceniza bg-papel',
    punto: 'bg-grafito',
    titulo: 'text-tinta',
  },
};

export const PilaNotificaciones = () => {
  const { notificaciones, descartar } = useNotificaciones();
  if (notificaciones.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 w-[360px] pointer-events-none">
      {notificaciones.map((notificacion) => {
        const estilos = estiloPorTono[notificacion.tono];
        return (
          <div
            key={notificacion.id}
            className={unirClases(
              'border rounded-marco shadow-levantado px-4 py-3 pointer-events-auto',
              'animate-[deslizarEntrar_240ms_cubic-bezier(0.2,0.8,0.2,1)]',
              estilos.contenedor,
            )}
          >
            <div className="flex items-start gap-3">
              <span className={unirClases('h-2 w-2 mt-2 rounded-full flex-shrink-0', estilos.punto)} />
              <div className="flex-1 min-w-0">
                <p className={unirClases('text-sm font-medium', estilos.titulo)}>
                  {notificacion.titulo}
                </p>
                {notificacion.detalle && (
                  <p className="text-xs text-grafito mt-0.5">{notificacion.detalle}</p>
                )}
              </div>
              <button
                onClick={() => descartar(notificacion.id)}
                className="text-humo hover:text-tinta text-lg leading-none"
                aria-label="Cerrar notificación"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
