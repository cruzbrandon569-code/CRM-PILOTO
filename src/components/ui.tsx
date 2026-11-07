import type { ReactNode } from "react";

export function Encabezado({ titulo, subtitulo, acciones }: { titulo: string; subtitulo?: string; acciones?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}

export function Insignia({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={color ? { backgroundColor: `${color}22`, color } : undefined}
    >
      {children}
    </span>
  );
}

const COLORES_ESTADO: Record<string, string> = {
  borrador: "#64748b",
  enviada: "#7c3aed",
  aceptada: "#16a34a",
  rechazada: "#dc2626",
};

export function colorEstado(estado: string) {
  return COLORES_ESTADO[estado] ?? "#64748b";
}

export function Cargando() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-slate-200" />
      <div className="h-32 rounded-xl bg-slate-200" />
      <div className="h-64 rounded-xl bg-slate-200" />
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-slate-500">{children}</p>;
}

/** Desplegable que muestra un formulario sin JavaScript extra. */
export function Desplegable({ texto, children }: { texto: string; children: ReactNode }) {
  return (
    <details className="tarjeta group mb-6">
      <summary className="cursor-pointer list-none px-5 py-3 text-sm font-medium text-marca-700 marker:hidden">
        <span className="group-open:hidden">＋ {texto}</span>
        <span className="hidden group-open:inline">− Cerrar</span>
      </summary>
      <div className="border-t border-slate-100 p-5">{children}</div>
    </details>
  );
}
