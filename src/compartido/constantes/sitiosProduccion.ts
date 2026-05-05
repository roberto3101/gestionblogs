interface DefinicionSitioPublico {
  codigo: string;
  urlProduccion: string;
  rutaBlog: string;
}

const leerConfiguracionDesdeEnv = (): DefinicionSitioPublico[] => {
  const crudo = import.meta.env.VITE_SITIOS_PUBLICOS_JSON;
  if (typeof crudo === 'string' && crudo.trim().length > 0) {
    try {
      const parseado = JSON.parse(crudo) as DefinicionSitioPublico[];
      if (Array.isArray(parseado) && parseado.length > 0) return parseado;
    } catch {
      // ignorar JSON invalido y caer al default
    }
  }
  return [];
};

const sitiosPorDefecto: DefinicionSitioPublico[] = [
  {
    codigo: 'DGDWEB',
    urlProduccion: 'https://dgd-enterprise-vercel-p5f9.vercel.app',
    rutaBlog: '/es/blog',
  },
  {
    codigo: 'AIROBOTICS',
    urlProduccion: 'https://ai-robotics-landing.vercel.app',
    rutaBlog: '/es/blog',
  },
];

const desdeEnv = leerConfiguracionDesdeEnv();
export const sitiosPublicos: DefinicionSitioPublico[] = desdeEnv.length > 0 ? desdeEnv : sitiosPorDefecto;

export const construirUrlPublicaPost = (codigoSitio: string, slug: string, idioma = 'es'): string | null => {
  const definicion = sitiosPublicos.find((s) => s.codigo === codigoSitio);
  if (!definicion) return null;
  const ruta = definicion.rutaBlog.replace(/^\/(es|en)/, `/${idioma}`);
  return `${definicion.urlProduccion}${ruta}/${slug}/`;
};

export const construirUrlPublicaBlog = (codigoSitio: string, idioma = 'es'): string | null => {
  const definicion = sitiosPublicos.find((s) => s.codigo === codigoSitio);
  if (!definicion) return null;
  const ruta = definicion.rutaBlog.replace(/^\/(es|en)/, `/${idioma}`);
  return `${definicion.urlProduccion}${ruta}/`;
};
