import Papa from "papaparse";

export type ResultFile = { id: string; name: string; distance: string; category: string; count: number };
export const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function distanceLabel(value: string) {
  return value.trim().replace(/^(\d+(?:[.,]\d+)?)\s*(?:km)?$/i, (_, n: string) => `${Number(n.replace(",", "."))} km`);
}
export function seconds(value: string) {
  if (!/^\d{1,3}:\d{2}(?::\d{2})?$/.test(value.trim())) return Infinity;
  const parts = value.split(":").map(Number);
  if (parts.slice(1).some(n => n > 59)) return Infinity;
  return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
}
const nameHeaders = ["nombre", "name", "corredor", "participante", "nombre completo", "competidor", "participantname"];
const timeHeaders = ["tiempo", "time", "tiempo oficial", "resultado", "tiempo total", "total", "tiempo chip", "oficial"];
export function tableRows(table: string[][]): Record<string, string>[] {
  const header = table.findIndex(row => row.some(cell => nameHeaders.includes(normalize(cell))) && row.some(cell => timeHeaders.includes(normalize(cell))));
  if (header < 0) throw new Error("No se encontraron las columnas nombre y tiempo.");
  const keys = table[header].map(normalize);
  return table.slice(header + 1).filter(row => row.some(cell => cell.trim())).map(row => Object.fromEntries(keys.map((key, i) => [key, row[i] || ""])));
}
export async function readResults(file: File): Promise<Record<string, string>[]> {
  if (file.size > 10 * 1024 * 1024) throw new Error("El archivo supera los 10 MB.");
  if (/\.csv$/i.test(file.name)) {
    const result = Papa.parse<string[]>(await file.text(), { skipEmptyLines: true });
    if (result.errors.some(error => error.code === "MissingQuotes")) throw new Error("El CSV contiene comillas sin cerrar.");
    return tableRows(result.data);
  }
  if (!/\.xlsx$/i.test(file.name)) throw new Error("Usa archivos CSV o Excel .xlsx.");
  const { default: ExcelJS } = await import("exceljs");
  const { Workbook } = ExcelJS;
  const workbook = new Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const tables: Record<string, string>[][] = [];
  for (const sheet of workbook.worksheets) {
    const table: string[][] = [];
    sheet.eachRow(row => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell, index) => {
        let value = cell.value;
        if (value && typeof value === "object" && "result" in value) value = value.result ?? null;
        if (value instanceof Date) {
          cells[index - 1] = [value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds()].map(n => String(n).padStart(2, "0")).join(":");
        } else if (typeof value === "number" && /[hs]/i.test(cell.numFmt)) {
          const total = Math.round(value * 86400);
          cells[index - 1] = [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60].map(n => String(n).padStart(2, "0")).join(":");
        } else cells[index - 1] = cell.text;
      });
      table.push(Array.from({ length: row.cellCount }, (_, index) => cells[index] || ""));
    });
    try { tables.push(tableRows(table)); } catch { /* Ignore cover sheets without result headers. */ }
  }
  if (!tables.length) throw new Error("No se encontraron resultados en las hojas del Excel.");
  return tables.flat();
}
