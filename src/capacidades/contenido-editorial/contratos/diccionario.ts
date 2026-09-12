/**
 * Traduce los nombres internos del contenido a lenguaje corriente.
 *
 * En la base, un trozo de la web se llama `inicio/portada` y sus campos
 * `antetitulo` o `lineasTitulo`. Eso vale para el programa y no vale para
 * nadie más. Aquí vive la única copia de «cómo se dice esto en cristiano».
 *
 * Lo que no esté en estas tablas se sigue mostrando, con el nombre suavizado:
 * un bloque nuevo aparece igual, solo que sin descripción. Nada se esconde por
 * no estar traducido.
 */

/** Las páginas del sitio, en el orden en que están en el menú. */
export interface Pagina {
  /** Prefijo de la clave: "inicio", "comunes", "casos-de-uso"… */
  prefijo: string;
  nombre: string;
  descripcion: string;
  /** Dirección en la web, para abrir la vista previa. */
  ruta: string;
}

export const paginas: Pagina[] = [
  {
    prefijo: 'inicio',
    nombre: 'Página de inicio',
    descripcion: 'Lo primero que ve quien entra en la web.',
    ruta: '/',
  },
  {
    prefijo: 'soluciones',
    nombre: 'Soluciones',
    descripcion: 'Los productos que ofrecéis.',
    ruta: '/soluciones/',
  },
  {
    prefijo: 'tecnologia',
    nombre: 'Tecnología',
    descripcion: 'Cómo funciona la plataforma por dentro.',
    ruta: '/tecnologia/',
  },
  {
    prefijo: 'sectores',
    nombre: 'Sectores',
    descripcion: 'Los tipos de cliente a los que os dirigís.',
    ruta: '/sectores/',
  },
  {
    prefijo: 'casos-de-uso',
    nombre: 'Casos de uso',
    descripcion: 'Ejemplos reales de clientes.',
    ruta: '/casos-de-uso/',
  },
  {
    prefijo: 'nosotros',
    nombre: 'Nosotros',
    descripcion: 'La empresa, el equipo y el formulario de contacto.',
    ruta: '/nosotros/',
  },
  {
    prefijo: 'recursos',
    nombre: 'Recursos',
    descripcion: 'Artículos, vídeos y documentos para descargar.',
    ruta: '/recursos/',
  },
  {
    prefijo: 'comunes',
    nombre: 'En todas las páginas',
    descripcion: 'El menú de arriba y el pie de abajo, que salen en toda la web.',
    ruta: '/',
  },
  {
    prefijo: 'ajustes',
    nombre: 'Ajustes',
    descripcion: 'Configuración que no se ve en la web.',
    ruta: '/',
  },
];

export interface Bloque {
  nombre: string;
  descripcion: string;
  /**
   * En que puesto sale al bajar por la pagina. Sin esto la lista queda por
   * orden alfabetico del nombre interno, que no se parece en nada al recorrido
   * que hace la vista de quien mira la web.
   */
  orden?: number;
  /**
   * Trocito de texto que aparece en la web y sirve para reconocer la sección
   * de un vistazo. Se usa para saltar a ella en la vista previa.
   */
  ancla?: string;
}

/** Cada trozo de contenido, con nombre y explicación de dónde sale. */
export const bloques: Record<string, Bloque> = {
  // ------------------------------------------------------------ inicio
  'inicio/portada': {
    orden: 1,
    nombre: 'Primera pantalla',
    descripcion: 'El titular grande con la foto de fondo, nada más entrar.',
  },
  'inicio/cambio': {
    orden: 2,
    nombre: 'La seguridad está cambiando',
    descripcion: 'El bloque con la foto grande justo debajo del titular.',
  },
  'inicio/funcionamiento': {
    orden: 3,
    nombre: 'Cómo funciona',
    descripcion: 'Los tres pasos numerados: conectamos, analizamos, respondemos.',
  },
  'inicio/soluciones': {
    orden: 4,
    nombre: 'Nuestras soluciones',
    descripcion: 'Las seis tarjetas de productos CERBERUS.',
  },
  'inicio/sectores': {
    orden: 5,
    nombre: 'Soluciones para cada sector',
    descripcion: 'Las tarjetas con foto de cada tipo de cliente.',
  },
  'inicio/resultados': {
    orden: 6,
    nombre: 'Resultados y confianza',
    descripcion: 'Las cifras grandes sobre la foto de la montaña.',
  },
  'inicio/casos': {
    orden: 7,
    nombre: 'Casos que se deslizan',
    descripcion: 'El carrusel de ejemplos con flechas a los lados.',
  },
  'inicio/llamada': {
    orden: 8,
    nombre: 'Invitación del final',
    descripcion: 'La franja con foto del final de la página.',
  },
  'inicio/metadatos': {
    orden: 99,
    nombre: 'Cómo se ve en Google',
    descripcion: 'El título y la descripción que aparecen en los buscadores.',
  },

  // -------------------------------------------------------- soluciones
  'soluciones/portada': {
    orden: 1,
    nombre: 'Primera pantalla',
    descripcion: 'El titular de arriba con el vídeo.',
  },
  'soluciones/catalogo': {
    orden: 3,
    nombre: 'Lista de soluciones',
    descripcion: 'Las tarjetas con foto de cada producto.',
  },
  'soluciones/pestanas': {
    orden: 2,
    nombre: 'Botones para filtrar',
    descripcion: 'Los botones de arriba que filtran las tarjetas.',
  },
  'soluciones/llamada': {
    orden: 4,
    nombre: 'Invitación del final',
    descripcion: 'La franja del final con las cifras.',
  },
  'soluciones/metadatos': {
    orden: 99,
    nombre: 'Cómo se ve en Google',
    descripcion: 'El título y la descripción que aparecen en los buscadores.',
  },

  // -------------------------------------------------------- tecnologia
  'tecnologia/portada': {
    orden: 1,
    nombre: 'Primera pantalla',
    descripcion: 'El titular de arriba con el vídeo.',
  },
  'tecnologia/panorama': {
    orden: 2,
    nombre: 'El esquema de la plataforma',
    descripcion: 'El dibujo con lo que entra, el centro y lo que sale.',
  },
  'tecnologia/componentes': {
    orden: 4,
    nombre: 'Las piezas',
    descripcion: 'Las tarjetas con foto de cada componente.',
  },
  'tecnologia/pestanas': {
    orden: 3,
    nombre: 'Botones para filtrar',
    descripcion: 'Los botones de arriba que filtran las tarjetas.',
  },
  'tecnologia/llamada': {
    orden: 5,
    nombre: 'Invitación del final',
    descripcion: 'La franja del final con las cifras.',
  },
  'tecnologia/metadatos': {
    orden: 99,
    nombre: 'Cómo se ve en Google',
    descripcion: 'El título y la descripción que aparecen en los buscadores.',
  },

  // ----------------------------------------------------------- sectores
  'sectores/portada': {
    orden: 1,
    nombre: 'Primera pantalla',
    descripcion: 'El titular de arriba con la foto de fondo.',
  },
  'sectores/catalogo': {
    orden: 2,
    nombre: 'Los quince sectores',
    descripcion: 'Las tarjetas con foto de cada sector.',
  },
  'sectores/beneficios': {
    orden: 3,
    nombre: 'Qué gana el cliente',
    descripcion: 'Las cuatro ventajas con icono.',
  },
  'sectores/caso-exito': {
    orden: 4,
    nombre: 'Caso de éxito',
    descripcion: 'El ejemplo destacado con cifras y una cita.',
  },
  'sectores/llamada': {
    orden: 5,
    nombre: 'Invitación del final',
    descripcion: 'La franja con foto del final de la página.',
  },
  'sectores/metadatos': {
    orden: 99,
    nombre: 'Cómo se ve en Google',
    descripcion: 'El título y la descripción que aparecen en los buscadores.',
  },

  // ------------------------------------------------------- casos de uso
  'casos-de-uso/portada': {
    orden: 1,
    nombre: 'Primera pantalla',
    descripcion: 'El titular de arriba con las fotos pequeñas.',
  },
  'casos-de-uso/catalogo': {
    orden: 3,
    nombre: 'Lista de casos',
    descripcion: 'Las tarjetas con foto, con su buscador y su filtro.',
  },
  'casos-de-uso/destacado': {
    orden: 4,
    nombre: 'El caso destacado',
    descripcion: 'El ejemplo grande con vídeo y resultados.',
  },
  'casos-de-uso/testimonios': {
    orden: 5,
    nombre: 'Lo que dicen los clientes',
    descripcion: 'Las citas que se deslizan con flechas.',
  },
  'casos-de-uso/pestanas': {
    orden: 2,
    nombre: 'Botones para filtrar',
    descripcion: 'Los botones de arriba que filtran las tarjetas.',
  },
  'casos-de-uso/llamada': {
    orden: 6,
    nombre: 'Invitación del final',
    descripcion: 'La franja con foto del final de la página.',
  },
  'casos-de-uso/metadatos': {
    orden: 99,
    nombre: 'Cómo se ve en Google',
    descripcion: 'El título y la descripción que aparecen en los buscadores.',
  },

  // ----------------------------------------------------------- nosotros
  'nosotros/portada': {
    orden: 1,
    nombre: 'Primera pantalla',
    descripcion: 'El titular de arriba con la cita.',
  },
  'nosotros/historia': {
    orden: 2,
    nombre: 'Nuestra historia',
    descripcion: 'El texto con la foto del edificio, la misión y la visión.',
  },
  'nosotros/valores': {
    orden: 3,
    nombre: 'Nuestros valores',
    descripcion: 'Los cinco valores con icono y la cita del final.',
  },
  'nosotros/equipo': {
    orden: 4,
    nombre: 'El equipo',
    descripcion: 'El texto con la foto del equipo trabajando.',
  },
  'nosotros/cifras': {
    orden: 5,
    nombre: 'Las cifras',
    descripcion: 'Los seis números sobre la foto de la montaña.',
  },
  'nosotros/alianzas': {
    orden: 6,
    nombre: 'Alianzas y certificaciones',
    descripcion: 'Los sellos de empresas asociadas y certificados.',
  },
  'nosotros/contacto': {
    orden: 7,
    nombre: 'Formulario de contacto',
    descripcion: 'Los textos del formulario: etiquetas, avisos de error y mensajes.',
  },
  'nosotros/llamada': {
    orden: 8,
    nombre: 'Invitación del final',
    descripcion: 'La franja con foto del final de la página.',
  },
  'nosotros/metadatos': {
    orden: 99,
    nombre: 'Cómo se ve en Google',
    descripcion: 'El título y la descripción que aparecen en los buscadores.',
  },

  // ----------------------------------------------------------- recursos
  'recursos/portada': {
    orden: 1,
    nombre: 'Primera pantalla',
    descripcion: 'El titular de arriba con la foto de fondo.',
  },
  'recursos/articulos': {
    orden: 3,
    nombre: 'Artículos destacados',
    descripcion:
      'Las tres tarjetas de artículos. Si ya hay artículos publicados en «Posts», la web usa esos y esto queda de reserva.',
  },
  'recursos/videos': {
    orden: 4,
    nombre: 'Vídeos',
    descripcion: 'Las tarjetas de vídeo que se abren en una ventana.',
  },
  'recursos/documentos': {
    orden: 5,
    nombre: 'Documentos para descargar',
    descripcion: 'Los archivos PDF y Excel que la gente puede bajarse.',
  },
  'recursos/panel-lateral': {
    orden: 6,
    nombre: 'Columna de la derecha',
    descripcion: 'El boletín, el vídeo destacado, los eventos y las noticias.',
  },
  'recursos/pestanas': {
    orden: 2,
    nombre: 'Botones para filtrar',
    descripcion: 'Los botones de arriba que filtran el contenido.',
  },
  'recursos/llamada': {
    orden: 7,
    nombre: 'Invitación del final',
    descripcion: 'La franja con foto del final de la página.',
  },
  'recursos/metadatos': {
    orden: 99,
    nombre: 'Cómo se ve en Google',
    descripcion: 'El título y la descripción que aparecen en los buscadores.',
  },

  // ------------------------------------------------------------ comunes
  'comunes/navegacion': {
    orden: 1,
    nombre: 'Menú de arriba',
    descripcion: 'Los nombres de las secciones en la barra superior.',
  },
  'comunes/pie': {
    orden: 7,
    nombre: 'Pie de página',
    descripcion: 'Las columnas de enlaces, el contacto y las redes sociales de abajo.',
  },
  'comunes/marca': {
    orden: 2,
    nombre: 'Nombre de la marca',
    descripcion: 'Cómo se escribe el nombre de la empresa y del producto.',
  },
  'comunes/organizacion': {
    orden: 8,
    nombre: 'Datos de la empresa',
    descripcion: 'Razón social, correo y teléfono. Los usan también los buscadores.',
  },
  'comunes/acciones': {
    orden: 3,
    nombre: 'Texto de los botones',
    descripcion: '«Solicitar demostración», «Leer más»… Se repiten por toda la web.',
  },
  'comunes/busqueda': {
    orden: 4,
    nombre: 'Buscador',
    descripcion: 'Los textos de la lupa de la barra superior.',
  },
  'comunes/idioma': {
    orden: 5,
    nombre: 'Selector de idioma',
    descripcion: 'Los nombres de los idiomas en la barra superior.',
  },
  'comunes/visor': {
    orden: 6,
    nombre: 'Ventana de vídeo',
    descripcion: 'Los textos de la ventana que se abre al ver un vídeo.',
  },

  // ------------------------------------------------------------ ajustes
  'ajustes/correo': {
    orden: 1,
    nombre: 'A quién llegan los formularios',
    descripcion:
      'Las direcciones que reciben aviso cuando alguien escribe desde la web. No se ve en la web.',
  },
};

/** Nombres de campo en lenguaje corriente. */
export const campos: Record<string, string> = {
  // Titulares y textos
  antetitulo: 'Texto pequeño de encima',
  titulo: 'Título',
  lineasTitulo: 'Título grande',
  subtitulo: 'Subtítulo',
  entradilla: 'Párrafo de presentación',
  texto: 'Texto',
  textoInicio: 'Texto (primera parte)',
  textoEnlace: 'Texto del enlace',
  textoFin: 'Texto (última parte)',
  nota: 'Nota al pie',
  notaLateral: 'Nota del lateral',
  cita: 'Frase entrecomillada',
  autorCita: 'Quién dice la frase',
  autor: 'Quién lo dice',
  cargo: 'Su puesto',
  nombre: 'Nombre',
  descripcion: 'Descripción',
  detalle: 'Detalle',
  resumen: 'Resumen',
  lema: 'Lema',

  // Botones y acciones
  accion: 'Texto del botón',
  accionPrincipal: 'Botón principal',
  accionSecundaria: 'Botón secundario',
  accionContacto: 'Botón de contacto',
  verTodos: 'Enlace «ver todos»',
  verTodas: 'Enlace «ver todas»',
  enviar: 'Botón de enviar',
  enviando: 'Texto mientras envía',

  // Medios
  imagen: 'Foto',
  imagenVideo: 'Foto del vídeo',
  video: 'Vídeo',
  origen: 'Vídeo',
  archivo: 'Archivo para descargar',
  archivoPdf: 'PDF para descargar',
  poster: 'Foto de portada del vídeo',
  textoAlternativo: 'Descripción de la foto (para quien no la ve)',
  textoAlternativoVideo: 'Descripción del vídeo',
  textoAlternativoCita: 'Descripción de la foto de la cita',
  textoAlternativoPortada: 'Descripción de la foto principal',

  // Listas y piezas
  elementos: 'Elementos',
  pasos: 'Pasos',
  cifras: 'Cifras',
  resultados: 'Resultados',
  atributos: 'Puntos destacados',
  marcadores: 'Etiquetas',
  emblemas: 'Logotipos',
  certificaciones: 'Certificaciones',
  columnas: 'Columnas',
  enlaces: 'Enlaces',
  redes: 'Redes sociales',
  opciones: 'Opciones',
  opcionesFiltro: 'Opciones del filtro',
  opcionesConsulta: 'Tipos de consulta',
  campos: 'Campos del formulario',
  palabrasLaterales: 'Palabras verticales del lateral',
  palabrasLateralesEco: 'Palabras verticales (segunda línea)',
  palabrasSede: 'Palabras verticales de la sede',
  miniaturas: 'Fotos pequeñas',
  ambitos: 'Filtros a los que pertenece',
  categorias: 'Filtros a los que pertenece',

  // Etiquetas sueltas
  icono: 'Dibujo',
  iconos: 'Dibujos',
  distintivo: 'Etiqueta de color',
  distintivoDoc: 'Etiqueta del documento',
  insignia: 'Etiqueta',
  insigniaVideo: 'Etiqueta del vídeo',
  detalleVideo: 'Detalle del vídeo',
  etiqueta: 'Etiqueta',
  rotulo: 'Rótulo',
  clave: 'Identificador interno',
  valor: 'Valor',
  numero: 'Número',
  fecha: 'Fecha',
  duracion: 'Duración',
  peso: 'Tamaño del archivo',
  formato: 'Tipo de archivo',
  dia: 'Día',
  mes: 'Mes',
  hora: 'Hora',
  color: 'Color',
  orden: 'Orden',
  producto: 'Producto',
  familia: 'Familia',
  ubicacion: 'Lugar',
  sector: 'Sector',
  organizacion: 'Organización',
  empresa: 'Empresa',
  telefono: 'Teléfono',
  telefonoEnlace: 'Teléfono (para marcar)',
  correo: 'Correo electrónico',
  destino: 'A dónde lleva',
  destinatarios: 'Quién recibe los avisos',
  red: 'Red social',
  tendencia: 'Tendencia',
  codigo: 'Código',
  marcador: 'Texto de ejemplo del campo',
  marcadorBusqueda: 'Texto de ejemplo del buscador',
  error: 'Aviso cuando está mal',
  abrirMenu: 'Abrir el menú',
  cerrarMenu: 'Cerrar el menú',
  cerrar: 'Cerrar',
  atajo: 'Atajo de teclado',
  sinResultados: 'Cuando no hay resultados',
  conteo: 'Contador de resultados',
  aviso: 'Aviso legal',
  consentimiento: 'Casilla de permiso',
  errorConsentimiento: 'Aviso si no marca la casilla',
  exito: 'Mensaje de enviado',
  exitoRemoto: 'Mensaje de enviado',
  fallo: 'Mensaje si falla el envío',
  asunto: 'Asunto del correo',
  asuntoContacto: 'Asunto del correo de contacto',
  asuntoBoletin: 'Asunto del correo del boletín',
  maximoPorHora: 'Máximo de envíos por hora',
  palabrasClave: 'Palabras clave para buscadores',
  nombreSitio: 'Nombre del sitio',
  razonSocial: 'Razón social',
  ambitoAtendido: 'Zona donde trabajáis',
  ciudadFundacion: 'Ciudad de origen',
  redSocial: 'Usuario en redes',
  configuracionRegional: 'Región e idioma',
  nombrePlataforma: 'Nombre de la plataforma',
  lemaPlataforma: 'Lema de la plataforma',
  lemaProducto: 'Lema del producto',
  marcaGrande: 'Marca de agua grande',
  rotuloRedes: 'Rótulo de redes',
  rotuloBusqueda: 'Rótulo del buscador',
  pais: 'País',
  abreviatura: 'Abreviatura',
  bandera: 'Bandera',
  actual: 'Idioma actual',
  complemento: 'Bloque añadido',
  mision: 'Misión',
  vision: 'Visión',
  canales: 'Otras formas de contacto',
  esquema: 'Esquema',
  entradas: 'Lo que entra',
  nucleo: 'El centro',
  salidas: 'Lo que sale',
  tituloResultados: 'Título de los resultados',
  boletin: 'Boletín por correo',
  destacado: 'Destacado',
  eventos: 'Eventos',
  noticias: 'Noticias',
  consulta: 'Tipo de consulta',
  mensaje: 'Mensaje',
  contacto: 'Contacto',
  lineas: 'Líneas',
};

/** Campos que guardan una foto. Se editan con un selector de archivo. */
export const camposDeFoto = new Set(['imagen', 'imagenVideo', 'poster']);

/** Campos que guardan un vídeo. */
export const camposDeVideo = new Set(['video', 'origen']);

/** Campos que guardan un documento descargable. */
export const camposDeArchivo = new Set(['archivo', 'archivoPdf']);

/** Campos que es mejor no tocar: los usa el programa para funcionar. */
export const camposTecnicos = new Set(['clave', 'ambitos', 'categorias', 'bandera', 'red', 'formato']);

/** Convierte "palabrasLaterales" en "Palabras laterales" como último recurso. */
const suavizar = (nombre: string): string => {
  const conEspacios = nombre
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_/]/g, ' ')
    .trim();
  return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1).toLowerCase();
};

export const nombreDeCampo = (clave: string): string => campos[clave] ?? suavizar(clave);

export const nombreDeBloque = (clave: string): string => bloques[clave]?.nombre ?? suavizar(clave);

export const descripcionDeBloque = (clave: string): string => bloques[clave]?.descripcion ?? '';

/** Puesto del bloque al bajar por la pagina. Lo desconocido va al final. */
export const ordenDeBloque = (clave: string): number => bloques[clave]?.orden ?? 50;

export const paginaDe = (clave: string): Pagina | undefined => {
  const prefijo = clave.split('/')[0];
  return paginas.find((p) => p.prefijo === prefijo);
};
