"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import * as THREE from "three";
import { applyDotsTheme, getTheme, subscribeTheme } from "@/lib/theme";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_NAV, isStaticRoute } from "@/lib/site-nav";
import { formatNewsletterDate, newsletterImageUrl, type NewsletterSummary } from "@/lib/newsletter-shared";
import type { ExhibitionSummary } from "@/lib/exhibitions-shared";
import { ThemeToggle } from "@/components/theme-toggle";

// ── Arrow icon ──────────────────────────────────────────────────────────
const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

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

// ═══════════════════════════════════════════════════════════════════════
export interface OptimaisLandingProps {
  isAuthenticated?: boolean;
  initials?: string;
  isStaff?: boolean;
  latestNewsletter?: NewsletterSummary | null;
  latestExhibition?: ExhibitionSummary | null;
}

export function OptimaisLanding({ isAuthenticated = false, initials = "OU", isStaff = false, latestNewsletter = null, latestExhibition = null }: OptimaisLandingProps) {
  /* ── calendar ── */
  const calDate = useMemo(() => new Date(), []);
  const cal = useMemo(() => buildCalendar(calDate), [calDate]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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
    applyDotsTheme(scene, geometry, getTheme());
    const unsubscribeTheme = subscribeTheme(mode => applyDotsTheme(scene, geometry, mode));

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
      unsubscribeTheme();
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
  }, []);

  // ═══ RENDER ════════════════════════════════════════════════════════════
  return (
    <div className={`opt-root${isAuthenticated ? " authenticated" : ""}`}>
      <SiteHeader isAuthenticated={isAuthenticated} initials={initials} isStaff={isStaff} />

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
                <Link className="button" href="/industries">Explore Industries</Link>
                <Link className="button secondary" href="/innovation">View Approach</Link>
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

        {/* ── LATEST NEWSLETTER (posted from the admin area) ── */}
        {latestNewsletter && (
          <section className="newsletter-latest" id="newsletter" aria-label="Latest newsletter">
            <div className="shell">
              <div className="section-head reveal">
                <div>
                  <p className="section-label">Latest Newsletter</p>
                  <h2>{formatNewsletterDate(latestNewsletter.createdAt)}</h2>
                </div>
              </div>
              <div className={`newsletter-card reveal${latestNewsletter.comment.trim() ? "" : " newsletter-card-solo"}`}>
                <a
                  className="newsletter-image"
                  style={{ "--nl-w": `${latestNewsletter.imageWidth}px` } as React.CSSProperties}
                  href={newsletterImageUrl(latestNewsletter.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the full-size newsletter"
                >
                  <img
                    src={newsletterImageUrl(latestNewsletter.id)}
                    width={latestNewsletter.imageWidth}
                    height={latestNewsletter.imageHeight}
                    alt={`Newsletter, ${formatNewsletterDate(latestNewsletter.createdAt)}`}
                  />
                </a>
                <div className="newsletter-body">
                  {latestNewsletter.comment && <p className="newsletter-comment">{latestNewsletter.comment}</p>}
                  <Link className="button secondary" href="/newsletters">View all newsletters <ArrowRight /></Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── LATEST EXHIBITION (admin posts only; user posts need approval first) ── */}
        {latestExhibition && (
          <section className="newsletter-latest" id="exhibition" aria-label="Latest exhibition">
            <div className="shell">
              <div className="section-head reveal">
                <div>
                  <p className="section-label">Latest Exhibition</p>
                  <h2>{latestExhibition.title}</h2>
                </div>
              </div>
              <div className="newsletter-card reveal">
                <div className="newsletter-image">
                  {latestExhibition.mediaType === "IMAGE"
                    ? <img src={latestExhibition.mediaUrl} width={latestExhibition.mediaWidth ?? undefined} height={latestExhibition.mediaHeight ?? undefined} alt={latestExhibition.title} />
                    : <video src={latestExhibition.mediaUrl} controls preload="metadata" />}
                </div>
                <div className="newsletter-body">
                  <p className="newsletter-comment">{latestExhibition.description}</p>
                  <Link className="button secondary" href="/exhibitions">View all exhibitions <ArrowRight /></Link>
                </div>
              </div>
            </div>
          </section>
        )}

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

        {/* ── EXPLORE (links to the section pages) ── */}
        <section className="interactive" id="workspace">
          <div className="shell">
            <div className="section-head reveal">
              <div><h2>Explore Optimais Labs.</h2></div>
              <p>Each focus area has its own page. Pick one to see the detail, from industries and research to funding opportunities and how to reach us.</p>
            </div>
            <div className="explore-grid reveal">
              {SITE_NAV.map((item, i) => {
                const inner = (
                  <>
                    <strong>{String(i + 1).padStart(2, "0")}</strong>
                    <h3>{item.tileLabel}</h3>
                    <p>{item.blurb}</p>
                    <span className="go">Open page <ArrowRight /></span>
                  </>
                );
                return isStaticRoute(item.href)
                  ? <a key={item.id} href={item.href} className="explore-tile">{inner}</a>
                  : <Link key={item.id} href={item.href} className="explore-tile">{inner}</Link>;
              })}
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
            <Link href="/contact" className="calendar-bento reveal" aria-label="Book a call with Optimais Labs">
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
            </Link>
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
            <div className="exec-list">
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
                  <h3 className="exec-name">Uthman Nabil</h3>
                  <p className="exec-affiliation">Asst. Operations Manager, Pipeline Infrastructures Nig. Ltd.</p>
                  <p className="exec-role">CEO, Optimais Labs</p>
                  <blockquote className="exec-statement">
                    As CEO of Optimais Labs, I lead our mission to advance AI research, optimization, and practical technology solutions across Africa. I focus on building partnerships and translating research into solutions that help businesses and communities thrive.
                  </blockquote>
                </div>
              </div>
              <div className="exec-card reveal">
                <div className="exec-photo-wrap">
                  <img
                    src="/brand_assets/Durojaiye_Abeeb.jpg"
                    alt="Durojaiye Abeeb, Chief Investment and Product Officer of Optimais Labs"
                    className="exec-photo"
                    loading="lazy"
                    width={300}
                    height={400}
                  />
                </div>
                <div className="exec-bio-wrap">
                  <h3 className="exec-name">Durojaiye Abeeb</h3>
                  <p className="exec-affiliation">Decision Maker, Department of Work and Pensions, UK</p>
                  <p className="exec-role">Chief Investment and Product Officer (CIPO), Optimais Labs</p>
                  <blockquote className="exec-statement">
                    As CIPO of Optimais Labs, I lead investment strategy and product development to turn AI research into practical, market-ready solutions. I focus on identifying investment opportunities and shaping products that meet the needs of businesses and communities across Africa.
                  </blockquote>
                </div>
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
              <a href="https://www.google.com/maps/place/Nigeria" target="_blank" rel="noopener noreferrer" className="location-card" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"32px 36px",border:"1px solid rgba(201,169,97,0.18)",borderRadius:16,background:"var(--card-surface)",textDecoration:"none",color:"inherit",transition:"border-color 0.2s,transform 0.2s" }}>
                <div>
                  <p style={{ margin:"0 0 6px",fontSize:"0.74rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.9px",color:"var(--gold)" }}>Africa</p>
                  <h3 style={{ margin:0,fontSize:"clamp(1.4rem,2.5vw,2rem)",fontWeight:800,letterSpacing:"-0.4px" }}>Nigeria</h3>
                  <p style={{ margin:"6px 0 0",fontSize:"0.88rem",color:"rgba(var(--ink-rgb),0.52)" }}>West Africa · Primary operations hub</p>
                </div>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,97,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </a>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
