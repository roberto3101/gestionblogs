import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SesionEnSeguimiento } from '@capacidades/identidad/contratos/sesion';
import {
  guardarRefresh,
  guardarToken,
  guardarUsuarioSerializado,
  obtenerUsuarioSerializado,
  olvidarSesion,
} from '@integraciones/http/almacenSesion';

interface ValorContextoSesion {
  sesion: SesionEnSeguimiento | null;
  estaAutenticado: boolean;
  registrarSesion: (sesion: SesionEnSeguimiento) => void;
  descartarSesion: () => void;
}

export const ContextoSesion = createContext<ValorContextoSesion | null>(null);

const recuperarSesionPersistida = (): SesionEnSeguimiento | null => {
  const crudo = obtenerUsuarioSerializado();
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as SesionEnSeguimiento;
  } catch {
    return null;
  }
};

export const ProveedorSesion = ({ children }: { children: ReactNode }) => {
  const [sesion, asignarSesion] = useState<SesionEnSeguimiento | null>(() => recuperarSesionPersistida());

  const registrarSesion = useCallback((nuevaSesion: SesionEnSeguimiento) => {
    guardarToken(nuevaSesion.token);
    guardarRefresh(nuevaSesion.refresh_token);
    guardarUsuarioSerializado(JSON.stringify(nuevaSesion));
    asignarSesion(nuevaSesion);
  }, []);

  const descartarSesion = useCallback(() => {
    olvidarSesion();
    asignarSesion(null);
  }, []);

  useEffect(() => {
    const escucharCambios = (evento: StorageEvent) => {
      if (evento.key === 'panel.token' && evento.newValue === null) descartarSesion();
    };
    window.addEventListener('storage', escucharCambios);
    return () => window.removeEventListener('storage', escucharCambios);
  }, [descartarSesion]);

  const valor = useMemo<ValorContextoSesion>(
    () => ({
      sesion,
      estaAutenticado: sesion !== null,
      registrarSesion,
      descartarSesion,
    }),
    [sesion, registrarSesion, descartarSesion],
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
};
