/**
 * Dos formas de campo que no hay que enseñar como lo que son por dentro.
 *
 * El formulario de un trozo de la web se dibuja solo, recorriendo el JSON. Eso
 * funciona bien para textos y para fichas, pero con dos formas concretas daba
 * un resultado imposible de entender:
 *
 *   1. Una lista de textos ("OBSERVA", "ANALIZA", "CONECTA") salía como tres
 *      tarjetas, cada una con sus botones de subir, bajar, duplicar y quitar.
 *      Para tres palabras.
 *
 *   2. El titular grande se guarda como renglones, y cada renglón como trozos:
 *
 *        [[{texto:"Inteligencia artificial"}],
 *         [{texto:"para un "},{resaltado:true, texto:"Perú más seguro"}]]
 *
 *      El formulario lo pintaba con cuatro niveles anidados —"TÍTULO GRANDE",
 *      "ELEMENTO 1", "1.", "TEXTO"— y botones en cada nivel. Quien lo abría no
 *      tenía ni idea de qué estaba viendo.
 *
 * Aquí se enseña lo que significan: un cuadro con una cosa por línea, y el
 * titular como sus renglones, con la parte de color aparte.
 */

import { unirClases } from '@compartido/utilidades/unirClases';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { nombreDeCampo, opcionesDeCampo } from '../../contratos/diccionario';

type Valor = unknown;

/* ------------------------------------------------------------------ deteccion */

/** Lista de textos sueltos: ["OBSERVA", "ANALIZA", "CONECTA"]. */
export const esListaDeTextos = (valor: Valor): valor is string[] =>
  Array.isArray(valor) && valor.length > 0 && valor.every((x) => typeof x === 'string');

interface Trozo {
  texto: string;
  resaltado?: boolean;
}

/** Renglones de un titular: [[{texto}], [{texto},{texto, resaltado}]]. */
export const esTitularEnRenglones = (valor: Valor): valor is Trozo[][] =>
  Array.isArray(valor) &&
  valor.length > 0 &&
  valor.every(
    (linea) =>
      Array.isArray(linea) &&
      linea.length > 0 &&
      linea.every(
        (t) => t !== null && typeof t === 'object' && typeof (t as Trozo).texto === 'string',
      ),
  );

/* --------------------------------------------------------- lista de textos */

export const CampoListaDeTextos = ({
  nombre,
  valor,
  alCambiar,
}: {
  nombre: string;
  valor: string[];
  alCambiar: (nuevo: string[]) => void;
}) => (
  <AreaTexto
    etiqueta={nombreDeCampo(nombre)}
    value={valor.join('\n')}
    rows={Math.min(8, Math.max(2, valor.length + 1))}
    ayuda="Una por línea. Para quitar una, borra su línea."
    onChange={(evento) => {
      const lineas = evento.target.value.split('\n');
      // No se filtran las vacías mientras se escribe: si se hiciera, al pulsar
      // Enter para añadir una nueva se borraría antes de poder escribirla.
      alCambiar(lineas);
    }}
    onBlur={() => alCambiar(valor.filter((l) => l.trim() !== ''))}
  />
);

/* ------------------------------------------------------------- el titular */

/**
 * El titular, renglón a renglón.
 *
 * Cuando un renglón lleva una parte resaltada, siempre es la última: se
 * enseña en su propio cuadro, con el nombre que le corresponde («parte de
 * color»), en vez de como un segundo elemento de una lista anidada.
 */
export const CampoTitularEnRenglones = ({
  nombre,
  valor,
  alCambiar,
}: {
  nombre: string;
  valor: Trozo[][];
  alCambiar: (nuevo: Trozo[][]) => void;
}) => {
  const cambiarLinea = (indice: number, normal: string, resaltado: string) => {
    const nuevo = valor.map((linea, i) => {
      if (i !== indice) return linea;
      const trozos: Trozo[] = [];
      if (normal) trozos.push({ texto: normal });
      if (resaltado) trozos.push({ texto: resaltado, resaltado: true });
      // Un renglón sin nada se queda con un trozo vacío, para no perderlo.
      return trozos.length > 0 ? trozos : [{ texto: '' }];
    });
    alCambiar(nuevo);
  };

  const partesDe = (linea: Trozo[]) => ({
    normal: linea
      .filter((t) => !t.resaltado)
      .map((t) => t.texto)
      .join(''),
    resaltado: linea
      .filter((t) => t.resaltado)
      .map((t) => t.texto)
      .join(''),
  });

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="meta-tipografia">{nombreDeCampo(nombre)}</span>
        <span className="text-xs text-humo">Cada renglón es una línea del titular en la web.</span>
      </div>

      {valor.map((linea, i) => {
        const { normal, resaltado } = partesDe(linea);
        return (
          <div
            key={i}
            className="grid grid-cols-1 gap-2 rounded-suave border border-ceniza bg-papel p-3 sm:grid-cols-[1fr,minmax(0,14rem),auto]"
          >
            <CampoTexto
              etiqueta={`Renglón ${i + 1}`}
              value={normal}
              onChange={(e) => cambiarLinea(i, e.target.value, resaltado)}
            />
            <CampoTexto
              etiqueta="Parte de color"
              value={resaltado}
              placeholder="opcional"
              onChange={(e) => cambiarLinea(i, normal, e.target.value)}
            />
            <div className="flex items-end gap-1">
              <button
                type="button"
                onClick={() => {
                  if (i === 0) return;
                  const nuevo = [...valor];
                  [nuevo[i - 1], nuevo[i]] = [nuevo[i], nuevo[i - 1]];
                  alCambiar(nuevo);
                }}
                disabled={i === 0}
                title="Subir este renglón"
                className={unirClases(
                  'h-10 w-9 rounded-suave border border-ceniza text-grafito transicion-natural',
                  i === 0 ? 'opacity-30' : 'hover:bg-ceniza/40 hover:text-tinta',
                )}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => alCambiar(valor.filter((_, j) => j !== i))}
                title="Quitar este renglón"
                className="h-10 w-9 rounded-suave text-humo transicion-natural hover:bg-cinabrio/10 hover:text-cinabrio"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => alCambiar([...valor, [{ texto: '' }]])}
        className="h-9 rounded-suave border border-dashed border-ceniza px-3 text-xs text-grafito transicion-natural hover:border-grafito hover:text-tinta"
      >
        + Añadir un renglón
      </button>
    </div>
  );
};


/* ------------------------------------------- listas de cosas que hay que elegir */

/**
 * Hay listas de textos que NO son texto libre: guardan el nombre de un dibujo
 * del juego de iconos, o la clave de uno de los filtros del propio bloque.
 *
 * Enseñarlas como un cuadro donde escribir era peor que antes: si alguien
 * escribe «tapioca» donde iba «camara», el dibujo desaparece de la web y nadie
 * avisa; y una categoría inventada deja ese caso fuera de todos los filtros.
 *
 * Aquí se eligen de una lista y no hay forma de escribir algo que la web no
 * conozca.
 */
export const CampoListaDeOpciones = ({
  nombre,
  valor,
  opciones,
  ayuda,
  alCambiar,
}: {
  nombre: string;
  valor: string[];
  opciones: { valor: string; etiqueta: string }[];
  ayuda?: string;
  alCambiar: (nuevo: string[]) => void;
}) => {
  const cambiar = (i: number, v: string) =>
    alCambiar(valor.map((x, j) => (j === i ? v : x)));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="meta-tipografia">{nombreDeCampo(nombre)}</span>
        {ayuda && <span className="text-xs text-humo">{ayuda}</span>}
      </div>

      {valor.length === 0 && (
        <p className="text-xs text-humo">No hay ninguno todavía.</p>
      )}

      {valor.map((actual, i) => {
        const conocido = opciones.some((o) => o.valor === actual);
        return (
          <div key={i} className="flex items-center gap-2">
            <select
              value={conocido ? actual : ''}
              onChange={(e) => cambiar(i, e.target.value)}
              className="h-10 flex-1 rounded-suave border border-ceniza bg-papel px-3 text-sm text-tinta outline-none focus:border-tinta"
            >
              <option value="">Sin elegir</option>
              {!conocido && actual !== '' && (
                // Un valor que la web ya no reconoce se sigue enseñando marcado
                // como tal, en vez de borrarlo en silencio.
                <option value={actual}>{actual} (la web no lo reconoce)</option>
              )}
              {opciones.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => alCambiar(valor.filter((_, j) => j !== i))}
              aria-label="Quitar"
              title="Quitar"
              className="grid h-10 w-9 place-items-center rounded-suave text-humo transicion-natural hover:bg-cinabrio/10 hover:text-cinabrio"
            >
              ✕
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => alCambiar([...valor, ''])}
        className="h-9 rounded-suave border border-dashed border-ceniza px-3 text-xs text-grafito transicion-natural hover:border-grafito hover:text-tinta"
      >
        + Añadir
      </button>
    </div>
  );
};

/**
 * Qué opciones tiene una lista, si es de las que hay que elegir.
 *
 * `iconos` son dibujos del juego de la web. `categorias` son las claves de los
 * filtros que el propio bloque define en `opcionesFiltro`: se leen de ahí, así
 * que si alguien añade un filtro nuevo aparece solo.
 */
export const opcionesDeLista = (
  nombre: string,
  documento?: Record<string, unknown>,
): { opciones: { valor: string; etiqueta: string }[]; ayuda: string } | null => {
  if (nombre === 'iconos') {
    const iconos = opcionesDeCampo('icono');
    return iconos ? { opciones: iconos, ayuda: 'Dibujos del juego de la web.' } : null;
  }
  if (nombre === 'categorias' && documento) {
    const filtros = documento.opcionesFiltro;
    if (Array.isArray(filtros)) {
      const opciones = filtros
        .filter((f): f is { clave: string; etiqueta: string } =>
          f !== null && typeof f === 'object' && typeof (f as { clave?: unknown }).clave === 'string',
        )
        .filter((f) => f.clave !== '')
        .map((f) => ({ valor: f.clave, etiqueta: f.etiqueta || f.clave }));
      if (opciones.length > 0) {
        return { opciones, ayuda: 'De los filtros de esta misma sección.' };
      }
    }
  }
  return null;
};
