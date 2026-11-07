import { Suspense, type ReactNode } from "react";
import { Snowflake, LogOut } from "lucide-react";
import { obtenerSesion } from "@/lib/sesion";
import { ROLES } from "@/lib/catalogos";
import { cerrarSesion } from "@/app/login/actions";
import { Navegacion } from "@/components/navegacion";
import { Cargando } from "@/components/ui";

// El marco (menú) se prerenderiza; todo lo que depende de la sesión va dentro de <Suspense>.
export default function CrmLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen">
      <aside className="no-imprimir sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-marca-900 text-marca-100 max-md:hidden">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-acento text-marca-900">
            <Snowflake size={20} />
          </div>
          <div>
            <p className="font-semibold leading-tight text-white">Ártica</p>
            <p className="text-[11px] text-marca-200">Ingenieros HVAC</p>
          </div>
        </div>
        <Navegacion />
        <div className="mt-auto border-t border-marca-800 px-5 py-4">
          <Suspense>
            <Usuario />
          </Suspense>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="no-imprimir border-b border-slate-200 bg-white md:hidden">
          <Navegacion horizontal />
        </div>
        <main className="flex-1 p-4 md:p-8">
          <Suspense fallback={<Cargando />}>
            <ConAcceso>{children}</ConAcceso>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

async function Usuario() {
  const { perfil } = await obtenerSesion();
  if (!perfil?.rol) return null;
  return (
    <>
      <p className="truncate text-sm font-medium text-white">{perfil.nombre}</p>
      <p className="text-xs text-marca-200">{ROLES[perfil.rol]}</p>
      <form action={cerrarSesion} className="mt-3">
        <button className="flex items-center gap-2 text-xs text-marca-200 hover:text-white">
          <LogOut size={14} /> Cerrar sesión
        </button>
      </form>
    </>
  );
}

async function ConAcceso({ children }: { children: ReactNode }) {
  const { perfil, user } = await obtenerSesion();
  if (perfil?.rol) return children;

  return (
    <div className="tarjeta mx-auto mt-10 max-w-md p-8 text-center">
      <h1 className="text-lg font-semibold">Tu cuenta aún no tiene acceso</h1>
      <p className="mt-2 text-sm text-slate-600">{user.email} está registrado, pero el dueño todavía no te asigna un rol.</p>
      <form action={cerrarSesion} className="mt-6">
        <button className="boton-secundario">Cerrar sesión</button>
      </form>
    </div>
  );
}
