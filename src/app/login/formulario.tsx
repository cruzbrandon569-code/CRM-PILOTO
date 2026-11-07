"use client";

import { use, useActionState } from "react";
import { iniciarSesion } from "./actions";

export function FormularioLogin({ siguiente: promesa }: { siguiente: Promise<string> }) {
  const siguiente = use(promesa);
  const [estado, accion, pendiente] = useActionState(iniciarSesion, { error: "" });

  return (
    <form action={accion} className="space-y-4">
      <input type="hidden" name="siguiente" value={siguiente} />
      <div>
        <label className="etiqueta" htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="campo" />
      </div>
      {estado.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.error}</p>}
      <button type="submit" disabled={pendiente} className="boton w-full">
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
