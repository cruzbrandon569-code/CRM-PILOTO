"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Vuelve a pedir los datos del servidor cuando alguien cambia estas tablas. */
export function TiempoReal({ tablas }: { tablas: string[] }) {
  const router = useRouter();
  const clave = tablas.join(",");

  useEffect(() => {
    const supabase = createClient();
    let pendiente: ReturnType<typeof setTimeout> | undefined;
    const canal = supabase.channel(`refrescar:${clave}`);

    for (const tabla of clave.split(",")) {
      canal.on("postgres_changes", { event: "*", schema: "public", table: tabla }, () => {
        clearTimeout(pendiente);
        pendiente = setTimeout(() => router.refresh(), 300);
      });
    }
    canal.subscribe();

    return () => {
      clearTimeout(pendiente);
      supabase.removeChannel(canal);
    };
  }, [clave, router]);

  return null;
}
