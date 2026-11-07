"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function iniciarSesion(_previo: { error: string }, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (error) return { error: "Correo o contraseña incorrectos." };

  const siguiente = String(formData.get("siguiente") ?? "/");
  // Solo rutas internas, para evitar redirecciones a otros sitios.
  redirect(siguiente.startsWith("/") && !siguiente.startsWith("//") ? siguiente : "/");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
