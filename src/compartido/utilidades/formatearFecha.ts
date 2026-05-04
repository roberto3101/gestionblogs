const formatoLargo = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formatoCompacto = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
});

export const formatearFecha = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return formatoLargo.format(fecha);
};

export const formatearFechaCompacta = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return formatoCompacto.format(fecha);
};
