interface PropiedadesIndicadorAutosalvado {
  marcaTiempo: string | null;
}

const formatear = (iso: string): string => {
  try {
    const fecha = new Date(iso);
    const ahora = new Date();
    const diferenciaSeg = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);
    if (diferenciaSeg < 5) return 'guardado hace un instante';
    if (diferenciaSeg < 60) return `guardado hace ${diferenciaSeg}s`;
    const minutos = Math.floor(diferenciaSeg / 60);
    if (minutos < 60) return `guardado hace ${minutos} min`;
    return `guardado a las ${fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return 'guardado';
  }
};

export const IndicadorAutosalvado = ({ marcaTiempo }: PropiedadesIndicadorAutosalvado) => {
  if (!marcaTiempo) {
    return <span className="meta-tipografia text-humo">sin guardar</span>;
  }
  return (
    <span className="meta-tipografia text-humo flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-oliva animate-pulse" />
      {formatear(marcaTiempo)}
    </span>
  );
};
