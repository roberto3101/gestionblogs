import type { Identificador } from '@compartido/tipos/identificador';

/** Consulta recibida desde el formulario de contacto de un sitio. */
export interface MensajeContacto {
  id: Identificador;
  sitio_id: Identificador;
  nombre: string;
  correo: string;
  empresa: string;
  telefono: string;
  consulta: string;
  cuerpo: string;
  idioma: string;
  origen: string;
  estado: 'NUEVO' | 'LEIDO' | 'ATENDIDO' | 'DESCARTADO';
  /** Si el aviso por correo salio o no. El mensaje se guarda igualmente. */
  estado_entrega: 'PENDIENTE' | 'ENVIADO' | 'FALLIDO' | 'SIN_CORREO';
  detalle_entrega: string;
  creado_en: string;
  atendido_en: string | null;
}

export interface Suscriptor {
  id: Identificador;
  correo: string;
  idioma: string;
  origen: string;
  estado: string;
  creado_en: string;
}
