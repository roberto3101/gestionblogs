import { useState, type FormEvent } from 'react';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { obtenerIdentificadorDispositivo } from '@compartido/utilidades/identificadorDispositivo';
import { useIniciarSesion } from '../ganchos/useIniciarSesion';
import { ErrorHttp } from '@integraciones/http/errorHttp';

export const FormularioInicioSesion = () => {
  const [correo, asignarCorreo] = useState('');
  const [password, asignarPassword] = useState('');
  const inicio = useIniciarSesion();

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    inicio.mutate({
      correo_electronico: correo.trim().toLowerCase(),
      password,
      dispositivo_id: obtenerIdentificadorDispositivo(),
    });
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
        etiqueta="Correo electronico"
        type="email"
        autoComplete="email"
        autoFocus
        required
        value={correo}
        onChange={(evento) => asignarCorreo(evento.target.value)}
        placeholder="tu@correo.com"
      />
      <CampoTexto
        etiqueta="Contrasena"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(evento) => asignarPassword(evento.target.value)}
        placeholder="********"
      />
      {mensajeError && <AvisoError titulo="Acceso rechazado">{mensajeError}</AvisoError>}
      <Boton type="submit" tono="primario" tamano="amplio" cargando={inicio.isPending} className="w-full">
        Entrar al panel
      </Boton>
    </form>
  );
};
