import { TituloEditorial } from '@compartido/interfaz/primitivas/TituloEditorial';
import { FormularioInicioSesion } from '../componentes/FormularioInicioSesion';

export const PaginaIniciarSesion = () => (
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
        <p className="text-grafito text-[15px] leading-relaxed">
          Ingresa con la cuenta que te entrego tu administrador. Si es tu primera vez,
          revisa tu correo para verificar la cuenta antes de continuar.
        </p>
        <FormularioInicioSesion />
        <p className="text-xs text-humo">
          Al continuar aceptas registrar tu actividad en la pista de auditoria.
        </p>
      </div>
    </main>
  </div>
);
