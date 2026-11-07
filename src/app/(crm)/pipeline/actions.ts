"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { numeroDe, revisar, texto } from "@/lib/formularios";

function datosOportunidad(fd: FormData) {
  return {
    titulo: texto(fd, "titulo") ?? "Sin título",
    empresa_id: texto(fd, "empresa_id"),
    contacto_id: texto(fd, "contacto_id"),
    etapa_id: Number(fd.get("etapa_id")),
    monto_estimado: numeroDe(fd, "monto_estimado") ?? 0,
    moneda: texto(fd, "moneda") ?? "MXN",
    tipo_proyecto: texto(fd, "tipo_proyecto"),
    tipo_sistema: texto(fd, "tipo_sistema"),
    toneladas_tr: numeroDe(fd, "toneladas_tr"),
    origen: texto(fd, "origen"),
    fecha_cierre_estimada: texto(fd, "fecha_cierre_estimada"),
    motivo_perdida: texto(fd, "motivo_perdida"),
    notas: texto(fd, "notas"),
  };
}

/** Si la etapa es de cierre, registra la fecha real de cierre (o la limpia si se reabre). */
async function conCierre(supabase: Awaited<ReturnType<typeof createClient>>, etapaId: number) {
  const { data: etapa } = await supabase.from("etapas_pipeline").select("es_ganada, es_perdida").eq("id", etapaId).single();
  const cerrada = etapa?.es_ganada || etapa?.es_perdida;
  return { fecha_cierre_real: cerrada ? new Date().toISOString().slice(0, 10) : null };
}

export async function crearOportunidad(fd: FormData) {
  const supabase = await createClient();
  const datos = datosOportunidad(fd);
  const { data } = revisar(
    await supabase
      .from("oportunidades")
      .insert({ ...datos, ...(await conCierre(supabase, datos.etapa_id)) })
      .select("id")
      .single(),
  );
  revalidatePath("/pipeline");
  redirect(`/pipeline/${data!.id}`);
}

export async function actualizarOportunidad(id: string, fd: FormData) {
  const supabase = await createClient();
  const datos = datosOportunidad(fd);
  const { data: actual } = await supabase.from("oportunidades").select("etapa_id").eq("id", id).single();
  const cambioEtapa = actual?.etapa_id !== datos.etapa_id ? await conCierre(supabase, datos.etapa_id) : {};
  revisar(await supabase.from("oportunidades").update({ ...datos, ...cambioEtapa }).eq("id", id));
  revalidatePath(`/pipeline/${id}`);
  revalidatePath("/pipeline");
}

export async function moverOportunidad(id: string, etapaId: number, motivoPerdida?: string) {
  const supabase = await createClient();
  const cambios: Record<string, unknown> = { etapa_id: etapaId, ...(await conCierre(supabase, etapaId)) };
  if (motivoPerdida !== undefined) cambios.motivo_perdida = motivoPerdida || null;
  const { error } = await supabase.from("oportunidades").update(cambios).eq("id", id);
  revalidatePath("/pipeline");
  revalidatePath("/");
  return { error: error?.message ?? null };
}

export async function borrarOportunidad(id: string) {
  const supabase = await createClient();
  revisar(await supabase.from("oportunidades").delete().eq("id", id));
  revalidatePath("/pipeline");
  redirect("/pipeline");
}
