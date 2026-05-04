import { useListarSitios } from '../../ganchos/useSitios';
import { Selector } from '@compartido/interfaz/primitivas/Selector';
import type { Identificador } from '@compartido/tipos/identificador';
import type { Sitio } from '../../contratos/sitio';

interface PropiedadesSelectorSitio {
  valor: Identificador | '';
  alCambiar: (id: Identificador, sitio: Sitio | null) => void;
  etiqueta?: string;
  ayuda?: string;
}

export const SelectorSitio = ({
  valor,
  alCambiar,
  etiqueta = 'Sitio',
  ayuda,
}: PropiedadesSelectorSitio) => {
  const consulta = useListarSitios();
  const opciones =
    consulta.data?.elementos.map((sitio) => ({
      valor: sitio.id,
      etiqueta: `${sitio.nombre} (${sitio.codigo})`,
    })) ?? [];

  return (
    <Selector
      etiqueta={etiqueta}
      ayuda={ayuda ?? (consulta.isLoading ? 'Cargando sitios…' : undefined)}
      opciones={opciones}
      marcadorPosicion="Selecciona un sitio"
      value={valor}
      onChange={(evento) => {
        const sitio = consulta.data?.elementos.find((s) => s.id === evento.target.value) ?? null;
        alCambiar(evento.target.value, sitio);
      }}
      required
    />
  );
};
