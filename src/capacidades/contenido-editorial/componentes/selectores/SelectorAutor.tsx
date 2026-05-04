import { useListarAutores } from '../../ganchos/useAutores';
import { Selector } from '@compartido/interfaz/primitivas/Selector';
import type { Identificador } from '@compartido/tipos/identificador';

interface PropiedadesSelectorAutor {
  codigoSitio: string | null;
  valor: Identificador | '';
  alCambiar: (id: Identificador) => void;
}

export const SelectorAutor = ({ codigoSitio, valor, alCambiar }: PropiedadesSelectorAutor) => {
  const consulta = useListarAutores(codigoSitio);
  const opciones =
    consulta.data?.elementos.map((autor) => ({
      valor: autor.id,
      etiqueta: autor.nombre_publico,
    })) ?? [];

  return (
    <Selector
      etiqueta="Autor"
      ayuda={consulta.isLoading ? 'Cargando…' : 'Quién firma este post.'}
      opciones={opciones}
      marcadorPosicion="Selecciona un autor"
      value={valor}
      onChange={(e) => alCambiar(e.target.value)}
      required
    />
  );
};
