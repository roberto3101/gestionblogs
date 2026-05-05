export interface ItemNavegacion {
  ruta: string;
  etiqueta: string;
  agrupacion: 'redaccion' | 'estructura' | 'gobierno' | 'general';
}

// Menu simplificado para el caso de uso real (admin unico, ~5 sitios).
// Ocultos: Etiquetas (redundante con categorias), Medios (subida directa
// desde el editor). Roles y Permisos consolidados en una sola pagina de
// solo lectura; Alcances es la pagina funcional para asignar/revocar accesos.
export const itemsNavegacion: ItemNavegacion[] = [
  { ruta: '/panel', etiqueta: 'Inicio', agrupacion: 'general' },
  { ruta: '/panel/posts', etiqueta: 'Posts', agrupacion: 'redaccion' },
  { ruta: '/panel/autores', etiqueta: 'Autores', agrupacion: 'redaccion' },
  { ruta: '/panel/categorias', etiqueta: 'Categorias', agrupacion: 'estructura' },
  { ruta: '/panel/sitios', etiqueta: 'Sitios', agrupacion: 'estructura' },
  { ruta: '/panel/empresas', etiqueta: 'Empresas', agrupacion: 'gobierno' },
  { ruta: '/panel/roles-permisos', etiqueta: 'Roles y permisos', agrupacion: 'gobierno' },
  { ruta: '/panel/alcances', etiqueta: 'Alcances', agrupacion: 'gobierno' },
];

export const titulosAgrupacion: Record<ItemNavegacion['agrupacion'], string> = {
  general: 'General',
  redaccion: 'Redaccion',
  estructura: 'Estructura',
  gobierno: 'Gobierno',
};
