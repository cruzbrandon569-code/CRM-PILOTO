"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revisar, texto } from "@/lib/formularios";

function datosEmpresa(fd: FormData) {
  return {
    nombre: texto(fd, "nombre") ?? "Sin nombre",
    rfc: texto(fd, "rfc"),
    giro: texto(fd, "giro"),
    telefono: texto(fd, "telefono"),
    email: texto(fd, "email"),
    sitio_web: texto(fd, "sitio_web"),
    direccion: texto(fd, "direccion"),
    ciudad: texto(fd, "ciudad"),
    notas: texto(fd, "notas"),
  };
}

function datosContacto(fd: FormData) {
  return {
    empresa_id: texto(fd, "empresa_id"),
    nombre: texto(fd, "nombre") ?? "Sin nombre",
    cargo: texto(fd, "cargo"),
    telefono: texto(fd, "telefono"),
    email: texto(fd, "email"),
    es_principal: fd.get("es_principal") === "on",
  };
}

export async function crearEmpresa(fd: FormData) {
  const supabase = await createClient();
  const { data } = revisar(await supabase.from("empresas").insert(datosEmpresa(fd)).select("id").single());
  revalidatePath("/empresas");
  redirect(`/empresas/${data!.id}`);
}

export async function actualizarEmpresa(id: string, fd: FormData) {
  const supabase = await createClient();
  revisar(await supabase.from("empresas").update(datosEmpresa(fd)).eq("id", id));
  revalidatePath(`/empresas/${id}`);
  revalidatePath("/empresas");
}

export async function borrarEmpresa(id: string) {
  const supabase = await createClient();
  revisar(await supabase.from("empresas").delete().eq("id", id));
  revalidatePath("/empresas");
  redirect("/empresas");
}

export async function crearContacto(fd: FormData) {
  const supabase = await createClient();
  const datos = datosContacto(fd);
  revisar(await supabase.from("contactos").insert(datos));
  revalidatePath("/contactos");
  if (datos.empresa_id) revalidatePath(`/empresas/${datos.empresa_id}`);
}

export async function actualizarContacto(id: string, fd: FormData) {
  const supabase = await createClient();
  const datos = datosContacto(fd);
  revisar(await supabase.from("contactos").update(datos).eq("id", id));
  revalidatePath("/contactos");
  if (datos.empresa_id) revalidatePath(`/empresas/${datos.empresa_id}`);
}

export async function borrarContacto(id: string) {
  const supabase = await createClient();
  revisar(await supabase.from("contactos").delete().eq("id", id));
  revalidatePath("/contactos");
  revalidatePath("/empresas", "layout");
}
