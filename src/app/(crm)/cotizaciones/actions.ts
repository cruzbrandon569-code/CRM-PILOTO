"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revisar } from "@/lib/formularios";
import type { Partida } from "@/lib/tipos";

async function condicionesDefault(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from("configuracion_empresa").select("condiciones_default").eq("id", 1).maybeSingle();
  return data?.condiciones_default ?? null;
}

/** Crea una cotización en borrador; si viene de una oportunidad, hereda empresa, contacto y título. */
export async function crearCotizacion(oportunidadId: string | null) {
  const supabase = await createClient();
  let base = { titulo: "Nueva cotización", empresa_id: null as string | null, contacto_id: null as string | null, moneda: "MXN" };

  if (oportunidadId) {
    const { data: o } = await supabase
      .from("oportunidades")
      .select("titulo, empresa_id, contacto_id, moneda")
      .eq("id", oportunidadId)
      .single();
    if (o) base = o;
  }

  const { data } = revisar(
    await supabase
      .from("cotizaciones")
      .insert({ ...base, oportunidad_id: oportunidadId, condiciones: await condicionesDefault(supabase) })
      .select("id")
      .single(),
  );
  revalidatePath("/cotizaciones");
  redirect(`/cotizaciones/${data!.id}`);
}

export interface DatosCotizacion {
  titulo: string;
  empresa_id: string | null;
  contacto_id: string | null;
  oportunidad_id: string | null;
  estado: string;
  fecha_emision: string;
  vigencia_dias: number;
  moneda: string;
  descuento_pct: number;
  iva_pct: number;
  condiciones: string | null;
  notas: string | null;
}

export async function guardarCotizacion(id: string, datos: DatosCotizacion, partidas: Partida[]) {
  const supabase = await createClient();

  const { error } = await supabase.from("cotizaciones").update(datos).eq("id", id);
  if (error) return { error: error.message };

  // Las partidas se reemplazan completas: es una lista corta y así el orden siempre coincide con la pantalla.
  const borrado = await supabase.from("cotizacion_partidas").delete().eq("cotizacion_id", id);
  if (borrado.error) return { error: borrado.error.message };

  const filas = partidas
    .filter((p) => p.descripcion.trim())
    .map((p, i) => ({
      cotizacion_id: id,
      orden: i + 1,
      categoria: p.categoria,
      descripcion: p.descripcion.trim(),
      unidad: p.unidad || "pza",
      cantidad: Number(p.cantidad) || 0,
      precio_unitario: Number(p.precio_unitario) || 0,
    }));
  if (filas.length) {
    const insertado = await supabase.from("cotizacion_partidas").insert(filas);
    if (insertado.error) return { error: insertado.error.message };
  }

  revalidatePath(`/cotizaciones/${id}`);
  revalidatePath("/cotizaciones");
  return { error: null };
}

/** Copia la cotización como nueva versión (mismo folio) para no perder lo que ya se envió. */
export async function nuevaVersion(id: string) {
  const supabase = await createClient();
  const { data: original } = revisar(await supabase.from("cotizaciones").select("*").eq("id", id).single());
  const { data: partidas } = await supabase.from("cotizacion_partidas").select("*").eq("cotizacion_id", id).order("orden");
  const { data: ultima } = await supabase
    .from("cotizaciones")
    .select("version")
    .eq("folio", original.folio)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { id: _id, created_at, updated_at, created_by, ...resto } = original;
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const { data: copia } = revisar(
    await supabase
      .from("cotizaciones")
      .insert({ ...resto, version: (ultima?.version ?? original.version) + 1, estado: "borrador", fecha_emision: new Date().toISOString().slice(0, 10) })
      .select("id")
      .single(),
  );

  if (partidas?.length) {
    revisar(
      await supabase.from("cotizacion_partidas").insert(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        partidas.map(({ id: _p, cotizacion_id, ...p }) => ({ ...p, cotizacion_id: copia!.id })),
      ),
    );
  }

  revalidatePath("/cotizaciones");
  redirect(`/cotizaciones/${copia!.id}`);
}

export async function borrarCotizacion(id: string) {
  const supabase = await createClient();
  revisar(await supabase.from("cotizaciones").delete().eq("id", id));
  revalidatePath("/cotizaciones");
  redirect("/cotizaciones");
}
