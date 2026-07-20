"use client";
import { SidebarItem } from "./sidebar-item";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/orcamentos", label: "Orçamentos", icon: "📋" },
  { href: "/catalogo", label: "Catálogo", icon: "📷" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/planos", label: "Planos", icon: "📦" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background p-4 hidden md:block">
      <div className="flex items-center gap-2 mb-8 px-3">
        <span className="font-bold text-lg">Alfa Câmeras</span>
      </div>
      <nav className="space-y-1">
        {links.map((link) => (
          <SidebarItem key={link.href} href={link.href} icon={<span>{link.icon}</span>} label={link.label} />
        ))}
      </nav>
    </aside>
  );
}
