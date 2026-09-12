import type { Identificador } from '@compartido/tipos/identificador';

/** Documento JSON arbitrario de un bloque de contenido. */
export type DocumentoBloque = Record<string, unknown>;

/**
 * Un bloque es una sección de contenido del sitio que no es un post:
 * portadas, catálogos, pie, textos. La `clave` espeja la ruta del archivo de
 * contenido en el sitio ("inicio/portada").
 *
 * `datos` es lo que está publicado; `borrador` son los cambios pendientes.
 * Editar nunca toca `datos`: solo publicar traslada uno al otro.
 */
export interface Bloque {
  id: Identificador;
  sitio_id: Identificador;
  idioma: string;
  clave: string;
  datos: DocumentoBloque;
  borrador?: DocumentoBloque;
  revision: number;
  estado: string;
  tiene_pendiente: boolean;
  publicado_en: string | null;
  actualizado_en: string | null;
}

export interface ResumenIdioma {
  idioma: string;
  bloques: number;
  pendientes: number;
}

export interface RevisionBloque {
  id: Identificador;
  bloque_id: Identificador;
  numero: number;
  nota: string;
  creado_en: string;
}

export interface SolicitudGuardarBloque {
  idioma: string;
  clave: string;
  datos: DocumentoBloque;
}

export interface SolicitudPublicarBloques {
  idioma: string;
  /** Vacío o ausente publica todo lo que tenga cambios pendientes. */
  claves?: string[];
  nota?: string;
}

export interface ResultadoPublicacion {
  idioma: string;
  publicados: string[];
  total: number;
}

/** Devuelve el documento que debe verse al editar: el borrador si lo hay. */
export const documentoVigente = (bloque: Bloque): DocumentoBloque =>
  bloque.tiene_pendiente && bloque.borrador ? bloque.borrador : bloque.datos;

/**
 * Parte "inicio/portada" en sección y nombre, para poder agrupar la lista por
 * sección igual que están los archivos en el sitio.
 */
export const partirClave = (clave: string): { seccion: string; nombre: string } => {
  const corte = clave.indexOf('/');
  if (corte < 0) return { seccion: 'general', nombre: clave };
  return { seccion: clave.slice(0, corte), nombre: clave.slice(corte + 1) };
};

/**
 * Indica si un valor no tiene ningún texto útil: todas sus cadenas están
 * vacías. Un elemento así viene de pulsar «Añadir» y no rellenarlo, y en la
 * web sale como una tarjeta en blanco.
 */
export const estaVacio = (valor: unknown): boolean => {
  if (typeof valor === 'string') return valor.trim() === '';
  if (Array.isArray(valor)) return valor.every(estaVacio);
  if (valor && typeof valor === 'object') {
    return Object.values(valor as Record<string, unknown>).every(estaVacio);
  }
  // Números y booleanos son contenido en sí mismos; null no aporta nada.
  return valor === null || valor === undefined;
};

export interface ElementoVacio {
  /** Ruta legible hasta la lista, por ejemplo "pasos" o "certificaciones.elementos". */
  lista: string;
  /** Posición dentro de la lista, empezando en 1. */
  posicion: number;
}

/**
 * Recorre el documento buscando elementos de lista completamente vacíos.
 *
 * Solo mira dentro de listas: un campo suelto vacío suele ser intencionado
 * (una nota que este bloque no usa), mientras que un elemento de lista vacío
 * es casi siempre un «Añadir» sin rellenar.
 */
export const elementosVacios = (valor: unknown, ruta = ''): ElementoVacio[] => {
  if (Array.isArray(valor)) {
    const hallazgos: ElementoVacio[] = [];
    valor.forEach((elemento, indice) => {
      if (estaVacio(elemento)) {
        hallazgos.push({ lista: ruta || 'la lista', posicion: indice + 1 });
        return;
      }
      hallazgos.push(...elementosVacios(elemento, `${ruta}[${indice + 1}]`));
    });
    return hallazgos;
  }
  if (valor && typeof valor === 'object') {
    return Object.entries(valor as Record<string, unknown>).flatMap(([clave, hijo]) =>
      elementosVacios(hijo, ruta ? `${ruta}.${clave}` : clave),
    );
  }
  return [];
};

/** Devuelve una copia del documento sin los elementos de lista vacíos. */
export const sinElementosVacios = <T>(valor: T): T => {
  if (Array.isArray(valor)) {
    return valor
      .filter((elemento) => !estaVacio(elemento))
      .map((elemento) => sinElementosVacios(elemento)) as unknown as T;
  }
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>).map(([clave, hijo]) => [
        clave,
        sinElementosVacios(hijo),
      ]),
    ) as unknown as T;
  }
  return valor;
};
