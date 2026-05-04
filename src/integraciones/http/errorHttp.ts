export class ErrorHttp extends Error {
  readonly estado: number;
  readonly codigo: string;

  constructor(estado: number, codigo: string, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.estado = estado;
    this.codigo = codigo;
  }
}

export const esErrorAutenticacion = (error: unknown): boolean =>
  error instanceof ErrorHttp && error.estado === 401;

export const esErrorAutorizacion = (error: unknown): boolean =>
  error instanceof ErrorHttp && error.estado === 403;
