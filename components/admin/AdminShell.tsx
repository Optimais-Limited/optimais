import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/scholarships", "Scholarships"],
  ["/admin/blog", "Blog CMS"],
  ["/admin/applications", "Applications"],
  ["/admin/contacts", "Contacts"],
  ["/admin/newsletter", "Newsletter"],
  ["/admin/newsletters", "Newsletter Posts"],
  ["/admin/exhibitions", "Exhibitions"],
  ["/admin/saved-scholarships", "Saved"]
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">Optimais Labs Admin</Link>
        <nav className="admin-nav">
          {links.map(([href, label]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
        <div className="admin-sidebar-theme">
          <ThemeToggle />
          <span>Theme</span>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
