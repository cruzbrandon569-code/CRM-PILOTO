"use client";

export default function ErrorCrm({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="tarjeta mx-auto mt-10 max-w-lg p-8">
      <h1 className="text-lg font-semibold">No se pudo completar la operación</h1>
      <p className="mt-2 text-sm text-slate-600">{error.message}</p>
      <p className="mt-2 text-xs text-slate-500">
        Si dice &quot;row-level security&quot;, tu rol no tiene permiso para esta acción.
      </p>
      <button onClick={reset} className="boton mt-6">Reintentar</button>
    </div>
  );
}
