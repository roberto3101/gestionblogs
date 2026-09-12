import { useState } from 'react';
import { TituloEditorial } from '@compartido/interfaz/primitivas/TituloEditorial';
import { FormularioInicioSesion } from '../componentes/FormularioInicioSesion';

/**
 * Lee el aviso que deja el cliente HTTP cuando echa a alguien por caducidad.
 *
 * Se consume al leerlo: si recarga la pantalla de entrada, el aviso no vuelve
 * a salir, porque a esas alturas ya no aporta nada.
 */
const leerAvisoDeCaducidad = (): boolean => {
  try {
    const habia = sessionStorage.getItem('panel.sesionCaducada') === '1';
    if (habia) sessionStorage.removeItem('panel.sesionCaducada');
    return habia;
  } catch {
    return false;
  }
};

export const PaginaIniciarSesion = () => {
  const [sesionCaducada] = useState(leerAvisoDeCaducidad);

  return (
  <div className="min-h-screen grid lg:grid-cols-[1.1fr,1fr]">
    <aside className="relative hidden lg:flex flex-col justify-between p-10 bg-tinta text-lienzo">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 bg-oliva rounded-full" />
        <span className="meta-tipografia text-lienzo/70">Codeplex CMS</span>
      </div>
      <div className="space-y-6 max-w-lectura">
        <p className="meta-tipografia text-oliva">Edicion sin friccion</p>
        <h1 className="titulo-editorial text-4xl xl:text-5xl leading-[1.1]">
          Escribe, publica y mide.<br />
          <span className="text-oliva italic">Lo demas, lo cuidamos nosotros.</span>
        </h1>
        <p className="text-lienzo/70 text-base">
          Un panel para autores, editores y administradores. Multitenant por empresa, con
          alcances precisos y una pista de auditoria sobre cada accion.
        </p>
      </div>
      <p className="text-xs text-lienzo/40">
        v0.1 · Construido con calma sobre Go, CockroachDB y React.
      </p>
    </aside>
    <main className="flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md space-y-8">
        <TituloEditorial nivel={1} preTitulo="Acceso al panel">
          Bienvenido de vuelta
        </TituloEditorial>
        {sesionCaducada ? (
          <div className="rounded-suave border border-ambar/40 bg-ambar/5 px-4 py-3">
            <p className="text-[15px] leading-relaxed text-grafito">
              <strong className="text-tinta">Se te cerró la sesión por tiempo.</strong> Entra
              otra vez y sigues donde lo dejaste: lo que estabas escribiendo se guardó.
            </p>
          </div>
        ) : (
          <p className="text-grafito text-[15px] leading-relaxed">
            Ingresa con la cuenta que te entrego tu administrador. Si es tu primera vez,
            revisa tu correo para verificar la cuenta antes de continuar.
          </p>
        )}
        <FormularioInicioSesion />
        <p className="text-xs text-humo">
          Al continuar aceptas registrar tu actividad en la pista de auditoria.
        </p>
      </div>
    </main>
  </div>
);
};
