import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  // Carpeta bajo la que se sirve el panel. Por defecto la raiz; en el
  // servidor cuelga de /cms/ para compartir dominio con la API, que es lo
  // que permite que la vista previa se incruste sin configurar nada mas.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@aplicacion': path.resolve(import.meta.dirname, 'src/aplicacion'),
      '@capacidades': path.resolve(import.meta.dirname, 'src/capacidades'),
      '@compartido': path.resolve(import.meta.dirname, 'src/compartido'),
      '@integraciones': path.resolve(import.meta.dirname, 'src/integraciones'),
      '@plataforma': path.resolve(import.meta.dirname, 'src/plataforma'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
