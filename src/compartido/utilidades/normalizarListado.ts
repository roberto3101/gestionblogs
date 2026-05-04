import type { ListadoPaginado } from '@compartido/tipos/paginacion';

export const normalizarListado = <T>(crudo: unknown): ListadoPaginado<T> => {
  if (Array.isArray(crudo)) {
    return {
      elementos: crudo as T[],
      total_filas: crudo.length,
      total_paginas: 1,
      pagina: 1,
      tamano_pagina: crudo.length,
    };
  }
  const candidato = crudo as Partial<ListadoPaginado<T>> | null;
  return {
    elementos: candidato?.elementos ?? [],
    total_filas: candidato?.total_filas ?? 0,
    total_paginas: candidato?.total_paginas ?? 0,
    pagina: candidato?.pagina ?? 1,
    tamano_pagina: candidato?.tamano_pagina ?? 20,
  };
};
