import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type TonoNotificacion = 'exito' | 'error' | 'aviso' | 'info';

export interface Notificacion {
  id: string;
  tono: TonoNotificacion;
  titulo: string;
  detalle?: string;
}

interface ValorContextoNotificaciones {
  notificaciones: Notificacion[];
  publicar: (notificacion: Omit<Notificacion, 'id'>) => void;
  descartar: (id: string) => void;
}

const ContextoNotificaciones = createContext<ValorContextoNotificaciones | null>(null);

export const ProveedorNotificaciones = ({ children }: { children: ReactNode }) => {
  const [notificaciones, asignarNotificaciones] = useState<Notificacion[]>([]);

  const descartar = useCallback((id: string) => {
    asignarNotificaciones((actuales) => actuales.filter((n) => n.id !== id));
  }, []);

  const publicar = useCallback(
    (notificacion: Omit<Notificacion, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      asignarNotificaciones((actuales) => [...actuales, { ...notificacion, id }]);
      setTimeout(() => descartar(id), 5500);
    },
    [descartar],
  );

  const valor = useMemo<ValorContextoNotificaciones>(
    () => ({ notificaciones, publicar, descartar }),
    [notificaciones, publicar, descartar],
  );

  return <ContextoNotificaciones.Provider value={valor}>{children}</ContextoNotificaciones.Provider>;
};

export const useNotificaciones = () => {
  const valor = useContext(ContextoNotificaciones);
  if (!valor) throw new Error('useNotificaciones dentro de ProveedorNotificaciones');
  return valor;
};
