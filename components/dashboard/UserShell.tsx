import Link from "next/link";

const links = [
  ["/dashboard", "Dashboard"],
  ["/dashboard/saved-scholarships", "Saved Scholarships"],
  ["/dashboard/applications", "Applications"]
];

export function UserShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/dashboard">Optimais Portal</Link>
        <nav className="admin-nav">
          {links.map(([href, label]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
          <Link href="/admin">Admin</Link>
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
