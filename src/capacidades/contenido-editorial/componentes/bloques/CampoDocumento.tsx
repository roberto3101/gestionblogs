import { useState } from 'react';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { unirClases } from '@compartido/utilidades/unirClases';
import { estaVacio } from '../../contratos/bloque';
import {
  camposDeArchivo,
  camposDeFoto,
  camposDeVideo,
  camposTecnicos,
  opcionesDeCampo,
  nombreDeCampo,
} from '../../contratos/diccionario';
import { CampoArchivo } from './CampoArchivo';
import { ATRIBUTO_RESUMEN } from './campoEnfocado';

/**
 * Editor recursivo de un documento JSON.
 *
 * Los bloques de contenido no tienen un esquema declarado: cada uno guarda la
 * forma que espera su plantilla. En vez de mantener un formulario a medida por
 * bloque —cincuenta y ocho, y subiendo— el formulario se deduce del propio
 * documento: un texto se edita como texto, una lista como lista, un objeto
 * como grupo.
 *
 * La contrapartida es que no se pueden añadir campos que la plantilla no
 * espere. Es a propósito: el sitio compila comparando la forma contra el
 * repositorio y descartaría un bloque con campos de menos. Por eso se puede
 * reordenar y duplicar elementos de una lista, pero no inventar claves.
 */

type Valor = unknown;

interface Propiedades {
  nombre: string;
  valor: Valor;
  alCambiar: (nuevo: Valor) => void;
  profundidad?: number;
  /**
   * El trozo entero. Hace falta para las listas cuyas opciones salen del
   * propio bloque, como las categorias de un caso, que tienen que coincidir
   * con los filtros que define esa misma seccion.
   */
  documentoRaiz?: Record<string, Valor>;
  /** Direccion de la web, para ver las fotos que aun viven en el sitio. */
  baseDelSitio?: string;
}

// Los nombres de campo salen del diccionario, que es donde vive la unica
// copia de "como se dice esto en cristiano".
import {
  CampoListaDeOpciones,
  CampoListaDeTextos,
  CampoTitularEnRenglones,
  esListaDeTextos,
  esTitularEnRenglones,
  opcionesDeLista,
} from './CamposEspeciales';

const humanizar = nombreDeCampo;

/** Un texto largo o con saltos de línea merece un área, no una línea. */
const esTextoLargo = (texto: string): boolean => texto.length > 90 || texto.includes('\n');

/** Resume un elemento de lista para poder plegarlo sin perder de vista qué es. */
const resumir = (valor: Valor): string => {
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor);
  if (Array.isArray(valor)) return valor.map(resumir).filter(Boolean).join(' · ');
  if (valor && typeof valor === 'object') {
    const objeto = valor as Record<string, Valor>;
    for (const preferida of ['titulo', 'nombre', 'etiqueta', 'producto', 'texto', 'cita', 'valor']) {
      const candidato = objeto[preferida];
      if (typeof candidato === 'string' && candidato.trim()) return candidato;
    }
    const primera = Object.values(objeto).find((v) => typeof v === 'string' && v.trim());
    return typeof primera === 'string' ? primera : '';
  }
  return '';
};

const recortar = (texto: string, limite = 70): string =>
  texto.length > limite ? `${texto.slice(0, limite)}…` : texto;

/** Copia profunda para no mutar el documento original al editar. */
const clonar = <T,>(valor: T): T => JSON.parse(JSON.stringify(valor)) as T;

export const CampoDocumento = ({
  nombre,
  valor,
  alCambiar,
  profundidad = 0,
  baseDelSitio = '',
  documentoRaiz,
}: Propiedades) => {
  if (typeof valor === 'string') {
    // Fotos, videos y documentos se eligen del ordenador, no se escriben.
    const clase = camposDeFoto.has(nombre)
      ? ('foto' as const)
      : camposDeVideo.has(nombre)
        ? ('video' as const)
        : camposDeArchivo.has(nombre)
          ? ('archivo' as const)
          : null;
    if (clase) {
      return (
        <CampoArchivo
          etiqueta={humanizar(nombre)}
          clase={clase}
          valor={valor}
          alCambiar={alCambiar}
          baseDelSitio={baseDelSitio}
        />
      );
    }
    // Campos que guardan una clave y no un texto —el nombre de un dibujo, el
    // de un boton, el filtro al que pertenece algo, la flecha de un
    // resultado—: se eligen de una lista, para no poder escribir algo que la
    // web no conozca y que desapareceria sin avisar.
    const deLaLista = opcionesDeLista(nombre, documentoRaiz);
    const opciones = deLaLista?.opciones ?? opcionesDeCampo(nombre);
    if (opciones) {
      const conocido = opciones.some((o) => o.valor === valor);
      return (
        <label className="flex flex-col gap-1.5">
          <span className="meta-tipografia text-humo">{humanizar(nombre)}</span>
          <select
            value={conocido ? valor : ''}
            onChange={(evento) => alCambiar(evento.target.value)}
            className="h-10 rounded-suave border border-ceniza bg-papel px-3 text-sm text-tinta outline-none focus:border-tinta"
          >
            <option value="">Sin elegir</option>
            {!conocido && valor !== '' && (
              // Un valor que la web ya no reconoce se sigue enseñando, para
              // que se vea que hay algo raro en vez de borrarlo en silencio.
              <option value={valor}>{valor} (la web no lo reconoce)</option>
            )}
            {opciones.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.etiqueta}
              </option>
            ))}
          </select>
          {deLaLista ? (
            <span className="text-xs text-humo">{deLaLista.ayuda}</span>
          ) : (
            nombre === 'icono' && (
              <span className="text-xs text-humo">El dibujo que acompaña a este texto.</span>
            )
          )}
        </label>
      );
    }

    // Lo que el programa usa para funcionar se muestra, pero apagado.
    if (camposTecnicos.has(nombre)) {
      return (
        <label className="flex flex-col gap-1.5">
          <span className="meta-tipografia text-humo">{humanizar(nombre)}</span>
          <input
            value={valor}
            readOnly
            className="bg-ceniza/30 border border-ceniza rounded-suave text-sm text-humo px-3 h-10 cursor-not-allowed"
          />
          <span className="text-xs text-humo">
            Esto lo usa la web para funcionar. Mejor no tocarlo.
          </span>
        </label>
      );
    }
    return esTextoLargo(valor) ? (
      <AreaTexto
        etiqueta={humanizar(nombre)}
        value={valor}
        rows={Math.min(10, Math.max(3, valor.split('\n').length + 1))}
        onChange={(evento) => alCambiar(evento.target.value)}
        ayuda={valor.includes('\n') ? 'Los saltos de línea se respetan en la web.' : undefined}
      />
    ) : (
      <CampoTexto
        etiqueta={humanizar(nombre)}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
      />
    );
  }

  if (typeof valor === 'number') {
    return (
      <CampoTexto
        etiqueta={humanizar(nombre)}
        type="number"
        value={valor}
        onChange={(evento) => alCambiar(Number(evento.target.value))}
      />
    );
  }

  if (typeof valor === 'boolean') {
    return (
      <label className="flex items-center gap-2 py-1">
        <input
          type="checkbox"
          checked={valor}
          onChange={(evento) => alCambiar(evento.target.checked)}
          className="h-4 w-4 accent-tinta"
        />
        <span className="meta-tipografia">{humanizar(nombre)}</span>
      </label>
    );
  }

  if (Array.isArray(valor)) {
    // Dos formas se enseñan como lo que significan, no como su estructura.
    // Ver CamposEspeciales.tsx para el por qué.
    const conOpciones = esListaDeTextos(valor) || valor.length === 0
      ? opcionesDeLista(nombre, documentoRaiz)
      : null;
    if (conOpciones) {
      return (
        <CampoListaDeOpciones
          nombre={nombre}
          valor={(valor as string[]).filter((x) => typeof x === 'string')}
          opciones={conOpciones.opciones}
          ayuda={conOpciones.ayuda}
          alCambiar={(nuevo) => alCambiar(nuevo as unknown as Valor)}
        />
      );
    }
    if (esListaDeTextos(valor)) {
      return (
        <CampoListaDeTextos
          nombre={nombre}
          valor={valor}
          alCambiar={(nuevo) => alCambiar(nuevo as unknown as Valor)}
        />
      );
    }
    if (esTitularEnRenglones(valor)) {
      return (
        <CampoTitularEnRenglones
          nombre={nombre}
          valor={valor}
          alCambiar={(nuevo) => alCambiar(nuevo as unknown as Valor)}
        />
      );
    }
    return (
      <ListaDocumento
        nombre={nombre}
        valor={valor}
        alCambiar={alCambiar}
        profundidad={profundidad}
        baseDelSitio={baseDelSitio}
        documentoRaiz={documentoRaiz}
      />
    );
  }

  if (valor && typeof valor === 'object') {
    const objeto = valor as Record<string, Valor>;
    return (
      <fieldset
        className={unirClases(
          'flex flex-col gap-4',
          profundidad > 0 && 'border-l border-ceniza pl-4',
        )}
      >
        <legend className="meta-tipografia text-grafito">{humanizar(nombre)}</legend>
        {Object.entries(objeto).map(([clave, hijo]) => (
          <CampoDocumento
            key={clave}
            nombre={clave}
            valor={hijo}
            profundidad={profundidad + 1}
            baseDelSitio={baseDelSitio}
            documentoRaiz={documentoRaiz}
            alCambiar={(nuevo) => alCambiar({ ...objeto, [clave]: nuevo })}
          />
        ))}
      </fieldset>
    );
  }

  // null o undefined: la plantilla no espera nada aquí.
  return null;
};

const ListaDocumento = ({
  nombre,
  valor,
  alCambiar,
  profundidad = 0,
  baseDelSitio = '',
  documentoRaiz,
}: Propiedades) => {
  const lista = valor as Valor[];
  const [plegados, asignarPlegados] = useState<Record<number, boolean>>({});

  const reemplazarEn = (indice: number, nuevo: Valor) => {
    const copia = [...lista];
    copia[indice] = nuevo;
    alCambiar(copia);
  };

  const mover = (indice: number, desplazamiento: number) => {
    const destino = indice + desplazamiento;
    if (destino < 0 || destino >= lista.length) return;
    const copia = [...lista];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    alCambiar(copia);
  };

  const duplicar = (indice: number) => {
    const copia = [...lista];
    copia.splice(indice + 1, 0, clonar(lista[indice]));
    alCambiar(copia);
  };

  const quitar = (indice: number) => {
    alCambiar(lista.filter((_, i) => i !== indice));
  };

  // Para añadir se copia el primer elemento y se vacían sus textos: así el
  // elemento nuevo tiene exactamente la forma que la plantilla espera.
  const anadir = () => {
    if (lista.length === 0) return;
    // Se despliega el elemento nuevo: viene vacio y hay que rellenarlo.
    asignarPlegados((previo) => ({ ...previo, [lista.length]: false }));
    alCambiar([...lista, vaciarTextos(clonar(lista[0]))]);
  };

  const esListaDeTextos = lista.every((elemento) => typeof elemento === 'string');

  if (esListaDeTextos) {
    return (
      <div className="flex flex-col gap-2">
        <span className="meta-tipografia text-grafito">{humanizar(nombre)}</span>
        {lista.map((elemento, indice) => (
          <div key={indice} className="flex items-center gap-2">
            <input
              value={elemento as string}
              onChange={(evento) => reemplazarEn(indice, evento.target.value)}
              className="flex-1 bg-papel border border-ceniza rounded-suave outline-none text-sm text-tinta px-3 h-9 focus:border-tinta"
            />
            <Boton
              tono="fantasma"
              tamano="compacto"
              type="button"
              onClick={() => mover(indice, -1)}
              disabled={indice === 0}
              aria-label="Subir"
            >
              ↑
            </Boton>
            <Boton
              tono="fantasma"
              tamano="compacto"
              type="button"
              onClick={() => mover(indice, 1)}
              disabled={indice === lista.length - 1}
              aria-label="Bajar"
            >
              ↓
            </Boton>
            <Boton
              tono="peligro"
              tamano="compacto"
              type="button"
              onClick={() => quitar(indice)}
              aria-label="Quitar"
            >
              ×
            </Boton>
          </div>
        ))}
        <div>
          <Boton tono="discreto" tamano="compacto" type="button" onClick={anadir} disabled={lista.length === 0}>
            Añadir
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="meta-tipografia text-grafito">
          {humanizar(nombre)} <span className="text-humo">({lista.length})</span>
        </span>
        <Boton tono="discreto" tamano="compacto" type="button" onClick={anadir} disabled={lista.length === 0}>
          Añadir
        </Boton>
      </div>

      {lista.map((elemento, indice) => {
        const plegado = plegados[indice] ?? lista.length > 3;
        const vacio = estaVacio(elemento);
        const titulo = recortar(resumir(elemento)) || `Elemento ${indice + 1}`;
        return (
          <article
            key={indice}
            /* De qué habla esta ficha. La vista previa lo usa para encender la
               tarjeta cuando el campo que se toca no es texto de la página
               —un dibujo, una foto, la clave de un filtro—. */
            {...{ [ATRIBUTO_RESUMEN]: titulo }}
            className={unirClases(
              'border rounded-suave bg-papel',
              vacio ? 'border-ambar/60' : 'border-ceniza',
            )}
          >
            <header className="flex items-center gap-2 px-3 py-2 border-b border-ceniza/60">
              <button
                type="button"
                onClick={() => asignarPlegados((previo) => ({ ...previo, [indice]: !plegado }))}
                className="flex-1 text-left text-sm text-tinta truncate"
              >
                <span className="text-humo mr-2">{indice + 1}.</span>
                {titulo}
              </button>
              {vacio && (
                <span
                  className="shrink-0 px-2 h-6 inline-flex items-center rounded-suave text-xs font-medium border border-ambar/40 bg-ambar/10 text-ambar"
                  title="Sin rellenar: en la web saldria como una tarjeta en blanco"
                >
                  vacio
                </span>
              )}
              <Boton
                tono="fantasma"
                tamano="compacto"
                type="button"
                onClick={() => mover(indice, -1)}
                disabled={indice === 0}
                aria-label="Subir"
              >
                ↑
              </Boton>
              <Boton
                tono="fantasma"
                tamano="compacto"
                type="button"
                onClick={() => mover(indice, 1)}
                disabled={indice === lista.length - 1}
                aria-label="Bajar"
              >
                ↓
              </Boton>
              <Boton tono="fantasma" tamano="compacto" type="button" onClick={() => duplicar(indice)}>
                Duplicar
              </Boton>
              <Boton tono="peligro" tamano="compacto" type="button" onClick={() => quitar(indice)}>
                Quitar
              </Boton>
            </header>
            {!plegado && (
              <div className="flex flex-col gap-4 p-4">
                <CampoDocumento
                  nombre={`elemento ${indice + 1}`}
                  valor={elemento}
                  profundidad={profundidad + 1}
                  baseDelSitio={baseDelSitio}
                  documentoRaiz={documentoRaiz}
                  alCambiar={(nuevo) => reemplazarEn(indice, nuevo)}
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

/** Deja la estructura intacta y vacía los textos, para un elemento nuevo. */
const vaciarTextos = (valor: Valor): Valor => {
  if (typeof valor === 'string') return '';
  if (Array.isArray(valor)) return valor.map(vaciarTextos);
  if (valor && typeof valor === 'object') {
    const objeto = valor as Record<string, Valor>;
    return Object.fromEntries(Object.entries(objeto).map(([clave, hijo]) => [clave, vaciarTextos(hijo)]));
  }
  return valor;
};
