export interface Paginacion {
  pagina: number;
  tamano_pagina: number;
}

export interface ListadoPaginado<T> {
  elementos: T[];
  total_filas: number;
  total_paginas: number;
  pagina: number;
  tamano_pagina: number;
}

export const paginacionInicial: Paginacion = { pagina: 1, tamano_pagina: 20 };

export const aCadenaConsulta = (paginacion: Paginacion): string =>
  `pagina=${paginacion.pagina}&tamano_pagina=${paginacion.tamano_pagina}`;
