"use client";

import { distanceLabel, readResults, seconds, type ResultFile } from "./result-import";
import PaceIcon from "./pace-icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileSpreadsheet,
  Flag,
  Gauge,
  LayoutDashboard,
  MapPin,
  Medal,
  Menu,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Runner = {
  distance?: string;
  sourceId?: string;
  id: string;
  place: number;
  bib: string;
  name: string;
  gender: "F" | "M";
  age: number;
  category: string;
  city: string;
  time: string;
  pace: string;
};

type EventData = {
  files?: ResultFile[];
  name: string;
  date: string;
  location: string;
  distance: string;
  runners: Runner[];
};

const demoRunners: Runner[] = [
  { id: "1", place: 1, bib: "1042", name: "Ricardo Mejía", gender: "M", age: 28, category: "Libre Varonil", city: "CDMX", time: "01:34:18", pace: "4:29" },
  { id: "2", place: 2, bib: "0871", name: "Diego Hernández", gender: "M", age: 31, category: "Libre Varonil", city: "Puebla", time: "01:36:42", pace: "4:36" },
  { id: "3", place: 3, bib: "0624", name: "Sofía Ramírez", gender: "F", age: 27, category: "Libre Femenil", city: "Toluca", time: "01:39:07", pace: "4:43" },
  { id: "4", place: 4, bib: "1108", name: "Carlos Mendoza", gender: "M", age: 36, category: "Máster Varonil", city: "CDMX", time: "01:42:33", pace: "4:53" },
  { id: "5", place: 5, bib: "0319", name: "Mariana Torres", gender: "F", age: 32, category: "Libre Femenil", city: "Cuernavaca", time: "01:44:21", pace: "4:58" },
  { id: "6", place: 6, bib: "0945", name: "Jorge Castillo", gender: "M", age: 42, category: "Máster Varonil", city: "Puebla", time: "01:46:08", pace: "5:03" },
  { id: "7", place: 7, bib: "0712", name: "Fernanda López", gender: "F", age: 39, category: "Máster Femenil", city: "Tlaxcala", time: "01:48:36", pace: "5:10" },
  { id: "8", place: 8, bib: "0208", name: "Andrés Luna", gender: "M", age: 25, category: "Libre Varonil", city: "Texcoco", time: "01:50:12", pace: "5:15" },
  { id: "9", place: 9, bib: "0533", name: "Ana Paula Díaz", gender: "F", age: 29, category: "Libre Femenil", city: "CDMX", time: "01:52:44", pace: "5:22" },
  { id: "10", place: 10, bib: "1284", name: "Miguel Ángel Ruiz", gender: "M", age: 47, category: "Veteranos", city: "Toluca", time: "01:55:09", pace: "5:29" },
  { id: "11", place: 11, bib: "0417", name: "Gabriela Soto", gender: "F", age: 43, category: "Máster Femenil", city: "Puebla", time: "01:57:38", pace: "5:36" },
  { id: "12", place: 12, bib: "0760", name: "Roberto Silva", gender: "M", age: 52, category: "Veteranos", city: "CDMX", time: "02:01:16", pace: "5:46" },
];

const defaultEvent: EventData = {
  name: "Iztapopo Trail 2026",
  date: "23 de agosto, 2026",
  location: "Paso de Cortés, Puebla",
  distance: "21 km",
  runners: demoRunners,
};

function timeToSeconds(time: string) {
  return seconds(time);
}

function difference(a: string, b: string) {
  const value = Math.abs(timeToSeconds(a) - timeToSeconds(b));
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function normalizeRow(row: Record<string, string>, index: number, fallbackCategory: string): Runner | null {
  const entries = Object.entries(row).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")] = String(value ?? "").trim();
    return acc;
  }, {});
  const get = (...keys: string[]) => keys.map((key) => entries[key]).find(Boolean) ?? "";
  const name = get("nombre", "name", "corredor", "participante", "nombre completo", "competidor", "participantname");
  const time = get("tiempo", "time", "tiempo oficial", "resultado", "tiempo total", "total", "tiempo chip", "oficial");
  if (!name || !time || (!Number.isFinite(seconds(time)) && !/^(DNF|DNS|DSQ)$/i.test(time))) return null;
  const genderRaw = get("genero", "sexo", "gender").toUpperCase();
  const rowCategory = get("categoria", "category", "categoryname") || fallbackCategory;
  return {
    id: `imported-${Date.now()}-${index}`,
    place: Number(get("lugar", "posicion", "place", "rank", "lug cat")) || index + 1,
    bib: get("numero", "dorsal", "bib", "numero de corredor") || String(index + 1).padStart(4, "0"),
    name,
    gender: (genderRaw || rowCategory.toUpperCase()).includes("FEM") || genderRaw === "F" ? "F" : "M",
    age: Number(get("edad", "age")) || 0,
    category: rowCategory,
    city: get("ciudad", "city", "procedencia", "equipo") || "—",
    time,
    pace: get("ritmo", "pace") || "—",
  };
}

export default function EventWorkspace({ view }: { view: "results" | "admin" }) {
  const router = useRouter();
  const setView = (next: "results" | "admin") => router.push(next === "admin" ? "/organizador" : "/resultados");
  const [event, setEvent] = useState<EventData>(defaultEvent);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [distance, setDistance] = useState("Todas");
  const [gender, setGender] = useState("Todos");
  const [sort, setSort] = useState<"place" | "time" | "name">("place");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [draft, setDraft] = useState(defaultEvent);
  const [importDistance, setImportDistance] = useState("80 km");
  const [importCategory, setImportCategory] = useState("");
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("paceboard-event");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as EventData;
        parsed.runners = parsed.runners.map(runner => ({ ...runner, distance: runner.distance || parsed.distance }));
        const frame = window.requestAnimationFrame(() => {
          setEvent(parsed);
          setDraft(parsed);
        });
        return () => window.cancelAnimationFrame(frame);
      } catch { /* demo data remains available */ }
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const distances = useMemo(() => Array.from(new Set(event.runners.map(runner => runner.distance || event.distance))), [event]);
  const categories = useMemo(() => ["Todas", ...Array.from(new Set(event.runners.filter(runner => distance === "Todas" || (runner.distance || event.distance) === distance).map((runner) => runner.category)))], [event, distance]);
  const results = useMemo(() => {
    const search = query.trim().toLowerCase();
    return event.runners
      .filter(runner => distance === "Todas" || (runner.distance || event.distance) === distance)
      .filter((runner) => !search || `${runner.name} ${runner.bib} ${runner.city}`.toLowerCase().includes(search))
      .filter((runner) => category === "Todas" || runner.category === category)
      .filter((runner) => gender === "Todos" || runner.gender === gender)
      .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "time" ? timeToSeconds(a.time) - timeToSeconds(b.time) : a.place - b.place);
  }, [event, query, category, gender, sort, distance]);

  const selectedRunners = selected.map((id) => event.runners.find((runner) => runner.id === id)).filter(Boolean) as Runner[];

  function toggleRunner(id: string) {
    const runner = event.runners.find(item => item.id === id);
    if (!selected.includes(id) && selectedRunners.some(item => (item.distance || event.distance) !== (runner?.distance || event.distance))) {
      setToast("Compara participantes de la misma distancia.");
      return;
    }
    if (runner && !Number.isFinite(seconds(runner.time))) { setToast("Este participante no tiene un tiempo de llegada."); return; }
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current);
    if (!selected.includes(id) && selected.length >= 4) setToast("Puedes comparar hasta 4 corredores");
  }

  async function handleFiles(files: File[]) {
    if (importing || !files.length) return;
    const targetDistance = distanceLabel(importDistance);
    if (!targetDistance) { setToast("Indica la distancia antes de cargar archivos."); return; }
    setImporting(true);
    const errors: string[] = [];
    const additions: Runner[] = [];
    const sources: ResultFile[] = [];
    for (const file of files) {
      try {
        if ([...(draft.files || []), ...sources].some(source => source.name === file.name && source.distance === targetDistance)) throw new Error("Ya está cargado en esta distancia. Retíralo antes de reemplazarlo.");
        const data = await readResults(file);
        const fileCategory = importCategory.trim() || file.name.replace(/\.(csv|xlsx)$/i, "").replace(/_/g, " ");
        const sourceId = crypto.randomUUID();
        const parsed = data.map((row, index) => {
          const runner = normalizeRow(row, index, fileCategory);
          return runner ? { ...runner, id: `${sourceId}-${index}`, distance: targetDistance, sourceId } : null;
        }).filter(Boolean) as Runner[];
        if (!parsed.length) throw new Error("No hay filas válidas; revisa nombre y tiempo (HH:MM:SS, DNF, DNS o DSQ).");
        if (parsed.length < data.length) errors.push(`${file.name}: ${data.length - parsed.length} filas omitidas sin nombre o tiempo válido.`);
        additions.push(...parsed);
        const parsedCategories = Array.from(new Set(parsed.map(runner => runner.category)));
        sources.push({ id: sourceId, name: file.name, distance: targetDistance, category: parsedCategories.length === 1 ? parsedCategories[0] : fileCategory, count: parsed.length });
      } catch (error) { errors.push(`${file.name}: ${error instanceof Error ? error.message : "No se pudo leer el archivo."}`); }
    }
    setDraft(current => ({ ...current, runners: [...current.runners.map(runner => ({ ...runner, distance: runner.distance || current.distance })), ...additions], files: [...(current.files || []), ...sources] }));
    setImportErrors(errors);
    setImporting(false);
    if (inputRef.current) inputRef.current.value = "";
    setToast(`${sources.length} archivos añadidos · ${additions.length} resultados`);
  }

  function publish() {
    if (importing) return;
    if ((draft.files || []).some(file => !file.distance.trim() || !file.category.trim())) { setToast("Completa la distancia y categoría de cada archivo."); return; }
    try { localStorage.setItem("paceboard-event", JSON.stringify(draft)); }
    catch { setToast("No se pudo guardar. El almacenamiento del navegador está lleno o bloqueado."); return; }
    setEvent(draft);
    setView("results");
    setToast("Evento publicado correctamente");
  }

  if (view === "admin") {
    return (
      <main className="admin-shell">
        {toast && <Toast text={toast} />}
        <header className="admin-topbar">
          <Link className="brand-button home-link" href="/" aria-label="Paceboard, inicio"><Brand /></Link>
          <div className="admin-actions">
            <span className="autosave">Panel de ejemplo</span>
            <button className="button secondary" onClick={() => setView("results")}>Cancelar</button>
            <button className="button primary" disabled={importing} onClick={publish}>Publicar evento</button>
          </div>
        </header>
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <p className="eyebrow">CONFIGURACIÓN</p>
            <nav>
              <a className="active" href="#general"><LayoutDashboard size={18} /> Información general</a>
              <a href="#results"><FileSpreadsheet size={18} /> Archivos de resultados</a>
              <a href="#appearance"><Sparkles size={18} /> Apariencia</a>
              <a href="#settings"><Settings size={18} /> Ajustes</a>
            </nav>
            <div className="help-card"><CircleHelp size={20} /><div><strong>¿Necesitas ayuda?</strong><span>Consulta la guía de importación</span></div><ChevronRight size={17} /></div>
          </aside>
          <section className="admin-content">
            <button className="back-mobile" onClick={() => setView("results")}><ArrowLeft size={18} /> Volver a resultados</button>
            <section className="published-event" aria-label="Resultados publicados">
              <div><p className="eyebrow green">RESULTADOS PUBLICADOS</p><h2>{event.name}</h2><p>{event.runners.length} tiempos · {categories.length - 1} categorías · {distances.join(" / ")}</p></div>
              <Link href="/resultados" className="button primary">Ver todos los tiempos <ChevronRight size={16} /></Link>
            </section>
            <div className="admin-heading"><div><span className="status-dot">Borrador</span><h1>Configura tu evento</h1><p>Agrega la información y los archivos de resultados de la carrera.</p></div><div className="step-count">Paso 1 de 2</div></div>
            <div className="form-card" id="general">
              <div className="section-heading"><span>01</span><div><h2>Información general</h2><p>Estos datos se mostrarán en la página pública.</p></div></div>
              <div className="form-grid">
                <label className="wide">Nombre del evento<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
                <label>Fecha del evento<div className="input-icon"><CalendarDays size={17} /><input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></div></label>
                <label>Distancia de resultados anteriores<div className="input-icon"><Flag size={17} /><input value={draft.distance} onChange={(e) => setDraft({ ...draft, distance: e.target.value, runners: draft.runners.map(runner => !runner.sourceId ? { ...runner, distance: e.target.value } : runner) })} /></div></label>
                <label className="wide">Ubicación<div className="input-icon"><MapPin size={17} /><input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></div></label>
              </div>
            </div>
            <div className="form-card" id="results">
              <div className="section-heading"><span>02</span><div><h2>Archivos por distancia</h2><p>Elige una distancia y añade todos sus archivos de categorías. Puedes repetirlo para otras distancias.</p></div></div>
              <div className="import-fields">
                <label>Distancia de esta carga<input value={importDistance} onChange={e => setImportDistance(e.target.value)} placeholder="Ej. 80 km" disabled={importing} /></label>
                <label>Categoría si no aparece en el archivo<input value={importCategory} onChange={e => setImportCategory(e.target.value)} placeholder="Automática: nombre de cada archivo" disabled={importing} /></label>
              </div>
              <div className="upload-zone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void handleFiles(Array.from(e.dataTransfer.files)); }}>
                <input ref={inputRef} type="file" multiple accept=".csv,.xlsx" hidden onChange={(e) => void handleFiles(Array.from(e.target.files || []))} />
                <div className="upload-icon"><UploadCloud size={25} /></div>
                <strong>{importing ? "Leyendo archivos…" : "Arrastra los archivos de esta distancia"}</strong>
                <span>CSV o Excel (.xlsx) · máximo 10 MB por archivo</span>
                <button className="button secondary" type="button" disabled={importing} onClick={() => inputRef.current?.click()}>Seleccionar archivos</button>
              </div>
              {importErrors.length > 0 && <div className="import-errors" role="status"><strong>Revisa la importación</strong><ul>{importErrors.map((error, i) => <li key={i}>{error}</li>)}</ul></div>}
              <div className="import-groups">
                {Array.from(new Set((draft.files || []).map(file => file.distance))).map(group => <section key={group}>
                  <h3>{group} <small>{draft.files!.filter(file => file.distance === group).length} archivos</small></h3>
                  {draft.files!.filter(file => file.distance === group).map(file => <article className="import-file" key={file.id}>
                    <div className="import-file-title"><FileSpreadsheet size={19} /><strong>{file.name}</strong><span>{file.count} tiempos</span></div>
                    <div className="import-fields">
                      <label>Distancia<input aria-label={`Distancia de ${file.name}`} defaultValue={file.distance} disabled={importing} onBlur={e => {
                        const value = distanceLabel(e.target.value) || file.distance;
                        setDraft(current => ({ ...current, files: current.files?.map(item => item.id === file.id ? { ...item, distance: value } : item), runners: current.runners.map(runner => runner.sourceId === file.id ? { ...runner, distance: value } : runner) }));
                      }} /></label>
                      <label>Categoría<input aria-label={`Categoría de ${file.name}`} value={file.category} disabled={importing} onChange={e => {
                        const value = e.target.value;
                        setDraft(current => ({ ...current, files: current.files?.map(item => item.id === file.id ? { ...item, category: value } : item), runners: current.runners.map(runner => runner.sourceId === file.id ? { ...runner, category: value } : runner) }));
                      }} /></label>
                    </div>
                    <button type="button" disabled={importing} onClick={() => setDraft(current => ({ ...current, files: current.files?.filter(item => item.id !== file.id), runners: current.runners.filter(runner => runner.sourceId !== file.id) }))}>Retirar del borrador</button>
                  </article>)}
                </section>)}
                {draft.runners.some(runner => !runner.sourceId) && <div className="legacy-results"><span>{draft.runners.filter(runner => !runner.sourceId).length} resultados anteriores / de ejemplo</span><button disabled={importing} onClick={() => setDraft(current => ({ ...current, runners: current.runners.filter(runner => runner.sourceId) }))}>Retirar del borrador</button></div>}
              </div>
              <div className="format-note"><FileSpreadsheet size={20} /><div><strong>Formato esperado</strong><p>El archivo debe incluir al menos las columnas <code>nombre</code> y <code>tiempo</code>. También reconoce dorsal, lugar, género, edad, ciudad, categoría y ritmo.</p></div></div>
            </div>
            <div className="mobile-publish"><button className="button primary" onClick={publish}>Publicar evento</button></div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main>
      {toast && <Toast text={toast} />}
      <header className="site-header">
        <Link href="/" className="home-link" aria-label="Paceboard, inicio"><Brand /></Link>
        <nav className={menuOpen ? "open" : ""}>
          <a className="active" href="#results">Resultados</a>
          <a href="#event">El evento</a>
          <a href="#help">Ayuda</a>
          <button className="organizer-link" onClick={() => { setView("admin"); setMenuOpen(false); }}><Settings size={16} /> Panel organizador</button>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="event-hero" id="event">
        <div className="topography" />
        <div className="hero-content">
          <div className="event-kicker"><span>RESULTADOS OFICIALES</span><span className="verified"><Check size={13} /> Verificados</span></div>
          <h1>{event.name}</h1>
          <div className="event-meta"><span><CalendarDays size={17} />{event.date}</span><span><MapPin size={17} />{event.location}</span><span><Flag size={17} />{distances.join(" / ")}</span></div>
        </div>
        <div className="hero-stat"><span>Participantes</span><strong>{event.runners.length.toLocaleString("es-MX")}</strong><Users size={22} /></div>
      </section>

      <section className="results-section" id="results">
        <label className="distance-picker">Distancia<select value={distance} onChange={e => { setDistance(e.target.value); setCategory("Todas"); setSelected([]); }}><option value="Todas">Todas las distancias</option>{distances.map(item => <option key={item}>{item}</option>)}</select></label>
        <p className="distance-note">La posición corresponde al archivo de categoría de cada distancia. Compara tiempos dentro de una misma distancia.</p>
        <div className="results-heading"><div><p className="eyebrow green">RESULTADOS POR CATEGORÍA</p><h2>Encuentra tu resultado</h2><p>Busca por nombre o número de corredor y filtra por categoría.</p></div><div className="result-count"><strong>{results.length}</strong><span>resultados</span></div></div>
        <div className="toolbar">
          <label className="search-field"><Search size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar nombre o número..."/><kbd>⌘ K</kbd></label>
          <button className={`filter-button ${category !== "Todas" || gender !== "Todos" ? "has-filter" : ""}`} onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18} /> Filtros <span>{(category !== "Todas" ? 1 : 0) + (gender !== "Todos" ? 1 : 0) || ""}</span></button>
          <label className="desktop-select"><select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}><option value="place">Ordenar: Posición</option><option value="time">Ordenar: Tiempo</option><option value="name">Ordenar: Nombre</option></select><ChevronDown size={16} /></label>
        </div>
        {filtersOpen && <div className="filter-panel"><label>Categoría<select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Género<select value={gender} onChange={(e) => setGender(e.target.value)}><option>Todos</option><option value="F">Femenil</option><option value="M">Varonil</option></select></label><label>Ordenar por<select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}><option value="place">Posición</option><option value="time">Tiempo</option><option value="name">Nombre</option></select></label><button onClick={() => { setCategory("Todas"); setGender("Todos"); }}>Limpiar filtros</button></div>}
        <div className="category-pills">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>

        {results.length ? <>
          <div className="results-table-wrap">
            <table className="results-table"><thead><tr><th>POS.</th><th>PARTICIPANTE</th><th>CATEGORÍA</th><th>PROCEDENCIA</th><th>RITMO</th><th>TIEMPO OFICIAL</th><th></th></tr></thead><tbody>
              {results.map((runner) => <tr key={runner.id} className={selected.includes(runner.id) ? "selected" : ""}><td><Place place={runner.place} /></td><td><div className="runner-cell"><Avatar runner={runner} /><div><strong>{runner.name}</strong><span>#{runner.bib} · {runner.gender}, {runner.age || "—"} años</span></div></div></td><td><span className="category-tag">{runner.category}</span><span className="distance-badge">{runner.distance || event.distance}</span></td><td>{runner.city}</td><td><span className="pace"><Gauge size={15} />{runner.pace} /km</span></td><td><strong className="official-time">{runner.time}</strong></td><td><button className="compare-check" onClick={() => toggleRunner(runner.id)} aria-label="Seleccionar para comparar">{selected.includes(runner.id) && <Check size={14} />}</button></td></tr>)}
            </tbody></table>
          </div>
          <div className="mobile-results">
            {results.map((runner) => <article className={`runner-card ${selected.includes(runner.id) ? "selected" : ""}`} key={runner.id} onClick={() => toggleRunner(runner.id)}><div className="card-main"><Place place={runner.place} /><Avatar runner={runner} /><div className="card-name"><strong>{runner.name}</strong><span>#{runner.bib} · {runner.distance || event.distance} · {runner.category}</span></div><div className="card-time"><strong>{runner.time}</strong><span>{runner.pace} /km</span></div></div><div className="card-details"><span><MapPin size={13} />{runner.city}</span><span>{runner.gender === "F" ? "Femenil" : "Varonil"} · {runner.age || "—"} años</span>{selected.includes(runner.id) && <span className="selected-label"><Check size={12} /> Seleccionado</span>}</div></article>)}
          </div>
        </> : <div className="empty-state"><Search size={30} /><h3>No encontramos resultados</h3><p>Prueba con otro nombre, número o filtro.</p><button onClick={() => { setQuery(""); setCategory("Todas"); setGender("Todos"); }}>Limpiar búsqueda</button></div>}
        <p className="compare-tip"><span className="compare-check ghost" /> Selecciona corredores para comparar sus tiempos</p>
      </section>

      {selected.length > 0 && <div className="compare-bar"><div className="compare-avatars">{selectedRunners.map((runner) => <span key={runner.id}>{initials(runner.name)}</span>)}</div><div className="compare-copy"><strong>{selected.length} {selected.length === 1 ? "corredor seleccionado" : "corredores seleccionados"}</strong><span>Selecciona hasta 4 para comparar</span></div><button className="clear-compare" onClick={() => setSelected([])}>Limpiar</button><button className="button primary" disabled={selected.length < 2} onClick={() => setCompareOpen(true)}><ArrowDownUp size={17} /> Comparar tiempos</button></div>}
      {compareOpen && <CompareModal runners={selectedRunners} onClose={() => setCompareOpen(false)} />}
      <footer><Brand /><span>Resultados claros. Metas memorables.</span><button onClick={() => setView("admin")}>Organiza un evento</button></footer>
    </main>
  );
}

function Brand() { return <div className="brand"><PaceIcon /><strong>Paceboard</strong></div>; }

function Avatar({ runner }: { runner: Runner }) { return <div className={`avatar avatar-${Number(runner.id.replace(/\D/g, "")) % 5}`}>{initials(runner.name)}</div>; }

function Place({ place }: { place: number }) {
  if (place <= 3) return <span className={`place podium place-${place}`}>{place === 1 ? <Trophy size={17} /> : <Medal size={17} />}{place}</span>;
  return <span className="place">{place}</span>;
}

function Toast({ text }: { text: string }) { return <div className="toast"><Check size={17} />{text}</div>; }

function CompareModal({ runners, onClose }: { runners: Runner[]; onClose: () => void }) {
  const fastest = runners.reduce((best, runner) => timeToSeconds(runner.time) < timeToSeconds(best.time) ? runner : best, runners[0]);
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="compare-modal"><header><div><p className="eyebrow green">COMPARATIVA</p><h2>Comparar tiempos</h2></div><button onClick={onClose}><X /></button></header><div className="compare-list">{runners.map((runner, index) => <article key={runner.id}><div className="compare-rank">{index + 1}</div><Avatar runner={runner} /><div className="compare-name"><strong>{runner.name}</strong><span>#{runner.bib} · {runner.category}</span></div><div className="compare-time"><strong>{runner.time}</strong><span>{runner.id === fastest.id ? <><Trophy size={12} /> Mejor tiempo</> : `+${difference(runner.time, fastest.time)}`}</span></div></article>)}</div><div className="compare-insight"><Sparkles size={19} /><p><strong>{fastest.name}</strong> marcó el mejor tiempo del grupo, con un ritmo de <strong>{fastest.pace} min/km</strong>.</p></div><button className="button primary modal-done" onClick={onClose}>Listo</button></section></div>;
}
