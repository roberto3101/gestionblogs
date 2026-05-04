import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crearAutor, listarAutoresPorSitio } from '../servicios/servicioAutores';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';

const claveAutores = (codigoSitio: string) => ['autores', codigoSitio] as const;

export const useListarAutores = (codigoSitio: string | null, paginacion: Paginacion = paginacionInicial) =>
  useQuery({
    queryKey: codigoSitio ? [...claveAutores(codigoSitio), paginacion] : ['autores', 'inactivo'],
    queryFn: () => listarAutoresPorSitio(codigoSitio!, paginacion),
    enabled: Boolean(codigoSitio),
  });

export const useCrearAutor = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: crearAutor,
    meta: { exito: 'Autor creado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['autores'] }),
  });
};
