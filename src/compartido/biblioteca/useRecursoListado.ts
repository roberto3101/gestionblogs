import { useQuery } from '@tanstack/react-query';
import type { ListadoPaginado, Paginacion } from '@compartido/tipos/paginacion';
import { paginacionInicial } from '@compartido/tipos/paginacion';

interface ParametrosUseRecursoListado<T> {
  clave: readonly unknown[];
  consultar: (paginacion: Paginacion) => Promise<ListadoPaginado<T>>;
  paginacion?: Paginacion;
  habilitado?: boolean;
}

export const useRecursoListado = <T,>({
  clave,
  consultar,
  paginacion = paginacionInicial,
  habilitado = true,
}: ParametrosUseRecursoListado<T>) =>
  useQuery({
    queryKey: [...clave, paginacion],
    queryFn: () => consultar(paginacion),
    enabled: habilitado,
  });
