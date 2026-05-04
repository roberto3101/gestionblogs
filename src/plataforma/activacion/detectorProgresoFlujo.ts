import { useListarEmpresas } from '@capacidades/organizacion/ganchos/useEmpresas';
import { useListarSitios } from '@capacidades/contenido-editorial/ganchos/useSitios';
import { useListarAutores } from '@capacidades/contenido-editorial/ganchos/useAutores';
import { useListarCategorias } from '@capacidades/contenido-editorial/ganchos/useCategorias';
import { useListarPosts } from '@capacidades/contenido-editorial/ganchos/usePosts';

export type EstadoPaso = 'cumplido' | 'pendiente' | 'bloqueado';

export interface PasoFlujo {
  numero: number;
  clave: 'empresa' | 'sitio' | 'autor' | 'categoria' | 'post';
  titulo: string;
  descripcion: string;
  estado: EstadoPaso;
  rutaAccion: string;
  textoAccion: string;
}

export const useFlujoPublicacion = (): { pasos: PasoFlujo[]; pasoActual: PasoFlujo | null; cargando: boolean } => {
  const empresas = useListarEmpresas();
  const sitios = useListarSitios();
  const codigoSitio = sitios.data?.elementos[0]?.codigo ?? null;
  const autores = useListarAutores(codigoSitio);
  const categorias = useListarCategorias(codigoSitio);
  const posts = useListarPosts(codigoSitio);

  const cargando =
    empresas.isLoading || sitios.isLoading || autores.isLoading || categorias.isLoading || posts.isLoading;

  const tieneEmpresa = (empresas.data?.elementos?.length ?? 0) > 0;
  const tieneSitio = (sitios.data?.elementos?.length ?? 0) > 0;
  const tieneAutor = (autores.data?.elementos?.length ?? 0) > 0;
  const tieneCategoria = (categorias.data?.elementos?.length ?? 0) > 0;
  const tienePost = (posts.data?.elementos?.length ?? 0) > 0;

  const pasos: PasoFlujo[] = [
    {
      numero: 1,
      clave: 'empresa',
      titulo: 'Registra una empresa',
      descripcion: 'Es el contenedor donde van a vivir tus sitios y posts.',
      estado: tieneEmpresa ? 'cumplido' : 'pendiente',
      rutaAccion: '/panel/empresas/nueva',
      textoAccion: 'Crear empresa',
    },
    {
      numero: 2,
      clave: 'sitio',
      titulo: 'Crea tu primer sitio',
      descripcion: 'Un sitio es el blog en sí: tiene un código, un dominio y un idioma.',
      estado: !tieneEmpresa ? 'bloqueado' : tieneSitio ? 'cumplido' : 'pendiente',
      rutaAccion: '/panel/sitios/nuevo',
      textoAccion: 'Crear sitio',
    },
    {
      numero: 3,
      clave: 'autor',
      titulo: 'Define un autor',
      descripcion: 'Cada post va firmado. Puedes crear un autor con tu nombre o un equipo.',
      estado: !tieneSitio ? 'bloqueado' : tieneAutor ? 'cumplido' : 'pendiente',
      rutaAccion: '/panel/autores',
      textoAccion: 'Crear autor',
    },
    {
      numero: 4,
      clave: 'categoria',
      titulo: 'Organiza con una categoría',
      descripcion: 'Las categorías ayudan a clasificar tus posts. Crea al menos una.',
      estado: !tieneSitio ? 'bloqueado' : tieneCategoria ? 'cumplido' : 'pendiente',
      rutaAccion: '/panel/categorias',
      textoAccion: 'Crear categoría',
    },
    {
      numero: 5,
      clave: 'post',
      titulo: 'Escribe y publica tu primer post',
      descripcion: 'Ya tienes todo listo. Solo falta la parte divertida: escribir.',
      estado: !tieneSitio || !tieneAutor ? 'bloqueado' : tienePost ? 'cumplido' : 'pendiente',
      rutaAccion: '/panel/posts/nuevo',
      textoAccion: 'Escribir post',
    },
  ];

  const pasoActual = pasos.find((paso) => paso.estado === 'pendiente') ?? null;
  return { pasos, pasoActual, cargando };
};
