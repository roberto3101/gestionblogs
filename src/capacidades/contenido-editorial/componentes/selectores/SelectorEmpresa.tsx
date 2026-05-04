import { useListarEmpresas } from '@capacidades/organizacion/ganchos/useEmpresas';
import { Selector } from '@compartido/interfaz/primitivas/Selector';
import type { Identificador } from '@compartido/tipos/identificador';

interface PropiedadesSelectorEmpresa {
  valor: Identificador | '';
  alCambiar: (id: Identificador) => void;
  etiqueta?: string;
  ayuda?: string;
}

export const SelectorEmpresa = ({
  valor,
  alCambiar,
  etiqueta = 'Empresa',
  ayuda,
}: PropiedadesSelectorEmpresa) => {
  const consulta = useListarEmpresas();
  const opciones =
    consulta.data?.elementos.map((empresa) => ({
      valor: empresa.id,
      etiqueta: empresa.razon_social,
    })) ?? [];

  return (
    <Selector
      etiqueta={etiqueta}
      ayuda={ayuda ?? (consulta.isLoading ? 'Cargando empresas…' : undefined)}
      opciones={opciones}
      marcadorPosicion="Selecciona una empresa"
      value={valor}
      onChange={(evento) => alCambiar(evento.target.value)}
      required
    />
  );
};
