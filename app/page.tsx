import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, FileSpreadsheet, Mountain, Search, SlidersHorizontal, Smartphone, Trophy, Users, ArrowDownUp } from "lucide-react";
import PaceIcon from "./components/pace-icon";
import "./landing.css";

export const metadata = {
  title: "Paceboard — Cada esfuerzo merece un gran resultado",
  description: "Transforma los resultados de tu carrera en una experiencia fácil de consultar. Importa CSV, busca corredores, filtra categorías y compara tiempos.",
};

function Logo() {
  return <Link href="/" className="brand home-link" aria-label="Paceboard, inicio"><PaceIcon /><strong>Paceboard</strong></Link>;
}

const features = [
  { icon: FileSpreadsheet, title: "De tu archivo a la meta.", text: "Importa tu CSV y configura la información de tu evento desde un mismo panel.", benefit: "Menos trabajo al preparar resultados" },
  { icon: Search, title: "Tu resultado, al instante.", text: "Encuentra a un participante por nombre o dorsal y explora los resultados por categoría y género.", benefit: "Una consulta fácil para cada corredor" },
  { icon: ArrowDownUp, title: "Cada segundo cuenta.", text: "Compara hasta cuatro corredores, sus tiempos y la diferencia con el más rápido del grupo.", benefit: "Más contexto para entender el esfuerzo" },
  { icon: Smartphone, title: "Siempre a la mano.", text: "Una experiencia pensada para celular, con resultados claros y filtros que te acompañan a donde vayas.", benefit: "Tan cómodo en la meta como en casa" },
];

export default function LandingPage() {
  return (
    <main className="landing">
      <header className="landing-header">
        <Logo />
        <nav aria-label="Navegación principal"><a href="#caracteristicas">El producto</a><a href="#como-funciona">Cómo funciona</a><a href="#clientes">Clientes</a></nav>
        <Link href="/organizador" className="button primary">Soy organizador <ArrowUpRight size={16} /></Link>
      </header>
      <section className="landing-hero landing-width">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow"><span /> EL SIGUIENTE PASO DESPUÉS DE LA META</p>
          <h1>Grandes esfuerzos.<br />Resultados que<br /><em>se disfrutan.</em></h1>
          <p className="landing-intro">Dale a tu carrera una página de resultados a su altura. Fácil de publicar, fácil de encontrar y hecha para tus corredores.</p>
          <div className="landing-ctas"><Link href="/organizador" className="button primary">Explorar el panel <ArrowRight size={18} /></Link><Link href="/resultados" className="landing-text-link">Ver resultados de ejemplo <ArrowUpRight size={17} /></Link></div>
          <p className="landing-note"><Check size={15} /> Prueba el ejemplo sin crear una cuenta</p>
        </div>
        <div className="landing-preview" aria-label="Vista previa de resultados de ejemplo">
          <div className="preview-orbit" />
          <div className="preview-window">
            <div className="preview-browser"><span /><span /><span /><small>paceboard / resultados</small></div>
            <div className="preview-event"><Mountain size={32} /><p>GRAVEL · 80 KM</p><h2>Iztapopo Gravel</h2><span>Un camino. Muchas historias.</span></div>
            <div className="preview-body">
              <div className="preview-title"><strong>El esfuerzo tiene su lugar.</strong><span>Demo</span></div>
              <div className="preview-search"><Search size={15} /> Encuentra a tu corredor <SlidersHorizontal size={15} /></div>
              {[["1", "RM", "Ricardo Mejía", "01:34:18"], ["2", "DH", "Diego Hernández", "01:36:42"], ["3", "SR", "Sofía Ramírez", "01:39:07"]].map(([place, initials, name, time]) => <div className="preview-runner" key={place}><span>{place}</span><b>{initials}</b><div><strong>{name}</strong><small>{place === "3" ? "Libre Femenil" : "Libre Varonil"}</small></div><time>{time}</time></div>)}
              <Link href="/resultados" className="preview-link">Explorar la clasificación <ArrowRight size={15} /></Link>
            </div>
          </div>
          <div className="preview-float"><span><Trophy size={22} /></span><div><strong>Más que un tiempo.</strong><small>Una meta que merece compartirse.</small></div></div>
        </div>
      </section>
      <div className="landing-benefit-strip"><div className="landing-width"><span><FileSpreadsheet size={18} /> Importación CSV</span><span><Search size={18} /> Búsqueda y filtros</span><span><ArrowDownUp size={18} /> Comparación de tiempos</span><span><Smartphone size={18} /> Pensado para móvil</span></div></div>
      <section className="landing-section landing-width" id="caracteristicas">
        <div className="landing-section-heading"><div><p className="landing-eyebrow">PARA QUIEN ORGANIZA. PARA QUIEN CORRE.</p><h2>Una mejor experiencia,<br />de principio a fin.</h2></div><p>Tú haces que la carrera suceda.<br />Paceboard ayuda a que cada participante encuentre su historia en los resultados.</p></div>
        <div className="feature-grid">{features.map(({ icon: Icon, title, text, benefit }) => <article key={title}><span className="feature-icon"><Icon size={23} /></span><h3>{title}</h3><p>{text}</p><span className="feature-benefit"><Check size={14} />{benefit}</span></article>)}</div>
      </section>
      <section className="landing-workflow" id="como-funciona"><div className="landing-width">
        <p className="landing-eyebrow">SENCILLO DESDE EL PRIMER PASO</p><h2>Tu carrera, lista para consultar.</h2>
        <div className="workflow-grid">{[
          ["01", "Dale nombre a tu evento", "Configura el nombre, la fecha, la distancia y el lugar de la carrera."],
          ["02", "Importa los resultados", "Carga tu archivo CSV con los nombres, categorías y tiempos de los participantes."],
          ["03", "Explora cada llegada", "Abre la clasificación, encuentra corredores y compara sus resultados."],
        ].map(([step, title, text]) => <article key={step}><span>{step}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        <Link href="/organizador" className="landing-text-link">Probar con el evento de ejemplo <ArrowRight size={17} /></Link>
      </div></section>
      <section className="landing-section landing-width" id="clientes">
        <div className="landing-section-heading"><div><p className="landing-eyebrow">CLIENTES Y EVENTOS</p><h2>Carreras con mucho<br />que contar.</h2></div><p>Conoce cómo se ve una carrera en Paceboard. Iztapopo es nuestro evento de demostración, con datos de ejemplo.</p></div>
        <article className="client-showcase">
          <div className="client-art"><Mountain size={92} strokeWidth={1} /><strong>IZTAPOPO</strong><span>GRAVEL · MONTAÑA · COMUNIDAD</span></div>
          <div className="client-copy"><span className="client-demo">EVENTO DE EJEMPLO</span><h3>Iztapopo Gravel</h3><p>El esfuerzo de subir. La emoción de llegar. Una experiencia de resultados para reencontrarte con cada kilómetro.</p><div className="client-tags"><span><Mountain size={15} /> Trail running</span><span><Users size={15} /> Todas las categorías</span></div><Link href="/resultados" className="landing-text-link">Ver el ejemplo de Iztapopo <ArrowUpRight size={18} /></Link></div>
        </article>
      </section>
      <section className="landing-final landing-width"><div><p className="landing-eyebrow">LA META ES SOLO EL COMIENZO</p><h2>Tu próximo gran resultado<br />empieza aquí.</h2><p>Descubre lo fácil que puede ser presentar tu carrera.</p></div><Link href="/organizador" className="button">Entrar como organizador <ArrowRight size={18} /></Link></section>
      <footer className="landing-footer"><Logo /><p>Resultados claros. Metas memorables.</p><Link href="/resultados">Ver resultados <ArrowUpRight size={14} /></Link></footer>
    </main>
  );
}
