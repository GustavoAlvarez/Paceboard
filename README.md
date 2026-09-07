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

## Archivos por distancia

En el panel de organizador, escribe una distancia (por ejemplo, 80 km) y selecciona varios CSV o Excel .xlsx. Cada carga añade archivos al borrador sin reemplazar los anteriores. Repite la carga para otras distancias. Máximo 10 MB por archivo.

La categoría se toma de las filas; si no existe, se utiliza el nombre del archivo o la categoría de respaldo indicada. Puedes editar la distancia y categoría de cada archivo o retirarlo del borrador. Publicar guarda el conjunto en el navegador. Los archivos originales no se conservan; se guardan sus metadatos y resultados.

Reconoce encabezados en español/inglés, incluidos los de Iztapopo: `Bib`, `ParticipantName`, `Lug Cat`, `CategoryName` y `Oficial`. Lee hojas con resultados, omite portadas y convierte tiempos de Excel. Informa filas inválidas y evita cargar nuevamente el mismo nombre de archivo dentro de una distancia.

La vista pública permite filtrar por distancia, categoría y género. La posición conserva el lugar informado en cada archivo de categoría; no representa una clasificación general entre distintas distancias. La comparación solo permite participantes con tiempo válido de la misma distancia.

Pruebas de importación (Node 22.18+):

```bash
node --test samples/result-import.test.mjs
```

Los CSV en `samples/gravel-femenil.csv` y `samples/mtb-varonil.csv` contienen participantes ficticios para probar cargas acumulativas.

## Evolución recomendada

Para producción multiusuario, reemplazar `localStorage` por Postgres (Neon o Supabase), añadir autenticación de organizadores y almacenar los CSV originales en Vercel Blob. La interfaz y el modelo de datos de este MVP ya separan esas responsabilidades.
