/**
 * Qué trozo de la web hay que encender cuando el cursor entra en un campo.
 *
 * El panel enseña una lista de campos y la web enseña una página. Para que
 * quien edita sepa cuál de los dos titulares de la pantalla tiene delante, el
 * panel le dice a la vista previa «rodea esto de naranja».
 *
 * Con un texto basta con mandar lo que pone en el campo. El problema es que
 * uno de cada tres campos no guarda texto de la página: guarda el nombre de un
 * dibujo, el archivo de una foto, la clave de un filtro, el nombre de un
 * botón. Nada de eso se lee en la página, así que no había nada que rodear y
 * quien pinchaba ahí no veía pasar nada.
 *
 * Por eso se mandan dos cosas:
 *
 *   texto     lo que pone en el campo, para rodear la frase exacta
 *   respaldo  el título de la ficha en la que vive, por si lo primero no sale
 *
 * Y si tampoco sale el respaldo, la propia página se encarga de señalar la
 * sección entera. Siempre se enciende algo.
 */

export interface CampoEnfocado {
  texto: string;
  respaldo: string;
}

/** Marca que llevan las fichas para saber de qué hablan sin leerles dentro. */
export const ATRIBUTO_RESUMEN = 'data-resumen';

/**
 * Marca de lo que vale un trozo que no es un campo de texto.
 *
 * La foto de una tarjeta, por ejemplo: no hay nada donde escribir, así que el
 * cursor nunca entra en ningún sitio y no había forma de saber que se estaba
 * tocando esa foto y no otra cosa.
 */
export const ATRIBUTO_VALOR = 'data-valor';

const LIMITE = 120;

/**
 * Lo que el campo enseña, no lo que guarda.
 *
 * En una lista desplegable lo que se guarda es una clave (`verCasoCompleto`,
 * `urbana`) y lo que la página enseña es el rótulo («Ver caso completo»,
 * «Seguridad urbana»). Se manda el rótulo, que es lo que se puede encontrar.
 */
const textoVisible = (nodo: HTMLElement): string | null => {
  if (nodo instanceof HTMLSelectElement) {
    const elegida = nodo.selectedOptions[0];
    return elegida ? elegida.textContent ?? '' : '';
  }
  if (nodo instanceof HTMLInputElement) {
    // Una casilla guarda «on», que no significa nada y encendería cualquier
    // palabra de la página que lleve esas dos letras.
    if (nodo.type === 'checkbox' || nodo.type === 'radio' || nodo.type === 'file') return '';
    return nodo.value;
  }
  if (nodo instanceof HTMLTextAreaElement) return nodo.value;
  return null;
};

/**
 * Qué mandar a la vista previa, o `null` si el foco no está en un campo.
 *
 * Se devuelve `null` para los botones (subir, duplicar, quitar): pulsarlos no
 * cambia de sitio, así que lo que estuviera encendido se queda encendido.
 */
export const leerCampoEnfocado = (objetivo: EventTarget | null): CampoEnfocado | null => {
  const nodo = objetivo as HTMLElement | null;
  if (!nodo || typeof nodo.closest !== 'function') return null;

  const ficha = nodo.closest(`[${ATRIBUTO_RESUMEN}]`);
  const respaldo = (ficha?.getAttribute(ATRIBUTO_RESUMEN) ?? '').slice(0, LIMITE);

  // Lo que no es un campo pero vale algo —una foto, un video— lo dice él mismo.
  const suyo = nodo.closest(`[${ATRIBUTO_VALOR}]`);
  if (suyo) {
    return { texto: (suyo.getAttribute(ATRIBUTO_VALOR) ?? '').slice(0, LIMITE), respaldo };
  }

  const texto = textoVisible(nodo);
  if (texto === null) return null;

  return { texto: texto.slice(0, LIMITE), respaldo };
};
