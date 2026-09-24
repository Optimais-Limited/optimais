"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as THREE from "three";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";

// ── Arrow icon ──────────────────────────────────────────────────────────
const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

// ── Industries list ──────────────────────────────────────────────────────
const INDUSTRIES = [
  { id: "01", label: "Artificial Intelligence", body: "Developing intelligent systems, machine learning solutions, decision-support tools, and advanced analytics that enable smarter and more efficient decision-making." },
  { id: "02", label: "Robotics & Automation", body: "Designing autonomous systems, robotics technologies, industrial automation solutions, and intelligent control systems that enhance productivity and operational efficiency." },
  { id: "03", label: "Aerospace & Advanced Systems", body: "Supporting innovation in aerospace technologies, unmanned aerial systems (UAS), remote sensing, satellite applications, autonomous platforms, and advanced engineering systems." },
  { id: "04", label: "Agritech & Food Systems", body: "Applying technology, automation, data analytics, and intelligent systems to improve agricultural productivity, food security, supply chains, and sustainable farming practices." },
  { id: "05", label: "Energy Systems", body: "Advancing renewable energy technologies, smart energy infrastructure, energy optimization, and sustainable power solutions for communities, businesses, and industries." },
  { id: "06", label: "Advanced Manufacturing", body: "Supporting the development of modern manufacturing systems through automation, digital technologies, process optimization, and industrial innovation." },
  { id: "07", label: "Pharmaceutical & Biotechnology Innovation", body: "Leveraging computational methods, data-driven research, biotechnology, and emerging technologies to accelerate innovation in healthcare, pharmaceuticals, and life sciences." },
  { id: "08", label: "Infrastructure & Smart Systems", body: "Developing intelligent infrastructure solutions that integrate technology, data, and engineering to improve transportation, utilities, public services, and urban development." },
  { id: "09", label: "Research & Education", body: "Conducting interdisciplinary research, promoting knowledge creation, supporting academic collaboration, and delivering education, training, and workforce development programs." },
  { id: "10", label: "Strategic Consulting", body: "Providing expert advisory services in technology, innovation, business transformation, policy, research, and organizational development to help clients achieve sustainable growth and impact." },
];

// ── Innovation accordion ─────────────────────────────────────────────────
const INNOVATION_ITEMS = [
  { label: "Research-first development", body: "Every engagement starts with evidence. We analyse domain constraints, identify the best-known methods, and build from a research-validated foundation." },
  { label: "Applied AI and optimisation", body: "We deploy reinforcement learning, robust optimisation and intelligent decision-making systems directly into industrial, infrastructure and operational workflows." },
  { label: "Systems integration", body: "Our solutions connect hardware, software, data and people inside a unified architecture — from sensor to cloud, from algorithm to action." },
];

// ── Calendar helpers ─────────────────────────────────────────────────────
function buildCalendar(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const todayNum = today.getFullYear() === y && today.getMonth() === m ? today.getDate() : -1;
  const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });
  const highlighted = [6, 12, 19, 24];
  return { firstDay, daysInMonth, todayNum, monthName, highlighted };
}

// ── Scholarship type ─────────────────────────────────────────────────────
interface Scholarship {
  title: string;
  provider: string;
  summary: string;
  source: string;
  levels?: string[];
  countries?: string[];
  fields?: string[];
  deadline?: string;
  fundingTypes?: string[];
  keywords?: string[];
}

// ═══════════════════════════════════════════════════════════════════════
export interface OptimaisLandingProps {
  isAuthenticated?: boolean;
  initials?: string;
}

export function OptimaisLanding({ isAuthenticated = false, initials = "OU" }: OptimaisLandingProps) {
  const router = useRouter();

  /* ── layout state ── */
  const [activePanel, setActivePanel] = useState("capabilities");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);

  /* ── auth modal ── */
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    mode: "signup" | "signin";
    tab: "individual" | "business";
  }>({ open: false, mode: "signup", tab: "individual" });

  /* ── accordions ── */
  const [openIndustry, setOpenIndustry] = useState(0);
  const [openInnovation, setOpenInnovation] = useState(0);


  /* ── calendar ── */
  const calDate = useMemo(() => new Date(), []);
  const cal = useMemo(() => buildCalendar(calDate), [calDate]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  /* ── scholarships ── */
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [scholarshipQuery, setScholarshipQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");

  /* ── contact form ── */
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "success" | "error">("idle");

  /* ── Three.js dotted surface ── */
  const dottedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = dottedRef.current;
    if (!container) return;
    const SEPARATION = 150, AMOUNTX = 40, AMOUNTY = 60;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 2000, 10000);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 355, 1220);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 0);
    container.appendChild(renderer.domElement);

    const positions: number[] = [];
    const colors: number[] = [];
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions.push(ix * SEPARATION - (AMOUNTX * SEPARATION) / 2, 0, iy * SEPARATION - (AMOUNTY * SEPARATION) / 2);
        colors.push(200, 200, 200);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 8, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const posArr = geometry.attributes.position.array as Float32Array;
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          posArr[i * 3 + 1] = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50;
          i++;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.1;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      scene.traverse(obj => {
        if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  /* ── scroll reveal ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && (e.target as HTMLElement).classList.add("visible")),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".opt-root .reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activePanel]);

  /* ── fetch scholarships ── */
  useEffect(() => {
    fetch("/data/scholarships.json")
      .then(r => r.json())
      .then((data: Scholarship[]) => setScholarships(data))
      .catch(() => setScholarships([]));
  }, []);

  /* ── helpers ── */
  const openPanel = useCallback((name: string) => {
    setActivePanel(name);
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openSignModal = useCallback((mode: "signup" | "signin" = "signup") => {
    setAuthModal({ open: true, mode, tab: "individual" });
  }, []);

  const filteredScholarships = useMemo(() => {
    const q = scholarshipQuery.toLowerCase();
    return scholarships.filter(s => {
      if (q && !s.title.toLowerCase().includes(q) && !s.provider.toLowerCase().includes(q) && !(s.summary || "").toLowerCase().includes(q)) return false;
      if (levelFilter && !(s.levels || []).includes(levelFilter)) return false;
      if (fieldFilter && !(s.fields || []).includes(fieldFilter)) return false;
      return true;
    }).slice(0, 10);
  }, [scholarships, scholarshipQuery, levelFilter, fieldFilter]);

  /* ── career link click handler ── */
  function handleCareerLink(e: React.MouseEvent, isGated: boolean) {
    if (isGated && !isAuthenticated) {
      e.preventDefault();
      openSignModal("signup");
    }
  }

  // ═══ RENDER ════════════════════════════════════════════════════════════
  return (
    <div className={`opt-root${isAuthenticated ? " authenticated" : ""}`}>

      {/* Auth modal */}
      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal(a => ({ ...a, open: false }))}
        initialMode={authModal.mode}
        initialTab={authModal.tab}
      />

      {/* Mobile nav */}
      <div className={`mobile-nav${mobileNavOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Site navigation">
        <button className="mobile-nav-close" type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">✕</button>
        {["capabilities","innovation","markets","opportunities","insights","careers","deeptech","contact"].map((p, i) => (
          <button key={p} className="mobile-nav-link" type="button" onClick={() => { openPanel(p); setMobileNavOpen(false); }}>
            {["Industries","R&D & Innovation","Markets","Scholarships & Grants","Insights","Careers","Deep Tech","Contact"][i]}
          </button>
        ))}
        <div className="mobile-nav-actions">
          {!isAuthenticated
            ? <button className="button secondary opt-signin-btn" type="button" onClick={() => { setMobileNavOpen(false); openSignModal(); }}>Sign In</button>
            : <span className="profile-avatar">{initials}</span>
          }
          <button className="button" type="button" onClick={() => { openPanel("contact"); setMobileNavOpen(false); }}>Start a Project</button>
        </div>
      </div>

      {/* Header */}
      <header className="site-header">
        <nav className="shell nav">
          <a className="brand" href="/" aria-label="Optimais Labs">
            <img src="/brand_assets/optimaislabs.png" alt="Optimais Labs" />
          </a>
          <div className="nav-links" aria-label="Page sections">
            {[["capabilities","Industries"],["innovation","Innovation"],["markets","Markets"],["opportunities","Opportunities"],["insights","Insights"],["careers","Careers"],["deeptech","Deep Tech"],["contact","Contact"]].map(([id, label]) => (
              <button key={id} className={`${activePanel === id ? "active" : ""}`} type="button" onClick={() => openPanel(id)}>{label}</button>
            ))}
          </div>
          <div className="nav-actions">
            {!isAuthenticated
              ? <button className="button secondary opt-signin-btn" type="button" onClick={() => openSignModal("signin")}>Sign In</button>
              : (
                <div className="avatar-wrap" style={{ position: "relative" }}>
                  <button
                    className="profile-avatar"
                    type="button"
                    aria-label="Account menu"
                    aria-expanded={avatarDropdownOpen}
                    onClick={() => setAvatarDropdownOpen(o => !o)}
                  >
                    {initials}
                  </button>
                  {avatarDropdownOpen && (
                    <>
                      <div className="avatar-backdrop" onClick={() => setAvatarDropdownOpen(false)} />
                      <div className="avatar-dropdown" role="menu">
                        <button role="menuitem" type="button" className="avatar-dropdown-item" onClick={() => { setAvatarDropdownOpen(false); router.push("/dashboard/profile"); }}>
                          Profile
                        </button>
                        <div className="avatar-dropdown-divider" />
                        <button role="menuitem" type="button" className="avatar-dropdown-item avatar-dropdown-item--danger" onClick={() => signOut({ callbackUrl: "/" })}>
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            }
            <button className="button" type="button" onClick={() => openPanel("contact")}>Start a Project</button>
            <button className="hamburger" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu" aria-expanded={mobileNavOpen}>
              <span/><span/><span/>
            </button>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* ── HERO ── */}
        <section className="hero">
          <div ref={dottedRef} className="opt-dotted-surface" aria-hidden="true" />
          <div className="shell">
            <div className="hero-content reveal">
              <h1>Intelligent systems for sustainable industrial growth.</h1>
              <p className="hero-copy">
                Optimais Labs is a research-driven Artificial Intelligence and Robotics Research Laboratory and consulting company dedicated to advancing technology, innovation, and sustainable development. We bring together cutting-edge research, engineering expertise, and strategic advisory services to solve complex challenges across industries and society.
              </p>
              <div className="hero-actions">
                <a className="button" href="/industries">Explore Industries</a>
                <button className="button secondary" type="button" onClick={() => openPanel("innovation")}>View Approach</button>
              </div>
            </div>

            {/* iPhone mockup */}
            <div className="iphone-wrap reveal" aria-label="Optimais Labs mobile interface preview">
              <div className="iphone">
                <div className="iphone-notch" />
                <div className="iphone-topbar">
                  <span>9:41</span>
                  <span style={{ letterSpacing: "2px" }}>●●●</span>
                </div>
                <div className="iphone-body">
                  <div className="iphone-app-header">
                    <span className="iphone-app-title">Optim<span>ai</span>s</span>
                    <div className="iphone-app-badge">AI</div>
                  </div>
                  <div className="iphone-metrics">
                    <div className="iphone-metric"><span className="iphone-metric-label">Domains</span><span className="iphone-metric-value">6</span></div>
                    <div className="iphone-metric"><span className="iphone-metric-label">Disciplines</span><span className="iphone-metric-value light">12+</span></div>
                    <div className="iphone-metric"><span className="iphone-metric-label">Markets</span><span className="iphone-metric-value">4</span></div>
                    <div className="iphone-metric"><span className="iphone-metric-label">Reach</span><span className="iphone-metric-value light">Global</span></div>
                  </div>
                  <div className="iphone-bars">
                    <span className="iphone-bars-title">Capability Coverage</span>
                    {[["AI Systems","92%","gold"],["Renewable","85%",""],["Engineering","78%","gold"],["Advisory","70%",""]].map(([name, pct, cls]) => (
                      <div key={name} className="iphone-bar-row">
                        <span className="iphone-bar-name">{name}</span>
                        <div className="iphone-bar-track"><div className={`iphone-bar-fill${cls ? " gold" : ""}`} style={{ width: pct }} /></div>
                        <span className="iphone-bar-pct">{pct}</span>
                      </div>
                    ))}
                  </div>
                  <div className="iphone-status-strip">
                    <div className="iphone-status-dot" />
                    <span className="iphone-status-text">All systems operational · Nigeria &amp; international</span>
                  </div>
                </div>
                <div className="iphone-nav">
                  {[["⬡","Home",true],["◈","Services",false],["◉","Markets",false],["◎","Contact",false]].map(([icon, label, active]) => (
                    <div key={label as string} className={`iphone-nav-item${active ? " active" : ""}`}>
                      <div className="iphone-nav-icon">{icon as string}</div>
                      <span>{label as string}</span>
                    </div>
                  ))}
                </div>
                <div className="iphone-home-indicator"><div className="iphone-home-bar" /></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VIDEO ── */}
        <section className="video-section">
          <div className="shell">
            <div className="section-head reveal">
              <div>
                <p className="section-label">In Action</p>
                <h2>Innovation Meets Simplicity</h2>
              </div>
              <p>See how Optimais Labs brings together intelligent systems, renewable energy, and engineering excellence into practical, scalable outcomes.</p>
            </div>
            <div className="video-media reveal">
              <video
                controls
                playsInline
                preload="none"
                poster="/brand_assets/optimaislabs-video-poster.jpg"
              >
                <source src="/brand_assets/Optimais_Labs_Brand_Film_10s_sound.webm" type="video/webm" />
                <source src="/brand_assets/Optimais_Labs_Brand_Film_10s_sound.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        {/* ── APPROACH ── */}
        <section className="approach" aria-label="Optimais Labs approach">
          <div className="shell">
            <div className="approach-head reveal">
              <p className="section-label">How we work</p>
              <h2>A structured approach, for clear-headed execution.</h2>
            </div>
            <div className="approach-steps">
              {[
                { n:"01", h:"Research to deployment", p:"Research outputs and proprietary technologies are shaped into practical products, platforms and services that solve real infrastructure and industrial challenges.", li:["Rigorous R&D foundation for every solution","Rapid prototyping and field validation","IP commercialization and technology transfer"] },
                { n:"02", h:"Multi-discipline engineering delivery", p:"Project delivery spans infrastructure, industrial, environmental, technological and developmental programs, managed under one integrated team.", li:["Mechanical, electrical, civil and systems engineering","Clean power infrastructure and smart grid integration","Full lifecycle from design through operations"] },
                { n:"03", h:"Institutional capacity and continuous improvement", p:"Beyond delivery, Optimais Labs builds the institutional structures that sustain impact — training centers, innovation hubs, academies and long-term strategic alliances.", li:["Technical training and applied workshops","Incubation programs and innovation hubs","Strategic alliances and joint ventures"] },
              ].map(s => (
                <div key={s.n} className="step-card reveal">
                  <div className="step-num">{s.n}</div>
                  <div className="step-body">
                    <h3>{s.h}</h3>
                    <p>{s.p}</p>
                    <ul>{s.li.map(l => <li key={l}>{l}</li>)}</ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INTERACTIVE CONSOLE ── */}
        <section className="interactive" id="workspace">
          <div className="shell">
            <div className="section-head reveal">
              <div><h2>Explore Optimais Labs without leaving the page.</h2></div>
              <p>Use the tabs to open each focus area in place. Detailed services expand as needed, keeping the experience fast, clean and focused.</p>
            </div>
            <div className="console reveal">
              {/* sidebar tabs */}
              <div className="console-nav" aria-label="Optimais Labs content panels">
                <p>Open a focus area</p>
                {[
                  ["01","capabilities","Industries"],
                  ["02","innovation","R&D and Innovation"],
                  ["03","markets","Markets Served"],
                  ["04","opportunities","Scholarships & Grants"],
                  ["05","insights","Insights"],
                  ["06","careers","Careers"],
                  ["07","deeptech","Deep Tech"],
                  ["08","contact","Contact"],
                ].map(([num, id, label]) => (
                  <button key={id} className={`console-tab${activePanel === id ? " active" : ""}`} type="button" onClick={() => openPanel(id)}>
                    <strong>{num}</strong>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* panel body */}
              <div className="console-body">

                {/* 01 Industries */}
                <article className={`panel${activePanel === "capabilities" ? " active" : ""}`} id="panel-capabilities">
                  <div className="panel-layout">
                    <div>
                      <p className="kicker">Sectors We Serve</p>
                      <h2>Industries where Optimais Labs delivers intelligent, lasting impact.</h2>
                      <p className="panel-lede">From AI-driven platforms and clean energy systems to engineering and advisory, Optimais Labs brings deep technical capability across a wide range of industry verticals.</p>
                      <div className="accordion">
                        {INDUSTRIES.map((item, idx) => (
                          <div key={item.id} className="accordion-item">
                            <button
                              className="accordion-trigger"
                              type="button"
                              aria-expanded={openIndustry === idx}
                              onClick={() => setOpenIndustry(openIndustry === idx ? -1 : idx)}
                            >
                              <span className="icon">{item.id}</span>
                              {item.label}
                              <span className="plus">+</span>
                            </button>
                            <div className={`accordion-panel${openIndustry === idx ? " open" : ""}`}>
                              <div><p>{item.body}</p></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <aside className="insight-card">
                      <h3>Industries at a Glance</h3>
                      <p>From deep tech to energy, Optimais Labs spans the critical industries driving Africa&apos;s sustainable growth.</p>
                    </aside>
                  </div>
                </article>

                {/* 02 R&D / Innovation */}
                <article className={`panel${activePanel === "innovation" ? " active" : ""}`} id="panel-innovation">
                  <div className="panel-layout">
                    <div>
                      <p className="kicker">R&amp;D and Innovation</p>
                      <h2>Built from research. Delivered at scale.</h2>
                      <p className="panel-lede">Optimais Labs was founded on the belief that applied research should drive practical solutions. Every solution we build is grounded in research, validated through engineering, and designed to perform in the real world.</p>
                      <div className="accordion">
                        {INNOVATION_ITEMS.map((item, idx) => (
                          <div key={item.label} className="accordion-item">
                            <button className="accordion-trigger" type="button" aria-expanded={openInnovation === idx} onClick={() => setOpenInnovation(openInnovation === idx ? -1 : idx)}>
                              <span className="icon">0{idx + 1}</span>
                              {item.label}
                              <span className="plus">+</span>
                            </button>
                            <div className={`accordion-panel${openInnovation === idx ? " open" : ""}`}>
                              <div><p>{item.body}</p></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <aside className="insight-card">
                      <h3>Research Areas</h3>
                      <p>Mathematical optimisation · Machine learning · Reinforcement learning · Control systems · Computational modelling · Renewable energy systems</p>
                    </aside>
                  </div>
                </article>

                {/* 03 Markets */}
                <article className={`panel${activePanel === "markets" ? " active" : ""}`} id="panel-markets">
                  <div className="panel-layout">
                    <div>
                      <p className="kicker">Where We Work</p>
                      <h2>Serving public, private and industrial markets globally.</h2>
                      <p className="panel-lede">Optimais Labs serves a broad range of clients and markets — from governments and public institutions to private enterprises, industrial operators, and community development programmes.</p>
                      <div className="market-pills">
                        {["Public Sector & Government","Private Enterprise","Industrial Operations","Community Development","Academic & Research Institutions","International Development"].map(m => (
                          <span key={m}>{m}</span>
                        ))}
                      </div>
                    </div>
                    <aside className="insight-card">
                      <h3>Geographic Focus</h3>
                      <p>Primary: Nigeria and West Africa<br/>Research hub: United States (New Hampshire)<br/>Global reach through partnerships</p>
                    </aside>
                  </div>
                </article>

                {/* 04 Scholarships */}
                <article className={`panel${activePanel === "opportunities" ? " active" : ""}`} id="panel-opportunities">
                  <p className="kicker">Scholarships &amp; Grants</p>
                  <h2>Find funding for your academic journey.</h2>
                  <p className="panel-lede">Optimais Labs curates scholarships, grants, and academic funding opportunities from leading institutions and organisations worldwide.</p>

                  <div className="opportunity-tools">
                    <input className="filter search-bar" type="search" placeholder="Search provider, country, field or title…" value={scholarshipQuery} onChange={e => setScholarshipQuery(e.target.value)} aria-label="Search scholarships" />
                    <select className="filter" value={levelFilter} onChange={e => setLevelFilter(e.target.value)} aria-label="Filter by level">
                      <option value="">All levels</option>
                      <option value="BACHELORS">Bachelor's</option>
                      <option value="MASTERS">Master's</option>
                      <option value="PHD">PhD</option>
                      <option value="POSTDOC">Postdoc</option>
                      <option value="PROFESSIONAL_TRAINING">Professional Training</option>
                    </select>
                    <select className="filter" value={fieldFilter} onChange={e => setFieldFilter(e.target.value)} aria-label="Filter by field">
                      <option value="">All fields</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Technology">Technology</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Natural Sciences">Natural Sciences</option>
                      <option value="Business">Business</option>
                    </select>
                    <button className="button" type="button" onClick={() => { setScholarshipQuery(""); setLevelFilter(""); setFieldFilter(""); }}>Clear filters</button>
                  </div>

                  <div className="opportunity-list">
                    {filteredScholarships.length === 0 && (
                      <div className="empty-state">No opportunities match your filters — try broadening your search.</div>
                    )}
                    {filteredScholarships.map(s => (
                      <div key={s.title} className="opportunity-card">
                        <h3>{s.title}</h3>
                        <div className="opportunity-meta">
                          <span className="tag">{s.provider}</span>
                          {(s.levels || []).map(l => <span key={l} className="tag">{l}</span>)}
                          {(s.fundingTypes || []).slice(0, 1).map(f => <span key={f} className="tag">{f.replace("_", " ")}</span>)}
                        </div>
                        <p>{s.summary}</p>
                        <a href={s.source} target="_blank" rel="noopener noreferrer">
                          Apply / Learn more <ArrowRight />
                        </a>
                      </div>
                    ))}
                  </div>
                </article>

                {/* 05 Insights */}
                <article className={`panel${activePanel === "insights" ? " active" : ""}`} id="panel-insights">
                  <div className="panel-layout">
                    <div>
                      <p className="kicker">Ideas &amp; Perspectives</p>
                      <h2>Insights from the frontier of technology and innovation.</h2>
                      <p className="panel-lede">Explore the latest insights, ideas, and perspectives from Optimais Labs.</p>
                      <p className="panel-lede" style={{ marginTop: 12 }}>
                        Discover research-driven thinking, emerging deep-tech trends, and innovative solutions shaping the future of business, industry, technology, and society. From artificial intelligence and intelligent systems to energy, infrastructure, manufacturing, and digital transformation, our insights highlight the ideas driving sustainable innovation and long-term impact.
                      </p>
                      <a href="#" className="button" style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        Read Insights <ArrowRight />
                      </a>
                    </div>
                    <aside className="insight-card">
                      <h3>Explore by Topic</h3>
                      <div className="career-links">
                        {["Expert Perspectives","Client Stories","Latest Publications","Newsroom","Events"].map(t => (
                          <a key={t} href="#" className="career-link-item">
                            <span>{t}</span><ArrowRight />
                          </a>
                        ))}
                      </div>
                    </aside>
                  </div>
                </article>

                {/* 06 Careers */}
                <article className={`panel${activePanel === "careers" ? " active" : ""}`} id="panel-careers">
                  <div className="panel-layout">
                    <div>
                      <p className="kicker">Join the Team</p>
                      <h2>Build the future of intelligent systems with us.</h2>
                      <p className="panel-lede">We&apos;re looking for passionate individuals who thrive in collaborative environments, value openness, and are eager to learn, grow, and help others succeed.</p>
                      <p className="panel-lede" style={{ marginTop: 12 }}>
                        If you&apos;re ready to apply your knowledge, skills, and experience to meaningful and innovative challenges, this is your opportunity to take your career to the next level with us.
                      </p>
                      <button className="button" type="button" style={{ marginTop: 24 }} onClick={() => !isAuthenticated && openSignModal()}>
                        {isAuthenticated ? "Apply Now" : "Apply Now — Sign Up First"}
                      </button>
                    </div>
                    <aside className="insight-card">
                      <h3>Explore Opportunities</h3>
                      <div className="career-links">
                        <a href="#" className="career-link-item" onClick={e => handleCareerLink(e, true)}><span>Early Careers</span><ArrowRight /></a>
                        <a href="#" className="career-link-item" onClick={e => handleCareerLink(e, true)}><span>Experienced Professionals</span><ArrowRight /></a>
                        <a href="/culture-benefits" className="career-link-item"><span>Culture &amp; Benefits</span><ArrowRight /></a>
                        <a href="/our-stories" className="career-link-item"><span>Our Stories</span><ArrowRight /></a>
                        <a href="#" className="career-link-item" onClick={e => handleCareerLink(e, true)}><span>Job Alerts</span><ArrowRight /></a>
                      </div>
                    </aside>
                  </div>
                </article>

                {/* 07 Deep Tech */}
                <article className={`panel${activePanel === "deeptech" ? " active" : ""}`} id="panel-deeptech">
                  <div className="panel-layout">
                    <div>
                      <p className="kicker">Advanced Technology</p>
                      <h2>Inventing solutions at the frontier of science and engineering.</h2>
                      <p className="panel-lede">Are you curious about new technologies, and how they can lead to long-term sustainable value?</p>
                      <p className="panel-lede" style={{ marginTop: 12 }}>
                        We think creatively at the intersection of business and technology, inventing solutions to redefine what you do.
                      </p>
                      <a href="/deep-tech" className="button" style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        Explore Deep Tech <ArrowRight />
                      </a>
                    </div>
                    <aside className="insight-card">
                      <h3>Deep Tech Areas</h3>
                      <div className="career-links">
                        {[
                          ["Robotics & Autonomous Systems","/deep-tech#robotics"],
                          ["Decision Intelligence & Optimization","/deep-tech#decision"],
                          ["Human-Computer Interaction & XR","/deep-tech#hci"],
                          ["Digital Twins & Simulation","/deep-tech#twins"],
                          ["Advanced Materials & Nanotechnology","/deep-tech#materials"],
                          ["EnergyTech","/deep-tech#energy"],
                          ["Defense & Dual-Use Technologies","/deep-tech#defense"],
                        ].map(([label, href]) => (
                          <a key={label} href={href} className="career-link-item">
                            <span>{label}</span><ArrowRight />
                          </a>
                        ))}
                      </div>
                    </aside>
                  </div>
                </article>

                {/* 08 Contact */}
                <article className={`panel${activePanel === "contact" ? " active" : ""}`} id="panel-contact">
                  <div className="panel-layout">
                    <div>
                      <p className="kicker">Start the Conversation</p>
                      <h2>Plan, build and operate smarter systems with Optimais Labs.</h2>
                      <p className="panel-lede">
                        Bring Optimais Labs into early strategy, feasibility, engineering design, implementation planning or long-term operations for technology, energy and infrastructure programs.
                      </p>
                      {contactStatus === "success" ? (
                        <div className="contact-success">
                          <p>✓ Message received! We'll be in touch shortly.</p>
                        </div>
                      ) : (
                        <form className="contact-form" onSubmit={async e => {
                          e.preventDefault();
                          setContactLoading(true); setContactStatus("idle");
                          const res = await fetch("/api/contact", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
                          });
                          setContactLoading(false);
                          if (res.ok) {
                            setContactStatus("success");
                            setContactName(""); setContactEmail(""); setContactMessage("");
                          } else {
                            setContactStatus("error");
                          }
                        }}>
                          <input className="opt-field" type="text" placeholder="Name" aria-label="Name" value={contactName} onChange={e => setContactName(e.target.value)} required />
                          <input className="opt-field" type="email" placeholder="Email" aria-label="Email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
                          <textarea className="opt-field" placeholder="Project brief" aria-label="Project brief" value={contactMessage} onChange={e => setContactMessage(e.target.value)} required minLength={10} />
                          {contactStatus === "error" && <p style={{ color: "#d96c5f", fontSize: "0.85rem", margin: "0 0 8px" }}>Something went wrong. Please try again.</p>}
                          <button className="button" type="submit" disabled={contactLoading}>
                            {contactLoading ? "Sending…" : "Send Inquiry"}
                          </button>
                        </form>
                      )}
                    </div>
                    <aside className="insight-card">
                      <h3>Get in Touch</h3>
                      <div className="contact-list">
                        <a href="mailto:optimaislabs@gmail.com">✉ optimaislabs@gmail.com</a>
                        <a href="https://www.linkedin.com/company/109876771/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                      </div>
                    </aside>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="stats" aria-label="Optimais Labs operating breadth">
          <div className="shell stats-grid">
            {[["6","core capability domains"],["12+","engineering and technology disciplines"],["4","deployment markets: public, private, industrial and communities"],["360°","capability across strategy, engineering, deployment and operations"]].map(([val, label]) => (
              <div key={val} className="stat reveal">
                <strong>{val}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CALENDAR ── */}
        <section className="calendar-section">
          <div className="shell">
            <div className="section-head reveal">
              <div>
                <p className="section-label">Schedule</p>
                <h2>Let&apos;s Work Together</h2>
              </div>
              <p>Book a strategy call to discuss how Optimais Labs can support your goals in technology, energy, or infrastructure.</p>
            </div>
            <a href="mailto:optimaislabs@gmail.com" className="calendar-bento reveal" aria-label="Book a call with Optimais Labs">
              <div className="cal-left">
                <h2>Ready to build something exceptional?</h2>
                <p>Book a 30-minute strategy call — no strings attached. We&apos;ll map out how Optimais Labs can support your mission.</p>
                <button className="cal-book-btn" type="button">
                  Book a Call <ArrowRight />
                </button>
              </div>
              <div className="cal-right">
                <div className="cal-widget">
                  <div className="cal-inner">
                    <div className="cal-header">
                      <span className="cal-month">{cal.monthName}</span>
                      <span className="cal-dot" />
                      <span className="cal-duration">30 min call</span>
                    </div>
                    <div className="cal-grid">
                      {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                        <div key={d} className="cal-cell header">{d}</div>
                      ))}
                      {Array.from({ length: cal.firstDay }).map((_, i) => <div key={`e${i}`} className="cal-cell" />)}
                      {Array.from({ length: cal.daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isHighlighted = cal.highlighted.includes(day);
                        const isToday = day === cal.todayNum;
                        const isSelected = day === selectedDay;
                        return (
                          <div
                            key={day}
                            className={`cal-cell${isHighlighted ? " highlighted" : ""}${isToday ? " today" : ""}${isSelected ? " selected" : ""}`}
                            onClick={e => { e.preventDefault(); if (isHighlighted) setSelectedDay(day); }}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* ── EXECUTIVES ── */}
        <section className="exec-section">
          <div className="shell">
            <div className="section-head reveal">
              <div>
                <p className="section-label">Leadership</p>
                <h2>Executives</h2>
              </div>
            </div>
            <div className="exec-card reveal">
              <div className="exec-photo-wrap">
                <img
                  src="/brand_assets/Uthman_Nabil.jpg"
                  alt="Uthman Nabil, CEO of Optimais Labs"
                  className="exec-photo"
                  loading="lazy"
                  width={300}
                  height={400}
                />
              </div>
              <div className="exec-bio-wrap">
                <p className="kicker">Asst. Operations Manager · Pipeline Infrastructures Nig. Ltd.</p>
                <h3 className="exec-name">Uthman Nabil</h3>
                <p className="exec-role">CEO, Optimais Labs</p>
                <blockquote className="exec-statement">
                  As CEO of Optimais Labs, I lead our mission to advance AI research, optimization, and practical technology solutions across Africa. I focus on building partnerships and translating research into solutions that help businesses and communities thrive.
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* ── LOCATIONS ── */}
        <section style={{ padding: "80px 0", borderTop: "1px solid rgba(201,169,97,0.1)" }}>
          <div className="shell">
            <div className="section-head reveal" style={{ marginBottom: 40 }}>
              <div>
                <p className="section-label">Where We Are</p>
                <h2>Our Locations</h2>
              </div>
            </div>
            <div className="reveal location-card-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
              <a href="https://www.google.com/maps/place/Nigeria" target="_blank" rel="noopener noreferrer" className="location-card" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"32px 36px",border:"1px solid rgba(201,169,97,0.18)",borderRadius:16,background:"linear-gradient(135deg,rgba(11,45,74,0.3),rgba(5,21,32,0.4))",textDecoration:"none",color:"inherit",transition:"border-color 0.2s,transform 0.2s" }}>
                <div>
                  <p style={{ margin:"0 0 6px",fontSize:"0.74rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.9px",color:"#C9A961" }}>Africa</p>
                  <h3 style={{ margin:0,fontSize:"clamp(1.4rem,2.5vw,2rem)",fontWeight:800,letterSpacing:"-0.4px" }}>Nigeria</h3>
                  <p style={{ margin:"6px 0 0",fontSize:"0.88rem",color:"rgba(255,255,255,0.52)" }}>West Africa · Primary operations hub</p>
                </div>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,97,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── CONTACT / FOOTER ── */}
        <section className="contact">
          <div className="shell">
            <div className="contact-panel reveal">
              <div>
                <h2>Ready to start your project?</h2>
                <p>Bring Optimais Labs into your strategy, engineering or operations programme. Reach out to start the conversation.</p>
              </div>
              <button className="button" type="button" onClick={() => openPanel("contact")}>Start a Project</button>
            </div>
            <div className="footer">
              <span><span className="footer-mark">Optimais Labs</span> — Intelligent Systems. Sustainable Futures.</span>
              <span>© {new Date().getFullYear()} Optimais Labs. All rights reserved.</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
