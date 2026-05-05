export interface ItemNavegacion {
  ruta: string;
  etiqueta: string;
  agrupacion: 'redaccion' | 'estructura' | 'gobierno' | 'general';
}

// Menu simplificado para el caso de uso real (admin unico, ~5 sitios).
// Ocultos: Etiquetas (redundante con categorias), Medios (subida directa
// desde el editor). Toda la gestion de gobierno (crear usuario, asignar
// rol, revocar acceso) vive en /panel/usuarios.
export const itemsNavegacion: ItemNavegacion[] = [
  { ruta: '/panel', etiqueta: 'Inicio', agrupacion: 'general' },
  { ruta: '/panel/posts', etiqueta: 'Posts', agrupacion: 'redaccion' },
  { ruta: '/panel/autores', etiqueta: 'Autores', agrupacion: 'redaccion' },
  { ruta: '/panel/categorias', etiqueta: 'Categorias', agrupacion: 'estructura' },
  { ruta: '/panel/sitios', etiqueta: 'Sitios', agrupacion: 'estructura' },
  { ruta: '/panel/empresas', etiqueta: 'Empresas', agrupacion: 'gobierno' },
  { ruta: '/panel/usuarios', etiqueta: 'Usuarios', agrupacion: 'gobierno' },
];

export const titulosAgrupacion: Record<ItemNavegacion['agrupacion'], string> = {
  general: 'General',
  redaccion: 'Redaccion',
  estructura: 'Estructura',
  gobierno: 'Gobierno',
};
