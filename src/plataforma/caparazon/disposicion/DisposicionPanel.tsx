import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { BarraLateral } from '../navegacion/BarraLateral';
import { BarraSuperior } from '../navegacion/BarraSuperior';
import { unirClases } from '@compartido/utilidades/unirClases';

export const DisposicionPanel = () => {
  const [sidebarAbierto, asignarSidebarAbierto] = useState(false);
  const ubicacion = useLocation();

  useEffect(() => {
    asignarSidebarAbierto(false);
  }, [ubicacion.pathname]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px,1fr] bg-lienzo">
      <div
        className={unirClases(
          'fixed inset-y-0 left-0 z-30 w-[260px] transicion-natural lg:relative lg:translate-x-0',
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <BarraLateral />
      </div>
      {sidebarAbierto && (
        <button
          type="button"
          onClick={() => asignarSidebarAbierto(false)}
          className="fixed inset-0 z-20 bg-tinta/40 lg:hidden"
          aria-label="Cerrar menú"
        />
      )}
      <div className="flex flex-col min-h-screen min-w-0">
        <BarraSuperior alAbrirSidebar={() => asignarSidebarAbierto(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-[1180px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
