import Link from "next/link";
import { obtenerSesion, puede, ROLES_ESCRITURA } from "@/lib/sesion";
import type { Etapa, Oportunidad } from "@/lib/tipos";
import { Encabezado } from "@/components/ui";
import { TiempoReal } from "@/components/tiempo-real";
import { Kanban } from "@/components/kanban";

export default async function PipelinePage() {
  const { supabase, perfil } = await obtenerSesion();

  const [{ data: etapas }, { data: oportunidades }] = await Promise.all([
    supabase.from("etapas_pipeline").select("*").order("orden").returns<Etapa[]>(),
    supabase
      .from("oportunidades")
      .select("*, empresas(nombre)")
      .order("fecha_cierre_estimada", { ascending: true, nullsFirst: false })
      .returns<Oportunidad[]>(),
  ]);

  const editable = puede(perfil, ROLES_ESCRITURA);

  return (
    <>
      <TiempoReal tablas={["oportunidades"]} />
      <Encabezado
        titulo="Pipeline"
        subtitulo="Arrastra las tarjetas para cambiarlas de etapa"
        acciones={editable && <Link href="/pipeline/nueva" className="boton">Nueva oportunidad</Link>}
      />
      <Kanban etapas={etapas ?? []} oportunidades={oportunidades ?? []} editable={editable} />
    </>
  );
}
