# Codeplex CMS — Panel de gestión de blogs

Panel React/TypeScript para gestionar posts, sitios, autores, categorías, etiquetas, medios y gobierno de acceso. Consume la API del backend Go que vive en `radio-gods.duckdns.org/cms/api`.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind 3** con tokens custom (paleta editorial: tinta, papel, lienzo, oliva, ámbar, cinabrio)
- **TanStack Query** para estado servidor
- **React Router 6** para navegación
- Arquitectura DDD (capacidades / plataforma / compartido)

## Setup local

```bash
cp .env.example .env
npm install
npm run dev
```

Por defecto el panel apunta a `https://radio-gods.duckdns.org/cms/api`. Para apuntar a un backend local, en `.env` cambia `VITE_URL_BASE_API=http://localhost:8080/api`.

## Despliegue en Vercel

1. Conectar este repo a Vercel
2. Vercel autodetecta Vite y usa `npm run construir` (o `npm run build`)
3. Configurar variables de entorno en Vercel:

| Variable | Ejemplo |
|---|---|
| `VITE_URL_BASE_API` | `https://radio-gods.duckdns.org/cms/api` |
| `VITE_NOMBRE_PRODUCTO` | `Codeplex CMS` |
| `VITE_AMBIENTE` | `produccion` |
| `VITE_SITIOS_PUBLICOS_JSON` | `[{"codigo":"DGDWEB","urlProduccion":"https://dgd-enterprise.vercel.app","rutaBlog":"/es/blog"}]` |

## Estructura

```
src/
├── aplicacion/        entrada, enrutamiento, providers, estilos
├── capacidades/       dominios funcionales (identidad, organización, contenido, gobierno)
├── compartido/        primitivas UI, helpers, biblioteca de hooks, tipos
├── integraciones/     cliente HTTP
└── plataforma/        layouts, contexto sesión/sitio activo, sistema notificaciones
```

## Convenciones

- Lenguaje ubicuo en español
- Sin comentarios — los nombres deben explicar
- DRY con primitivas y hooks reutilizables
- Cada archivo una responsabilidad clara
