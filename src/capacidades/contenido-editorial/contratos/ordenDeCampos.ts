/**
 * En que orden se enseñan los campos de cada trozo de la web.
 *
 * La base guarda el contenido como JSON y devuelve las claves en orden
 * alfabetico, asi que el formulario salia con los botones antes que el titular
 * y la foto por ningun sitio. Aqui esta el orden de verdad, sacado de los
 * archivos de contenido del proyecto de la web, que se escribieron siguiendo
 * el orden en que las cosas aparecen en la pagina.
 *
 * La foto y el video van los primeros aunque en la pagina esten al fondo: es
 * lo que mas cuesta encontrar cuando se quiere cambiar. Su descripcion va
 * justo detras, porque describe a la foto que se acaba de ver.
 *
 * Un campo que no este en esta lista se pinta detras, en el orden que venga.
 */
export const ordenDeCampos: Record<string, string[]> = {
  'casos-de-uso/catalogo': ['titulo', 'subtitulo', 'marcadorBusqueda', 'rotuloFiltro', 'opcionesFiltro', 'elementos', 'sinResultados', 'conteo'],
  'casos-de-uso/destacado': ['imagenVideo', 'video', 'textoAlternativoVideo', 'insignia', 'titulo', 'textoInicio', 'textoEnlace', 'textoFin', 'accionPrincipal', 'accionSecundaria', 'insigniaVideo', 'detalleVideo', 'tituloResultados', 'resultados', 'archivoPdf'],
  'casos-de-uso/llamada': ['textoAlternativo', 'titulo', 'texto', 'accionPrincipal'],
  'casos-de-uso/metadatos': ['titulo', 'descripcion', 'palabrasClave'],
  'casos-de-uso/pestanas': ['rotulo', 'elementos'],
  'casos-de-uso/portada': ['textoAlternativo', 'antetitulo', 'lineasTitulo', 'entradilla', 'atributos', 'insignia', 'palabrasLaterales', 'miniaturas'],
  'casos-de-uso/testimonios': ['titulo', 'elementos'],
  'comunes/acciones': ['solicitarDemostracion', 'solicitarReunion', 'solicitarPropuesta', 'solicitarConsulta', 'conocerPlataforma', 'conocerMas', 'verMas', 'verCaso', 'verCasoCompleto', 'verSoluciones', 'leerMas', 'verVideo', 'verTodos', 'verTodas', 'contactanos', 'contactarAhora', 'descargarBrochure', 'descargarPdf', 'suscribirme', 'anterior', 'siguiente'],
  'comunes/busqueda': ['titulo', 'marcador', 'sinResultados', 'cerrar', 'atajo', 'resultados'],
  'comunes/idioma': ['rotulo', 'actual', 'opciones'],
  'comunes/marca': ['textoAlternativo', 'nombre', 'pais', 'producto', 'lemaProducto'],
  'comunes/navegacion': ['rotulo', 'abrirMenu', 'cerrarMenu', 'rotuloBusqueda', 'marcadorBusqueda', 'elementos'],
  'comunes/organizacion': ['nombreSitio', 'configuracionRegional', 'razonSocial', 'descripcion', 'ambitoAtendido', 'ciudadFundacion', 'correo', 'telefono', 'redSocial'],
  'comunes/pie': ['lema', 'columnas', 'contacto', 'redes', 'aviso', 'nombrePlataforma', 'lemaPlataforma', 'rotuloRedes', 'accionContacto', 'marcaGrande'],
  'comunes/visor': ['cerrar', 'nota'],
  'inicio/cambio': ['imagen', 'textoAlternativo', 'titulo', 'subtitulo', 'texto', 'insignia'],
  'inicio/casos': ['titulo', 'subtitulo', 'elementos'],
  'inicio/funcionamiento': ['titulo', 'subtitulo', 'pasos'],
  'inicio/llamada': ['textoAlternativo', 'titulo', 'texto', 'accionPrincipal', 'accionSecundaria', 'palabrasLaterales'],
  'inicio/metadatos': ['titulo', 'descripcion', 'palabrasClave', 'textoAlternativoPortada'],
  'inicio/portada': ['imagen', 'textoAlternativo', 'antetitulo', 'lineasTitulo', 'entradilla', 'accionPrincipal', 'accionSecundaria', 'atributos', 'palabrasLaterales', 'notaLateral'],
  'inicio/resultados': ['imagen', 'textoAlternativo', 'titulo', 'subtitulo', 'cita', 'cifras'],
  'inicio/sectores': ['titulo', 'subtitulo', 'elementos'],
  'inicio/soluciones': ['titulo', 'subtitulo', 'elementos'],
  'nosotros/alianzas': ['titulo', 'texto', 'accion', 'emblemas', 'certificaciones'],
  'nosotros/cifras': ['imagen', 'textoAlternativo', 'titulo', 'elementos', 'palabrasLaterales'],
  'nosotros/contacto': ['antetitulo', 'titulo', 'texto', 'campos', 'opcionesConsulta', 'consentimiento', 'errorConsentimiento', 'enviar', 'enviando', 'exito', 'exitoRemoto', 'fallo', 'asunto', 'canales'],
  'nosotros/equipo': ['imagen', 'textoAlternativo', 'titulo', 'subtitulo', 'texto', 'accion', 'complemento'],
  'nosotros/historia': ['imagen', 'textoAlternativo', 'titulo', 'subtitulo', 'texto', 'accion', 'palabrasSede', 'mision', 'vision'],
  'nosotros/llamada': ['textoAlternativo', 'titulo', 'texto', 'accionPrincipal', 'accionSecundaria', 'palabrasLaterales'],
  'nosotros/metadatos': ['titulo', 'descripcion', 'palabrasClave'],
  'nosotros/portada': ['textoAlternativo', 'antetitulo', 'lineasTitulo', 'entradilla', 'cita', 'palabrasLaterales', 'palabrasLateralesEco'],
  'nosotros/valores': ['imagen', 'titulo', 'subtitulo', 'elementos', 'cita', 'autorCita', 'textoAlternativoCita'],
  'recursos/articulos': ['titulo', 'subtitulo', 'verTodos', 'elementos', 'ambitos'],
  'recursos/documentos': ['titulo', 'subtitulo', 'verTodos', 'elementos', 'ambitos'],
  'recursos/llamada': ['textoAlternativo', 'titulo', 'texto', 'accionPrincipal', 'palabrasLaterales'],
  'recursos/metadatos': ['titulo', 'descripcion', 'palabrasClave'],
  'recursos/panel-lateral': ['boletin', 'destacado', 'eventos', 'noticias'],
  'recursos/pestanas': ['rotulo', 'marcadorBusqueda', 'elementos'],
  'recursos/portada': ['textoAlternativo', 'antetitulo', 'lineasTitulo', 'entradilla', 'atributos', 'palabrasLaterales'],
  'recursos/videos': ['titulo', 'subtitulo', 'verTodos', 'elementos', 'ambitos'],
  'sectores/beneficios': ['elementos'],
  'sectores/caso-exito': ['imagen', 'textoAlternativo', 'insignia', 'titulo', 'texto', 'accion', 'cifras', 'cita', 'autor', 'cargo'],
  'sectores/catalogo': ['titulo', 'subtitulo', 'nota', 'elementos'],
  'sectores/llamada': ['textoAlternativo', 'titulo', 'texto', 'accionPrincipal', 'palabrasLaterales'],
  'sectores/metadatos': ['titulo', 'descripcion', 'palabrasClave'],
  'sectores/portada': ['textoAlternativo', 'antetitulo', 'lineasTitulo', 'entradilla', 'atributos', 'insignia', 'palabrasLaterales'],
  'soluciones/catalogo': ['titulo', 'subtitulo', 'nota', 'elementos'],
  'soluciones/llamada': ['textoAlternativo', 'titulo', 'texto', 'accionPrincipal', 'accionSecundaria', 'cifras'],
  'soluciones/metadatos': ['titulo', 'descripcion', 'palabrasClave'],
  'soluciones/pestanas': ['rotulo', 'elementos'],
  'soluciones/portada': ['video', 'textoAlternativo', 'antetitulo', 'lineasTitulo', 'entradilla', 'accionPrincipal', 'palabrasLaterales', 'marcadores'],
  'tecnologia/componentes': ['titulo', 'subtitulo', 'nota', 'elementos'],
  'tecnologia/llamada': ['textoAlternativo', 'titulo', 'texto', 'accionPrincipal', 'accionSecundaria', 'cifras'],
  'tecnologia/metadatos': ['titulo', 'descripcion', 'palabrasClave'],
  'tecnologia/panorama': ['titulo', 'subtitulo', 'texto', 'accion', 'esquema'],
  'tecnologia/pestanas': ['rotulo', 'elementos'],
  'tecnologia/portada': ['video', 'textoAlternativo', 'antetitulo', 'lineasTitulo', 'entradilla', 'accionPrincipal', 'atributos', 'palabrasLaterales'],
};

/** Ordena los campos de un trozo segun la lista de arriba. */
export const ordenarCampos = (claveBloque: string, campos: string[]): string[] => {
  const preferido = ordenDeCampos[claveBloque];
  if (!preferido) return campos;
  const posicion = new Map(preferido.map((c, i) => [c, i]));
  return [...campos].sort((a, b) => {
    const pa = posicion.has(a) ? (posicion.get(a) as number) : Number.MAX_SAFE_INTEGER;
    const pb = posicion.has(b) ? (posicion.get(b) as number) : Number.MAX_SAFE_INTEGER;
    if (pa !== pb) return pa - pb;
    return campos.indexOf(a) - campos.indexOf(b);
  });
};
