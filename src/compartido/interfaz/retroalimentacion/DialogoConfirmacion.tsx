import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Boton } from '@compartido/interfaz/primitivas/Boton';

interface PropiedadesDialogo {
  abierto: boolean;
  titulo: string;
  mensaje: ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  tonoConfirmar?: 'primario' | 'peligro';
  cargando?: boolean;
  alConfirmar: () => void;
  alCancelar: () => void;
}

/**
 * Modal de confirmación para acciones destructivas o reversibles.
 * Cierra con ESC o clic en backdrop. Mobile-friendly (full width en pequeño).
 */
export const DialogoConfirmacion = ({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  tonoConfirmar = 'primario',
  cargando = false,
  alConfirmar,
  alCancelar,
}: PropiedadesDialogo) => {
  useEffect(() => {
    if (!abierto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !cargando) alCancelar();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [abierto, cargando, alCancelar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-tinta/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={() => !cargando && alCancelar()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogo-titulo"
    >
      <div
        className="bg-papel w-full sm:max-w-lg rounded-t-marco sm:rounded-marco shadow-levantado border border-ceniza"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 id="dialogo-titulo" className="titulo-editorial text-xl text-tinta mb-3">
            {titulo}
          </h3>
          <div className="text-sm text-grafito leading-relaxed">{mensaje}</div>
        </div>
        <div className="px-6 py-4 border-t border-ceniza flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Boton tono="discreto" onClick={alCancelar} disabled={cargando}>
            {textoCancelar}
          </Boton>
          <Boton tono={tonoConfirmar} onClick={alConfirmar} cargando={cargando}>
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>
  );
};
