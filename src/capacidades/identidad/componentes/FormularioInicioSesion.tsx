import { useState, type FormEvent } from 'react';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { obtenerIdentificadorDispositivo } from '@compartido/utilidades/identificadorDispositivo';
import { useIniciarSesion } from '../ganchos/useIniciarSesion';
import { ErrorHttp } from '@integraciones/http/errorHttp';

const CREDENCIALES_DEMO = {
  correo: 'admin.cms@blogs.test',
  password: 'claveAdmin123!',
};

const IconoOjoAbierto = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconoOjoCerrado = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export const FormularioInicioSesion = () => {
  const [correo, asignarCorreo] = useState('');
  const [password, asignarPassword] = useState('');
  const [mostrarPassword, asignarMostrarPassword] = useState(false);
  const inicio = useIniciarSesion();

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    inicio.mutate({
      correo_electronico: correo.trim().toLowerCase(),
      password,
      dispositivo_id: obtenerIdentificadorDispositivo(),
    });
  };

  const usarCredencialesDemo = () => {
    asignarCorreo(CREDENCIALES_DEMO.correo);
    asignarPassword(CREDENCIALES_DEMO.password);
  };

  const mensajeError =
    inicio.error instanceof ErrorHttp
      ? inicio.error.message
      : inicio.error
        ? 'No pudimos completar el ingreso, intenta de nuevo'
        : null;

  return (
    <form onSubmit={enviar} className="space-y-5">
      <CampoTexto
        etiqueta="Correo electrónico"
        type="email"
        autoComplete="email"
        autoFocus
        required
        value={correo}
        onChange={(evento) => asignarCorreo(evento.target.value)}
        placeholder="tu@correo.com"
      />
      <CampoTexto
        etiqueta="Contraseña"
        type={mostrarPassword ? 'text' : 'password'}
        autoComplete="current-password"
        required
        value={password}
        onChange={(evento) => asignarPassword(evento.target.value)}
        placeholder="********"
        accesorioDerecho={
          <button
            type="button"
            onClick={() => asignarMostrarPassword((v) => !v)}
            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="h-8 w-8 grid place-items-center rounded-suave text-humo hover:text-tinta hover:bg-ceniza/40 transicion-natural"
          >
            {mostrarPassword ? <IconoOjoCerrado /> : <IconoOjoAbierto />}
          </button>
        }
      />
      {mensajeError && <AvisoError titulo="Acceso rechazado">{mensajeError}</AvisoError>}
      <Boton type="submit" tono="primario" tamano="amplio" cargando={inicio.isPending} className="w-full">
        Entrar al panel
      </Boton>
      <button
        type="button"
        onClick={usarCredencialesDemo}
        className="w-full text-xs text-humo hover:text-tinta meta-tipografia border border-dashed border-ceniza hover:border-grafito rounded-suave py-2.5 transicion-natural"
      >
        ✦ Credenciales de prueba
      </button>
    </form>
  );
};
