import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { unirClases } from '@compartido/utilidades/unirClases';

type Tono = 'primario' | 'discreto' | 'fantasma' | 'peligro';
type Tamano = 'compacto' | 'estandar' | 'amplio';

interface PropiedadesBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  tono?: Tono;
  tamano?: Tamano;
  cargando?: boolean;
  iconoIzquierdo?: ReactNode;
  iconoDerecho?: ReactNode;
}

const estilosPorTono: Record<Tono, string> = {
  primario:
    'bg-tinta text-lienzo hover:bg-grafito disabled:bg-humo border border-tinta',
  discreto:
    'bg-papel text-tinta border border-ceniza hover:border-humo hover:bg-lienzo',
  fantasma:
    'bg-transparent text-tinta hover:bg-ceniza/40 border border-transparent',
  peligro:
    'bg-papel text-cinabrio border border-cinabrio/30 hover:bg-cinabrio/5',
};

const estilosPorTamano: Record<Tamano, string> = {
  compacto: 'h-8 px-3 text-[13px] gap-1.5 rounded-suave',
  estandar: 'h-10 px-4 text-sm gap-2 rounded-suave',
  amplio: 'h-12 px-6 text-base gap-2.5 rounded-marco',
};

export const Boton = ({
  tono = 'primario',
  tamano = 'estandar',
  cargando = false,
  iconoIzquierdo,
  iconoDerecho,
  children,
  className,
  disabled,
  type = 'button',
  ...resto
}: PropiedadesBoton) => (
  <button
    type={type}
    disabled={disabled || cargando}
    className={unirClases(
      'inline-flex items-center justify-center font-medium select-none transicion-natural',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      estilosPorTono[tono],
      estilosPorTamano[tamano],
      className,
    )}
    {...resto}
  >
    {cargando ? (
      <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" />
    ) : (
      iconoIzquierdo
    )}
    <span>{children}</span>
    {!cargando && iconoDerecho}
  </button>
);
