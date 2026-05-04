import { IndicadorCarga } from './IndicadorCarga';

export const Cargando = ({ etiqueta = 'Cargando' }: { etiqueta?: string }) => (
  <div className="lamina py-12 grid place-items-center">
    <IndicadorCarga etiqueta={etiqueta} />
  </div>
);
