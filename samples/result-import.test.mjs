import test from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { readResults, seconds, distanceLabel } from "../app/components/result-import.ts";

test("CSV de Iztapopo: encabezados, BOM, separador y ceros del dorsal", async () => {
  const rows = await readResults(new File(["\uFEFFBib;ParticipantName;Lug Cat;CategoryName;Oficial\n007;Ejemplo;1;Gravel Femenil;04:39:55"], "categoria.csv"));
  assert.equal(rows[0].bib, "007");
  assert.equal(rows[0].participantname, "Ejemplo");
  assert.equal(seconds(rows[0].oficial), 16795);
});
test("Excel: omite portadas, reconoce encabezados y convierte tiempos numéricos", async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.addWorksheet("Portada").addRow(["Resultados"]);
  const sheet = workbook.addWorksheet("Categoría");
  sheet.addRow(["Iztapopo"]);
  sheet.addRow(["Bib", "ParticipantName", "Lug Cat", "CategoryName", "Oficial"]);
  sheet.addRow(["001", "Ejemplo A", 1, "MTB", 16795 / 86400]);
  sheet.getCell("E3").numFmt = "[h]:mm:ss";
  const second = workbook.addWorksheet("Otra categoría");
  second.addRow(["Nombre", "Tiempo"]);
  second.addRow(["Ejemplo B", "05:12:30"]);
  const rows = await readResults(new File([await workbook.xlsx.writeBuffer()], "categorias.xlsx"));
  assert.equal(rows.length, 2);
  assert.equal(rows[0].oficial, "04:39:55");
  assert.equal(rows[1].tiempo, "05:12:30");
});
test("rechaza archivos sin encabezados y formatos no admitidos", async () => {
  await assert.rejects(readResults(new File(["Nombre\nEjemplo"], "incompleto.csv")), /columnas/);
  await assert.rejects(readResults(new File(["x"], "antiguo.xls")), /xlsx/);
  assert.equal(seconds("04:80:00"), Infinity);
  assert.equal(seconds("DNF"), Infinity);
  assert.equal(distanceLabel("80KM"), "80 km");
});
