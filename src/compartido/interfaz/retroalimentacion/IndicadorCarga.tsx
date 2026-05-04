import { unirClases } from '@compartido/utilidades/unirClases';

interface PropiedadesIndicadorCarga {
  etiqueta?: string;
  className?: string;
}

export const IndicadorCarga = ({ etiqueta = 'Cargando', className }: PropiedadesIndicadorCarga) => (
  <div className={unirClases('inline-flex items-center gap-2 text-humo', className)}>
    <span className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
    <span className="text-sm">{etiqueta}</span>
  </div>
);
