"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const links: [string, string, boolean?][] = [
  ["/admin", "Overview"],
  ["/admin/exhibitions", "Exhibition review"],
  ["/admin/discussions", "Discussions"],
  ["/admin/newsletter", "Newsletter"],
  ["/admin/newsletters", "Newsletter posts"],
  ["/admin/blog", "Blog & pages"],
  ["/admin/scholarships", "Scholarships"],
  ["/admin/applications", "Applications"],
  ["/admin/saved-scholarships", "Saved scholarships"],
  ["/admin/contacts", "Contacts"],
  ["/admin/users", "Members and roles", true], // adminOnly
  ["/admin/activity", "Action history"],
  ["/admin/settings", "Settings"]
];

export function AdminShell({ children, name, role }: { children: React.ReactNode; name: string; role: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <Link className="admin-brand" href="/admin">Optimais Labs<span>Staff Tools</span></Link>
          <nav className="admin-nav">
            {links
              .filter(([, , adminOnly]) => !adminOnly || role === "ADMIN")
              .map(([href, label]) => (
                <Link href={href} key={href} className={isActive(href) ? "active" : ""}>{label}</Link>
              ))}
          </nav>
        </div>
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-theme">
            <ThemeToggle />
            <span>Theme</span>
          </div>
          <div className="admin-whoami">
            <span className="admin-role-badge">Optimais {role === "ADMIN" ? "Admin" : "Editor"}</span>
            <span className="admin-whoami-name">{name}</span>
          </div>
          <Link className="admin-back-link" href="/dashboard">← Back to the site</Link>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
