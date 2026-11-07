import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Perfil, Rol } from "@/lib/tipos";

/** Usuario y perfil de la petición actual (una sola consulta por render). */
export const obtenerSesion = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id, nombre, email, rol")
    .eq("id", user.id)
    .single<Perfil>();

  return { supabase, user, perfil };
});

export const ROLES_ESCRITURA: Rol[] = ["dueno", "gerente", "comercial"];

export function puede(perfil: Perfil | null, roles: Rol[]) {
  return Boolean(perfil?.rol && roles.includes(perfil.rol));
}
