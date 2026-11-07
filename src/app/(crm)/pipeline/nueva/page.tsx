import Link from "next/link";
import { obtenerSesion } from "@/lib/sesion";
import type { Etapa } from "@/lib/tipos";
import { Encabezado } from "@/components/ui";
import { CamposOportunidad } from "@/components/campos-oportunidad";
import { crearOportunidad } from "../actions";

export default async function NuevaOportunidadPage({ searchParams }: PageProps<"/pipeline/nueva">) {
  const { supabase } = await obtenerSesion();
  const { empresa } = await searchParams;

  const [{ data: etapas }, { data: empresas }, { data: contactos }] = await Promise.all([
    supabase.from("etapas_pipeline").select("*").order("orden").returns<Etapa[]>(),
    supabase.from("empresas").select("id, nombre").order("nombre"),
    supabase.from("contactos").select("id, nombre, empresa_id, empresas(nombre)").order("nombre"),
  ]);

  return (
    <>
      <Link href="/pipeline" className="text-sm text-slate-500 hover:underline">← Pipeline</Link>
      <Encabezado titulo="Nueva oportunidad" />
      <form action={crearOportunidad} className="tarjeta space-y-5 p-6">
        <CamposOportunidad
          etapas={etapas ?? []}
          empresas={empresas ?? []}
          contactos={(contactos ?? []) as never}
          empresaInicial={typeof empresa === "string" ? empresa : undefined}
        />
        <button className="boton">Crear oportunidad</button>
      </form>
    </>
  );
}
