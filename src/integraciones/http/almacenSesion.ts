const CLAVE_TOKEN = 'panel.token';
const CLAVE_REFRESH = 'panel.refresh';
const CLAVE_USUARIO = 'panel.usuario';

export const guardarToken = (token: string): void => {
  localStorage.setItem(CLAVE_TOKEN, token);
};

export const obtenerToken = (): string | null => localStorage.getItem(CLAVE_TOKEN);

export const guardarRefresh = (refresh: string): void => {
  localStorage.setItem(CLAVE_REFRESH, refresh);
};

export const obtenerRefresh = (): string | null => localStorage.getItem(CLAVE_REFRESH);

export const guardarUsuarioSerializado = (usuario: string): void => {
  localStorage.setItem(CLAVE_USUARIO, usuario);
};

export const obtenerUsuarioSerializado = (): string | null => localStorage.getItem(CLAVE_USUARIO);

export const olvidarSesion = (): void => {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_REFRESH);
  localStorage.removeItem(CLAVE_USUARIO);
};
