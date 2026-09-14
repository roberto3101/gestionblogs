export interface ItemNavegacion {
  ruta: string;
  etiqueta: string;
  agrupacion: 'redaccion' | 'estructura' | 'gobierno' | 'general';
}

/**
 * El menú de la izquierda, escrito para que se entienda sin explicación.
 *
 * Cada nombre dice qué vas a encontrar, no cómo se llama por dentro. «Posts»
 * era el nombre del programa; «Artículos del blog» es lo que la gente busca.
 *
 * Quedan fuera a propósito las etiquetas (se solapan con las categorías) y la
 * biblioteca de archivos (se suben desde donde se usan). Crear usuarios, dar
 * permisos y quitarlos vive todo en «Quién puede entrar».
 */
export const itemsNavegacion: ItemNavegacion[] = [
  { ruta: '/panel', etiqueta: 'Inicio', agrupacion: 'general' },

  { ruta: '/panel/contenido', etiqueta: 'Textos y fotos de la web', agrupacion: 'redaccion' },
  { ruta: '/panel/posts', etiqueta: 'Artículos del blog', agrupacion: 'redaccion' },
  { ruta: '/panel/listas/casos', etiqueta: 'Casos de uso', agrupacion: 'redaccion' },
  { ruta: '/panel/listas/proyectos', etiqueta: 'Nuestros proyectos', agrupacion: 'redaccion' },
  { ruta: '/panel/listas/videos', etiqueta: 'Vídeos', agrupacion: 'redaccion' },
  { ruta: '/panel/listas/archivos', etiqueta: 'Archivos para descargar', agrupacion: 'redaccion' },
  { ruta: '/panel/mensajes', etiqueta: 'Mensajes recibidos', agrupacion: 'redaccion' },

  { ruta: '/panel/autores', etiqueta: 'Quién firma los artículos', agrupacion: 'estructura' },
  { ruta: '/panel/categorias', etiqueta: 'Temas del blog', agrupacion: 'estructura' },
  { ruta: '/panel/sitios', etiqueta: 'Webs', agrupacion: 'estructura' },

  { ruta: '/panel/empresas', etiqueta: 'Empresas', agrupacion: 'gobierno' },
  { ruta: '/panel/usuarios', etiqueta: 'Quién puede entrar', agrupacion: 'gobierno' },
];

export const titulosAgrupacion: Record<ItemNavegacion['agrupacion'], string> = {
  general: '',
  redaccion: 'Lo que se ve en la web',
  estructura: 'Cómo se organiza',
  gobierno: 'Administración',
};
