export interface ErrorAplicacion {
  codigo: string;
  mensaje: string;
}

export interface SobreApi<T> {
  exito: boolean;
  datos: T;
  error: ErrorAplicacion | null;
}
