import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * Cuánto ancho de pantalla puede ocupar una página del panel.
 *
 * Por defecto el contenido se corta a 1180 px. Es lo correcto para un
 * formulario: una línea de texto de punta a punta de un monitor de 27 pulgadas
 * no hay quien la lea.
 *
 * Pero las páginas que enseñan la web al lado no son formularios. Ahí ese tope
 * tiraba a la basura casi quinientos píxeles de pantalla y dejaba la vista
 * previa en una columna de quinientos, donde la web se ve como una miniatura.
 * Esas páginas piden el ancho completo.
 */

type Ancho = 'lectura' | 'completo';

interface Valor {
  ancho: Ancho;
  asignarAncho: (ancho: Ancho) => void;
}

const Contexto = createContext<Valor>({ ancho: 'lectura', asignarAncho: () => {} });

export const ProveedorAnchoPanel = ({ children }: { children: ReactNode }) => {
  const [ancho, asignarAncho] = useState<Ancho>('lectura');
  return <Contexto.Provider value={{ ancho, asignarAncho }}>{children}</Contexto.Provider>;
};

export const useAnchoPanel = () => useContext(Contexto);

/**
 * Pide el ancho completo mientras esta página esté abierta.
 *
 * Al salir se devuelve al ancho de lectura, para que una página no le cambie
 * la medida a la siguiente.
 */
export const usarAnchoCompleto = () => {
  const { asignarAncho } = useAnchoPanel();
  useEffect(() => {
    asignarAncho('completo');
    return () => asignarAncho('lectura');
  }, [asignarAncho]);
};
