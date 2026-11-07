"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarDays, FileText, KanbanSquare, LayoutDashboard, Users } from "lucide-react";

const ENLACES = [
  { href: "/", texto: "Dashboard", icono: LayoutDashboard },
  { href: "/pipeline", texto: "Pipeline", icono: KanbanSquare },
  { href: "/empresas", texto: "Empresas", icono: Building2 },
  { href: "/contactos", texto: "Contactos", icono: Users },
  { href: "/actividades", texto: "Agenda", icono: CalendarDays },
  { href: "/cotizaciones", texto: "Cotizaciones", icono: FileText },
];

type Props = { horizontal?: boolean };

// La ruta actual solo se conoce en el navegador: mientras llega, se muestra el menú sin resaltar.
export function Navegacion(props: Props) {
  return (
    <Suspense fallback={<Lista {...props} ruta={null} />}>
      <ConRuta {...props} />
    </Suspense>
  );
}

function ConRuta(props: Props) {
  return <Lista {...props} ruta={usePathname()} />;
}

function Lista({ horizontal = false, ruta }: Props & { ruta: string | null }) {
  const activo = (href: string) => ruta !== null && (href === "/" ? ruta === "/" : ruta.startsWith(href));

  if (horizontal) {
    return (
      <nav className="flex gap-1 overflow-x-auto px-3 py-2">
        {ENLACES.map(({ href, texto, icono: Icono }) => (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              activo(href) ? "bg-marca-600 text-white" : "text-slate-600"
            }`}
          >
            <Icono size={15} /> {texto}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {ENLACES.map(({ href, texto, icono: Icono }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
            activo(href) ? "bg-marca-700 text-white" : "hover:bg-marca-800 hover:text-white"
          }`}
        >
          <Icono size={17} /> {texto}
        </Link>
      ))}
    </nav>
  );
}
