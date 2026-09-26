"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { AuthModal } from "@/components/auth-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAV, isStaticRoute } from "@/lib/site-nav";

function NavLink({ href, className, onClick, children }: { href: string; className?: string; onClick?: () => void; children: React.ReactNode }) {
  // Static pages (/deep-tech) are files in public/, so they need a normal navigation.
  if (isStaticRoute(href)) return <a href={href} className={className} onClick={onClick}>{children}</a>;
  return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
}

export function SiteHeader({ isAuthenticated = false, initials = "OU" }: { isAuthenticated?: boolean; initials?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "signup" | "signin" }>({ open: false, mode: "signup" });

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal(a => ({ ...a, open: false }))}
        initialMode={authModal.mode}
        initialTab="individual"
      />

      {/* Mobile nav */}
      <div className={`mobile-nav${mobileNavOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Site navigation">
        <button className="mobile-nav-close" type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">✕</button>
        {SITE_NAV.map(item => (
          <NavLink key={item.id} href={item.href} className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
            {item.mobileLabel}
          </NavLink>
        ))}
        <div className="mobile-nav-actions">
          {!isAuthenticated
            ? <button className="button secondary opt-signin-btn" type="button" onClick={() => { setMobileNavOpen(false); setAuthModal({ open: true, mode: "signin" }); }}>Sign In</button>
            : <span className="profile-avatar">{initials}</span>
          }
          <Link className="button" href="/contact" onClick={() => setMobileNavOpen(false)}>Start a Project</Link>
        </div>
      </div>

      {/* Header */}
      <header className="site-header">
        <nav className="shell nav">
          <Link className="brand" href={isAuthenticated ? "/dashboard" : "/"} aria-label="Optimais Labs home">
            <img src="/brand_assets/optimaislabs.png" alt="Optimais Labs" />
          </Link>
          <div className="nav-links" aria-label="Site sections">
            {SITE_NAV.map(item => (
              <NavLink key={item.id} href={item.href} className={isActive(item.href) ? "active" : ""}>{item.label}</NavLink>
            ))}
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            {!isAuthenticated
              ? <button className="button secondary opt-signin-btn" type="button" onClick={() => setAuthModal({ open: true, mode: "signin" })}>Sign In</button>
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
            <Link className="button" href="/contact">Start a Project</Link>
            <button className="hamburger" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu" aria-expanded={mobileNavOpen}>
              <span/><span/><span/>
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}
