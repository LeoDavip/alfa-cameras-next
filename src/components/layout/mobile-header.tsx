"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/orcamentos", label: "Orçamentos", icon: "📋" },
  { href: "/catalogo", label: "Catálogo", icon: "📷" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/planos", label: "Planos", icon: "📦" },
];

export function MobileHeader() {
  const pathname = usePathname();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="flex items-center justify-between px-4 h-14">
        <span className="font-bold">Alfa Câmeras</span>
      </div>
      <nav className="flex overflow-x-auto px-4 pb-2 gap-2">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-sm ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {link.icon} {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
