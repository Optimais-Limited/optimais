import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  ["/dashboard", "Dashboard"],
  ["/dashboard/saved-scholarships", "Saved Scholarships"],
  ["/dashboard/applications", "Applications"]
];

export function UserShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/dashboard">Optimais Labs Portal</Link>
        <nav className="admin-nav">
          {links.map(([href, label]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
          <Link href="/admin">Admin</Link>
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
