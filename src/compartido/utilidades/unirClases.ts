type Clase = string | number | false | null | undefined;

export const unirClases = (...clases: Clase[]): string => clases.filter(Boolean).join(' ');
