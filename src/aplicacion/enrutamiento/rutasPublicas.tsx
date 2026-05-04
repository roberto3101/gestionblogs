import { Route } from 'react-router-dom';
import { PaginaIniciarSesion } from '@capacidades/identidad/paginas/PaginaIniciarSesion';
import { RedireccionSiAutenticado } from './GuardiaAutenticacion';

export const rutasPublicas = (
  <Route
    path="/iniciar-sesion"
    element={
      <RedireccionSiAutenticado>
        <PaginaIniciarSesion />
      </RedireccionSiAutenticado>
    }
  />
);
