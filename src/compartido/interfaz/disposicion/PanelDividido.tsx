import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';

/**
 * Dos paneles con una barra en medio que se arrastra.
 *
 * Los que editan y los que miran la web quieren repartos distintos: quien está
 * escribiendo quiere sitio para el formulario, y quien está revisando cómo
 * queda quiere la web lo más grande posible. Con un reparto fijo siempre había
 * alguien apretado.
 *
 * El reparto se recuerda por pantalla, así que quien lo deja a su gusto se lo
 * encuentra igual la próxima vez.
 *
 * En pantallas estrechas no hay nada que repartir: los dos paneles se ponen uno
 * debajo del otro y la barra desaparece.
 */

interface Propiedades {
  izquierda: ReactNode;
  /** Si no hay nada que enseñar al lado, la izquierda ocupa todo. */
  derecha?: ReactNode | null;
  /** Con qué nombre se recuerda el reparto. */
  recuerdaComo: string;
  /** Lo mínimo que puede quedarse cada lado, en píxeles. */
  minimo?: number;
}

const ANCHO_MINIMO_PARA_PARTIR = 1000;

const leerRecordado = (clave: string): number | null => {
  try {
    const guardado = window.localStorage.getItem(`panel.reparto.${clave}`);
    const numero = guardado ? Number(guardado) : NaN;
    return Number.isFinite(numero) && numero > 0 ? numero : null;
  } catch {
    return null;
  }
};

const recordar = (clave: string, valor: number) => {
  try {
    window.localStorage.setItem(`panel.reparto.${clave}`, String(Math.round(valor)));
  } catch {
    // Un navegador que no deja guardar no es motivo para romper la pantalla.
  }
};

export const PanelDividido = ({
  izquierda,
  derecha,
  recuerdaComo,
  minimo = 340,
}: Propiedades) => {
  const contenedor = useRef<HTMLDivElement>(null);
  const [anchoTotal, asignarAnchoTotal] = useState(0);
  const [anchoDerecha, asignarAnchoDerecha] = useState<number | null>(null);
  const [arrastrando, asignarArrastrando] = useState(false);

  useEffect(() => {
    const nodo = contenedor.current;
    if (!nodo) return;
    const medir = () => asignarAnchoTotal(nodo.clientWidth);
    medir();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', medir);
      return () => window.removeEventListener('resize', medir);
    }
    const vigia = new ResizeObserver(medir);
    vigia.observe(nodo);
    return () => vigia.disconnect();
  }, []);

  const partido = Boolean(derecha) && anchoTotal >= ANCHO_MINIMO_PARA_PARTIR;

  const limitar = useCallback(
    (valor: number) => Math.min(Math.max(valor, minimo), Math.max(minimo, anchoTotal - minimo)),
    [anchoTotal, minimo],
  );

  // El reparto de partida: lo que se dejó la última vez, o algo más de la
  // mitad para la web, que es lo que se viene a mirar.
  useEffect(() => {
    if (!partido || anchoDerecha !== null || anchoTotal === 0) return;
    asignarAnchoDerecha(limitar(leerRecordado(recuerdaComo) ?? Math.round(anchoTotal * 0.55)));
  }, [partido, anchoDerecha, anchoTotal, limitar, recuerdaComo]);

  const mover = (clienteX: number) => {
    const nodo = contenedor.current;
    if (!nodo) return;
    const caja = nodo.getBoundingClientRect();
    asignarAnchoDerecha(limitar(caja.right - clienteX));
  };

  const alSoltar = () => {
    asignarArrastrando(false);
    if (anchoDerecha !== null) recordar(recuerdaComo, anchoDerecha);
  };

  if (!partido) {
    return (
      <div ref={contenedor} className="flex flex-col gap-6">
        <div className="min-w-0">{izquierda}</div>
        {derecha && <div className="min-w-0">{derecha}</div>}
      </div>
    );
  }

  const ancho = limitar(anchoDerecha ?? Math.round(anchoTotal * 0.55));

  return (
    <div ref={contenedor} className="flex items-start">
      <div className="min-w-0 flex-1">{izquierda}</div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Repartir el espacio entre lo que editas y la web"
        tabIndex={0}
        title="Arrástrala para hacer la web más grande o más pequeña"
        onPointerDown={(evento) => {
          evento.currentTarget.setPointerCapture(evento.pointerId);
          asignarArrastrando(true);
        }}
        onPointerMove={(evento) => {
          if (!arrastrando) return;
          evento.preventDefault();
          mover(evento.clientX);
        }}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onDoubleClick={() => {
          // Volver al reparto de fábrica sin tener que afinar con el ratón.
          const inicial = Math.round(anchoTotal * 0.55);
          asignarAnchoDerecha(limitar(inicial));
          recordar(recuerdaComo, inicial);
        }}
        onKeyDown={(evento) => {
          const salto = evento.shiftKey ? 80 : 24;
          if (evento.key === 'ArrowLeft') {
            evento.preventDefault();
            const nuevo = limitar(ancho + salto);
            asignarAnchoDerecha(nuevo);
            recordar(recuerdaComo, nuevo);
          }
          if (evento.key === 'ArrowRight') {
            evento.preventDefault();
            const nuevo = limitar(ancho - salto);
            asignarAnchoDerecha(nuevo);
            recordar(recuerdaComo, nuevo);
          }
        }}
        className={unirClases(
          'group relative mx-1 shrink-0 cursor-col-resize self-stretch rounded-full outline-none',
          'w-2 touch-none',
        )}
      >
        {/* La línea se ve poco hasta que el ratón se acerca: está ahí para
            usarla, no para llamar la atención. */}
        <span
          className={unirClases(
            'pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors',
            arrastrando ? 'bg-tinta' : 'bg-ceniza group-hover:bg-humo group-focus:bg-tinta',
          )}
        />
        <span
          className={unirClases(
            'pointer-events-none absolute left-1/2 top-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors',
            arrastrando ? 'bg-tinta' : 'bg-ceniza group-hover:bg-grafito group-focus:bg-tinta',
          )}
        />
      </div>

      <div className="min-w-0 shrink-0" style={{ width: ancho }}>
        {derecha}
      </div>

      {/* Mientras se arrastra, el ratón no debe poder seleccionar texto ni
          entrar en el marco de la web: se tapa todo con un cristal. */}
      {arrastrando && <div className="fixed inset-0 z-[90] cursor-col-resize" />}
    </div>
  );
};
