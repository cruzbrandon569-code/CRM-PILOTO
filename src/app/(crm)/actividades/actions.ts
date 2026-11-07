"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DESFASE_ZONA } from "@/lib/formato";
import { numeroDe, revisar, texto } from "@/lib/formularios";

export async function crearActividad(fd: FormData) {
  const supabase = await createClient();
  const oportunidadId = texto(fd, "oportunidad_id");
  let empresaId = texto(fd, "empresa_id");

  // Si viene de la agenda, la empresa se toma de la oportunidad elegida.
  if (oportunidadId && !empresaId) {
    const { data } = await supabase.from("oportunidades").select("empresa_id").eq("id", oportunidadId).single();
    empresaId = data?.empresa_id ?? null;
  }

  revisar(
    await supabase.from("actividades").insert({
      tipo: texto(fd, "tipo") ?? "tarea",
      titulo: texto(fd, "titulo") ?? "Sin título",
      descripcion: texto(fd, "descripcion"),
      // El input datetime-local no trae zona horaria: se interpreta como hora local de la empresa.
      fecha: `${texto(fd, "fecha")}:00${DESFASE_ZONA}`,
      duracion_min: numeroDe(fd, "duracion_min"),
      ubicacion: texto(fd, "ubicacion"),
      oportunidad_id: oportunidadId,
      empresa_id: empresaId,
      contacto_id: texto(fd, "contacto_id"),
    }),
  );

  revalidatePath("/actividades");
  revalidatePath("/");
  if (oportunidadId) revalidatePath(`/pipeline/${oportunidadId}`);
}

export async function alternarCompletada(id: string, completada: boolean) {
  const supabase = await createClient();
  revisar(await supabase.from("actividades").update({ completada }).eq("id", id));
  revalidatePath("/actividades");
  revalidatePath("/");
}

export async function borrarActividad(id: string) {
  const supabase = await createClient();
  revisar(await supabase.from("actividades").delete().eq("id", id));
  revalidatePath("/actividades");
}
