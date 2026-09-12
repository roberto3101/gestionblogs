import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ProveedorConsultas } from './ProveedorConsultas';
import { ProveedorSesion } from '@plataforma/identidad/contextoSesion';
import { ProveedorNotificaciones } from '@plataforma/gobierno/errores/contextoNotificaciones';
import { PilaNotificaciones } from '@plataforma/gobierno/errores/PilaNotificaciones';
import { PuenteNotificacionesErrores } from '@plataforma/gobierno/errores/PuenteNotificacionesErrores';

export const ProveedoresAplicacion = ({ children }: { children: ReactNode }) => (
  // La misma carpeta que Vite: sin esto, el enrutador buscaria /panel en
  // la raiz del dominio y no en /cms/panel.
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <ProveedorConsultas>
      <ProveedorNotificaciones>
        <ProveedorSesion>
          <PuenteNotificacionesErrores />
          {children}
          <PilaNotificaciones />
        </ProveedorSesion>
      </ProveedorNotificaciones>
    </ProveedorConsultas>
  </BrowserRouter>
);
