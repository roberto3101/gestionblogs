interface DefinicionSitioPublico {
  codigo: string;
  urlProduccion: string;
  /** Ruta del indice del blog en cada idioma. */
  rutasBlog: Record<string, string>;
}

/**
 * Acepta las dos formas de configurar un sitio:
 *
 *   { "rutasBlog": { "es": "/recursos/articulos", "en": "/en/resources/articles" } }
 *   { "rutaBlog":  "/es/blog" }
 *
 * La segunda es la forma antigua, con una sola plantilla en la que el idioma
 * iba dentro de la propia ruta. Sirve mientras las rutas de los dos idiomas
 * se parezcan, pero no vale para una web donde el indice esta en
 * /recursos/articulos y en /en/resources/articles.
 *
 * Se siguen aceptando las dos porque esta lista se define por variable de
 * entorno: si solo se admitiera la nueva, cualquier panel ya configurado se
 * quedaria en blanco al actualizar, que es justo lo que paso.
 */
const normalizarDefinicion = (crudo: unknown): DefinicionSitioPublico | null => {
  if (!crudo || typeof crudo !== 'object') return null;
  const entrada = crudo as Record<string, unknown>;

  const codigo = typeof entrada.codigo === 'string' ? entrada.codigo.trim() : '';
  const urlProduccion = typeof entrada.urlProduccion === 'string' ? entrada.urlProduccion.trim() : '';
  if (!codigo || !urlProduccion) return null;

  if (entrada.rutasBlog && typeof entrada.rutasBlog === 'object') {
    const rutas: Record<string, string> = {};
    for (const [idioma, ruta] of Object.entries(entrada.rutasBlog as Record<string, unknown>)) {
      if (typeof ruta === 'string' && ruta.trim()) rutas[idioma] = ruta.trim();
    }
    if (Object.keys(rutas).length > 0) return { codigo, urlProduccion, rutasBlog: rutas };
  }

  if (typeof entrada.rutaBlog === 'string' && entrada.rutaBlog.trim()) {
    const plantilla = entrada.rutaBlog.trim();
    return {
      codigo,
      urlProduccion,
      rutasBlog: {
        es: plantilla.replace(/^\/(es|en)(?=\/|$)/, '/es'),
        en: plantilla.replace(/^\/(es|en)(?=\/|$)/, '/en'),
      },
    };
  }

  return null;
};

const leerConfiguracionDesdeEnv = (): DefinicionSitioPublico[] => {
  const crudo = import.meta.env.VITE_SITIOS_PUBLICOS_JSON;
  if (typeof crudo !== 'string' || crudo.trim().length === 0) return [];
  try {
    const parseado: unknown = JSON.parse(crudo);
    if (!Array.isArray(parseado)) return [];
    const definiciones = parseado
      .map(normalizarDefinicion)
      .filter((d): d is DefinicionSitioPublico => d !== null);
    return definiciones;
  } catch {
    // JSON invalido: se cae a la lista de siempre en vez de romper el panel.
    return [];
  }
};

const sitiosPorDefecto: DefinicionSitioPublico[] = [
  {
    codigo: 'DGDWEB',
    urlProduccion: 'https://dgdenterprice.com',
    rutasBlog: { es: '/es/blog', en: '/en/blog' },
  },
  {
    codigo: 'AIROBOTICS',
    urlProduccion: 'https://ai-robotics-green.vercel.app',
    rutasBlog: { es: '/recursos/articulos', en: '/en/resources/articles' },
  },
];

const desdeEnv = leerConfiguracionDesdeEnv();
export const sitiosPublicos: DefinicionSitioPublico[] = desdeEnv.length > 0 ? desdeEnv : sitiosPorDefecto;

const buscar = (codigoSitio: string): DefinicionSitioPublico | undefined =>
  sitiosPublicos.find((s) => s.codigo === codigoSitio);

/**
 * Ruta del blog en un idioma. Nunca lanza: una entrada mal escrita puede
 * dejar un enlace sin construir, pero no puede tumbar la pagina entera.
 */
const rutaDelBlog = (definicion: DefinicionSitioPublico, idioma: string): string | null => {
  const rutas = definicion.rutasBlog ?? {};
  const ruta = rutas[idioma] ?? rutas.es ?? Object.values(rutas)[0];
  if (typeof ruta !== 'string' || !ruta) return null;
  return ruta.replace(/\/+$/, '');
};

export const construirUrlPublicaPost = (codigoSitio: string, slug: string, idioma = 'es'): string | null => {
  const definicion = buscar(codigoSitio);
  if (!definicion) return null;
  const ruta = rutaDelBlog(definicion, idioma);
  if (ruta === null) return null;
  return `${definicion.urlProduccion.replace(/\/+$/, '')}${ruta}/${slug}/`;
};

/**
 * Direccion de la web de un sitio, para abrirla o ensenarla en la vista
 * previa. Devuelve cadena vacia si ese sitio no esta configurado, y entonces
 * la vista previa simplemente no aparece.
 */
export const urlDeLaWeb = (codigoSitio: string): string => {
  const definicion = buscar(codigoSitio);
  return definicion ? definicion.urlProduccion.replace(/\/+$/, '') : '';
};

export const construirUrlPublicaBlog = (codigoSitio: string, idioma = 'es'): string | null => {
  const definicion = buscar(codigoSitio);
  if (!definicion) return null;
  const ruta = rutaDelBlog(definicion, idioma);
  if (ruta === null) return null;
  return `${definicion.urlProduccion.replace(/\/+$/, '')}${ruta}/`;
};
