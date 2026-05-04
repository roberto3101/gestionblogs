import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Sitio } from '@capacidades/contenido-editorial/contratos/sitio';
import { useListarSitios } from '@capacidades/contenido-editorial/ganchos/useSitios';

interface ValorSitioActivo {
  sitios: Sitio[];
  sitioActivo: Sitio | null;
  cambiarSitioActivo: (id: string) => void;
}

const ContextoSitioActivo = createContext<ValorSitioActivo | null>(null);

const CLAVE_SITIO = 'panel.sitio_activo';

export const ProveedorSitioActivo = ({ children }: { children: ReactNode }) => {
  const consulta = useListarSitios();
  const [idActivo, asignarIdActivo] = useState<string | null>(() => localStorage.getItem(CLAVE_SITIO));

  useEffect(() => {
    if (idActivo) localStorage.setItem(CLAVE_SITIO, idActivo);
  }, [idActivo]);

  const sitios = consulta.data?.elementos ?? [];
  useEffect(() => {
    if (sitios.length > 0 && (!idActivo || !sitios.find((s) => s.id === idActivo))) {
      asignarIdActivo(sitios[0].id);
    }
  }, [sitios, idActivo]);

  const sitioActivo = useMemo(() => sitios.find((s) => s.id === idActivo) ?? null, [sitios, idActivo]);

  const valor = useMemo<ValorSitioActivo>(
    () => ({ sitios, sitioActivo, cambiarSitioActivo: asignarIdActivo }),
    [sitios, sitioActivo],
  );

  return <ContextoSitioActivo.Provider value={valor}>{children}</ContextoSitioActivo.Provider>;
};

export const useSitioActivo = () => {
  const valor = useContext(ContextoSitioActivo);
  if (!valor) throw new Error('useSitioActivo dentro de ProveedorSitioActivo');
  return valor;
};
