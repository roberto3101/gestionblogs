import type { Config } from 'tailwindcss';

const configuracion: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lienzo: 'rgb(var(--color-lienzo) / <alpha-value>)',
        papel: 'rgb(var(--color-papel) / <alpha-value>)',
        tinta: 'rgb(var(--color-tinta) / <alpha-value>)',
        grafito: 'rgb(var(--color-grafito) / <alpha-value>)',
        humo: 'rgb(var(--color-humo) / <alpha-value>)',
        ceniza: 'rgb(var(--color-ceniza) / <alpha-value>)',
        oliva: 'rgb(var(--color-oliva) / <alpha-value>)',
        olivaSuave: 'rgb(var(--color-oliva-suave) / <alpha-value>)',
        ambar: 'rgb(var(--color-ambar) / <alpha-value>)',
        cinabrio: 'rgb(var(--color-cinabrio) / <alpha-value>)',
      },
      fontFamily: {
        cuerpo: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        editorial: ['"Source Serif 4"', 'Charter', 'Georgia', 'serif'],
        codigo: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        susurro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
        nota: ['0.8125rem', { lineHeight: '1.25rem' }],
      },
      borderRadius: {
        suave: '6px',
        marco: '10px',
        seccion: '14px',
      },
      boxShadow: {
        contorno: '0 0 0 1px rgb(var(--color-ceniza) / 1)',
        levantado: '0 1px 0 rgb(var(--color-ceniza)), 0 4px 14px -8px rgb(0 0 0 / 0.08)',
      },
      maxWidth: {
        lectura: '68ch',
      },
    },
  },
};

export default configuracion;
