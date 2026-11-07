"use client";

import { Trash2 } from "lucide-react";

export function BotonBorrar({ accion, mensaje, texto = "Borrar" }: { accion: () => Promise<void>; mensaje: string; texto?: string }) {
  return (
    <form
      action={accion}
      onSubmit={(e) => {
        if (!confirm(mensaje)) e.preventDefault();
      }}
    >
      <button type="submit" className="boton-peligro">
        <Trash2 size={14} /> {texto}
      </button>
    </form>
  );
}
