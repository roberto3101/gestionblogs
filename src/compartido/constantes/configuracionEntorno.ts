interface ConfiguracionEntorno {
  urlBaseApi: string;
  nombreProducto: string;
  ambiente: 'desarrollo' | 'produccion' | 'pruebas';
}

const leerVariable = (clave: string, valorPorDefecto: string): string => {
  const valor = import.meta.env[clave];
  return typeof valor === 'string' && valor.length > 0 ? valor : valorPorDefecto;
};

export const configuracionEntorno: ConfiguracionEntorno = {
  urlBaseApi: leerVariable('VITE_URL_BASE_API', '/api'),
  nombreProducto: leerVariable('VITE_NOMBRE_PRODUCTO', 'Codeplex CMS'),
  ambiente: (leerVariable('VITE_AMBIENTE', 'desarrollo') as ConfiguracionEntorno['ambiente']),
};
