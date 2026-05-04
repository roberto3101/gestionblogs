export interface ItemNavegacion {
  ruta: string;
  etiqueta: string;
  agrupacion: 'redaccion' | 'estructura' | 'gobierno' | 'general';
}

export const itemsNavegacion: ItemNavegacion[] = [
  { ruta: '/panel', etiqueta: 'Inicio', agrupacion: 'general' },
  { ruta: '/panel/posts', etiqueta: 'Posts', agrupacion: 'redaccion' },
  { ruta: '/panel/autores', etiqueta: 'Autores', agrupacion: 'redaccion' },
  { ruta: '/panel/medios', etiqueta: 'Medios', agrupacion: 'redaccion' },
  { ruta: '/panel/categorias', etiqueta: 'Categorias', agrupacion: 'estructura' },
  { ruta: '/panel/etiquetas', etiqueta: 'Etiquetas', agrupacion: 'estructura' },
  { ruta: '/panel/sitios', etiqueta: 'Sitios', agrupacion: 'estructura' },
  { ruta: '/panel/empresas', etiqueta: 'Empresas', agrupacion: 'gobierno' },
  { ruta: '/panel/roles', etiqueta: 'Roles', agrupacion: 'gobierno' },
  { ruta: '/panel/permisos', etiqueta: 'Permisos', agrupacion: 'gobierno' },
  { ruta: '/panel/alcances', etiqueta: 'Alcances', agrupacion: 'gobierno' },
];

export const titulosAgrupacion: Record<ItemNavegacion['agrupacion'], string> = {
  general: 'General',
  redaccion: 'Redaccion',
  estructura: 'Estructura',
  gobierno: 'Gobierno',
};
