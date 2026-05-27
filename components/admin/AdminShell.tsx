import Link from "next/link";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/scholarships", "Scholarships"],
  ["/admin/blog", "Blog CMS"],
  ["/admin/applications", "Applications"],
  ["/admin/contacts", "Contacts"],
  ["/admin/newsletter", "Newsletter"],
  ["/admin/saved-scholarships", "Saved"]
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">Optimais Admin</Link>
        <nav className="admin-nav">
          {links.map(([href, label]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
