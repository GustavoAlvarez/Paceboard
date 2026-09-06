# Paceboard

MVP mobile-first para publicar, explorar y comparar resultados de carreras.

## Stack

- Next.js (App Router) + React + TypeScript
- CSS propio responsive, sin dependencia de un framework visual
- Papa Parse para importación robusta de CSV en el navegador
- `localStorage` como persistencia deliberadamente ligera para la validación del MVP

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Importación CSV

El importador acepta encabezados en español o inglés. Requiere `nombre` y `tiempo`; reconoce opcionalmente `lugar`, `dorsal`, `género`, `edad`, `categoría`, `ciudad` y `ritmo`.

## Evolución recomendada

Para producción multiusuario, reemplazar `localStorage` por Postgres (Neon o Supabase), añadir autenticación de organizadores y almacenar los CSV originales en Vercel Blob. La interfaz y el modelo de datos de este MVP ya separan esas responsabilidades.
