import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';

export const InterruptorSitioActivo = () => {
  const { sitios, sitioActivo, cambiarSitioActivo } = useSitioActivo();
  if (sitios.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="meta-tipografia">Sitio</span>
      <select
        value={sitioActivo?.id ?? ''}
        onChange={(evento) => cambiarSitioActivo(evento.target.value)}
        className="bg-papel border border-ceniza rounded-suave h-7 px-2 text-xs text-tinta outline-none focus:border-tinta"
      >
        {sitios.map((sitio) => (
          <option key={sitio.id} value={sitio.id}>
            {sitio.nombre} · {sitio.codigo}
          </option>
        ))}
      </select>
    </div>
  );
};
