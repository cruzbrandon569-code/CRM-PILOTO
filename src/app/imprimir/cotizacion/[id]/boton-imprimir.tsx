"use client";

import { Printer } from "lucide-react";

export function BotonImprimir() {
  return (
    <button onClick={() => window.print()} className="boton">
      <Printer size={15} /> Descargar PDF / Imprimir
    </button>
  );
}
