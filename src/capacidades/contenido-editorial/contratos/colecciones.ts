/**
 * Las listas de la web que se administran una por una.
 *
 * Los casos de uso, los proyectos, los vídeos y los archivos para descargar no
 * son textos sueltos: son colecciones de fichas que se dan de alta, se cambian
 * y se quitan a lo largo del tiempo. Editarlos desde «Textos y fotos» obligaba
 * a abrir el trozo entero de la página, bajar hasta la lista y desplegar la
 * ficha que tocara, entre docenas de campos que no venían al caso.
 *
 * Aquí cada una tiene su propia pantalla, con su lista de fichas y su botón de
 * añadir. Por dentro se guarda exactamente donde se guardaba antes —dentro de
 * su trozo de contenido, en el mismo campo— así que la web no se entera y las
 * dos formas de editar siguen valiendo.
 *
 * Añadir una colección nueva es añadir una entrada a esta lista.
 */

export interface Coleccion {
  /** Último trozo de la dirección en el panel: /panel/casos. */
  ruta: string;
  /** Trozo de contenido donde vive. */
  bloque: string;
  /** Campo de ese trozo que guarda la lista. */
  lista: string;
  /** Cómo se llama en el menú. */
  nombre: string;
  /** Una línea explicando qué es, para el encabezado. */
  descripcion: string;
  /** Una de estas fichas, en singular: «un caso», «un proyecto». */
  unaDeEstas: string;
  /** Página de la web donde sale, para la vista previa. */
  paginaWeb: string;
  /** Campo que hace de título en la lista. */
  campoTitulo: string;
  /** Campo con la foto, si lo hay, para la miniatura de la lista. */
  campoFoto?: string;
  /** Campos que se enseñan bajo el título en la lista, como referencia. */
  camposResumen: string[];
  /** Orden en que se piden los campos al editar una ficha. */
  orden: string[];
  /**
   * Campos que se rellenan solos al subir un archivo. Quien sube un PDF no
   * tiene por qué saber escribir «2,4 MB» ni acordarse de poner «pdf».
   */
  rellenarAlSubir?: { desde: string; formato?: string; peso?: string };
}

export const colecciones: Coleccion[] = [
  {
    ruta: 'casos',
    bloque: 'casos-de-uso/catalogo',
    lista: 'elementos',
    nombre: 'Casos de uso',
    descripcion: 'Las tarjetas de clientes reales que salen en la página de casos.',
    unaDeEstas: 'un caso',
    paginaWeb: '/casos-de-uso',
    campoTitulo: 'titulo',
    campoFoto: 'imagen',
    camposResumen: ['ubicacion', 'distintivo'],
    orden: ['imagen', 'titulo', 'distintivo', 'ubicacion', 'texto', 'sector', 'categorias'],
  },
  {
    ruta: 'proyectos',
    bloque: 'nosotros/proyectos',
    lista: 'elementos',
    nombre: 'Nuestros proyectos',
    descripcion: 'Lo que vais publicando en la página de Nosotros: obra, fotos y vídeos.',
    unaDeEstas: 'un proyecto',
    paginaWeb: '/nosotros',
    campoTitulo: 'titulo',
    campoFoto: 'imagen',
    camposResumen: ['fecha', 'lugar', 'distintivo'],
    orden: [
      'imagen',
      'textoAlternativo',
      'video',
      'titulo',
      'distintivo',
      'fecha',
      'lugar',
      'texto',
    ],
  },
  {
    ruta: 'videos',
    bloque: 'recursos/videos',
    lista: 'elementos',
    nombre: 'Vídeos',
    descripcion: 'Los vídeos que se abren en una ventana desde la página de recursos.',
    unaDeEstas: 'un vídeo',
    paginaWeb: '/recursos',
    campoTitulo: 'titulo',
    campoFoto: 'imagen',
    camposResumen: ['duracion', 'distintivo'],
    orden: ['imagen', 'video', 'titulo', 'distintivo', 'duracion', 'texto'],
  },
  {
    ruta: 'archivos',
    bloque: 'recursos/documentos',
    lista: 'elementos',
    nombre: 'Archivos para descargar',
    descripcion: 'Los PDF y las hojas de cálculo que la gente puede bajarse.',
    unaDeEstas: 'un archivo',
    paginaWeb: '/recursos',
    campoTitulo: 'titulo',
    camposResumen: ['formato', 'peso', 'distintivo'],
    orden: ['archivo', 'titulo', 'distintivo', 'formato', 'peso'],
    rellenarAlSubir: { desde: 'archivo', formato: 'formato', peso: 'peso' },
  },
];

export const coleccionPorRuta = (ruta: string): Coleccion | undefined =>
  colecciones.find((c) => c.ruta === ruta);

/** «2411724» -> «2,4 MB», como lo escribiría una persona. */
export const pesoLegible = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  const mega = bytes / (1024 * 1024);
  if (mega >= 1) return `${mega.toFixed(1).replace('.', ',')} MB`;
  const kilo = Math.round(bytes / 1024);
  return `${kilo} KB`;
};
