const CLAVE_DISPOSITIVO = 'panel.dispositivo';

export const obtenerIdentificadorDispositivo = (): string => {
  const guardado = localStorage.getItem(CLAVE_DISPOSITIVO);
  if (guardado) return guardado;
  const nuevo = `panel-${crypto.randomUUID()}`;
  localStorage.setItem(CLAVE_DISPOSITIVO, nuevo);
  return nuevo;
};
