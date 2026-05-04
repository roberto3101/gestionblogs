import { useEffect, useRef, useState } from 'react';

interface OpcionesBorrador<T> {
  clave: string;
  estadoInicial: T;
  retrasoMs?: number;
}

interface BorradorPersistido<T> {
  contenido: T;
  guardadoEn: string;
}

const construirClaveAlmacen = (clave: string) => `panel.borrador.${clave}`;

export const useBorradorAutosalvado = <T extends object>({ clave, estadoInicial, retrasoMs = 600 }: OpcionesBorrador<T>) => {
  const claveAlmacen = construirClaveAlmacen(clave);
  const [contenido, asignarContenido] = useState<T>(() => {
    const crudo = typeof localStorage !== 'undefined' ? localStorage.getItem(claveAlmacen) : null;
    if (!crudo) return estadoInicial;
    try {
      const parseado = JSON.parse(crudo) as BorradorPersistido<T>;
      return { ...estadoInicial, ...parseado.contenido };
    } catch {
      return estadoInicial;
    }
  });
  const [marcaTiempo, asignarMarcaTiempo] = useState<string | null>(() => {
    const crudo = typeof localStorage !== 'undefined' ? localStorage.getItem(claveAlmacen) : null;
    if (!crudo) return null;
    try {
      return (JSON.parse(crudo) as BorradorPersistido<T>).guardadoEn;
    } catch {
      return null;
    }
  });
  const temporizador = useRef<number | null>(null);

  useEffect(() => {
    if (temporizador.current) window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => {
      const guardadoEn = new Date().toISOString();
      const sobre: BorradorPersistido<T> = { contenido, guardadoEn };
      localStorage.setItem(claveAlmacen, JSON.stringify(sobre));
      asignarMarcaTiempo(guardadoEn);
    }, retrasoMs);
    return () => {
      if (temporizador.current) window.clearTimeout(temporizador.current);
    };
  }, [contenido, claveAlmacen, retrasoMs]);

  const descartarBorrador = () => {
    localStorage.removeItem(claveAlmacen);
    asignarContenido(estadoInicial);
    asignarMarcaTiempo(null);
  };

  return { contenido, asignarContenido, marcaTiempo, descartarBorrador };
};
