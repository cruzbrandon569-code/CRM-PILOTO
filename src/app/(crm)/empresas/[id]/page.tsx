import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Star } from "lucide-react";
import { obtenerSesion, puede, ROLES_ESCRITURA } from "@/lib/sesion";
import { dinero, fechaHora } from "@/lib/formato";
import { TIPOS_ACTIVIDAD } from "@/lib/catalogos";
import type { Actividad, Contacto, Empresa, Etapa, Oportunidad } from "@/lib/tipos";
import { Desplegable, Encabezado, Insignia, Vacio } from "@/components/ui";
import { CamposContacto, CamposEmpresa } from "@/components/campos";
import { BotonBorrar } from "@/components/boton-borrar";
import { actualizarEmpresa, borrarContacto, borrarEmpresa, crearContacto } from "../actions";

export default async function EmpresaPage({ params }: PageProps<"/empresas/[id]">) {
  const { id } = await params;
  const { supabase, perfil } = await obtenerSesion();

  const [{ data: empresa }, { data: contactos }, { data: oportunidades }, { data: actividades }] = await Promise.all([
    supabase.from("empresas").select("*").eq("id", id).maybeSingle<Empresa>(),
    supabase.from("contactos").select("*").eq("empresa_id", id).order("es_principal", { ascending: false }).returns<Contacto[]>(),
    supabase
      .from("oportunidades")
      .select("*, etapas_pipeline(nombre, color)")
      .eq("empresa_id", id)
      .order("created_at", { ascending: false })
      .returns<(Oportunidad & { etapas_pipeline: Pick<Etapa, "nombre" | "color"> })[]>(),
    supabase.from("actividades").select("*").eq("empresa_id", id).order("fecha", { ascending: false }).limit(10).returns<Actividad[]>(),
  ]);

  if (!empresa) notFound();
  const editable = puede(perfil, ROLES_ESCRITURA);

  return (
    <>
      <Link href="/empresas" className="text-sm text-slate-500 hover:underline">← Empresas</Link>
      <Encabezado
        titulo={empresa.nombre}
        subtitulo={[empresa.giro, empresa.ciudad].filter(Boolean).join(" · ")}
        acciones={
          <>
            <Link href={`/pipeline/nueva?empresa=${empresa.id}`} className="boton">Nueva oportunidad</Link>
            {puede(perfil, ["dueno", "gerente"]) && (
              <BotonBorrar
                accion={borrarEmpresa.bind(null, empresa.id)}
                mensaje="¿Borrar esta empresa con sus contactos y actividades? No se puede deshacer."
              />
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="tarjeta">
            <h2 className="border-b border-slate-100 px-5 py-3 font-semibold">Oportunidades</h2>
            {(oportunidades ?? []).map((o) => (
              <Link key={o.id} href={`/pipeline/${o.id}`} className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3 last:border-0 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.titulo}</p>
                  <p className="text-xs text-slate-500">{o.codigo}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Insignia color={o.etapas_pipeline.color}>{o.etapas_pipeline.nombre}</Insignia>
                  <span className="text-sm tabular-nums">{dinero(o.monto_estimado, o.moneda)}</span>
                </div>
              </Link>
            ))}
            {!oportunidades?.length && <Vacio>Sin oportunidades todavía.</Vacio>}
          </section>

          <section className="tarjeta">
            <h2 className="border-b border-slate-100 px-5 py-3 font-semibold">Contactos</h2>
            {(contactos ?? []).map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 last:border-0">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    {c.nombre} {c.es_principal && <Star size={13} className="fill-amber-400 text-amber-400" />}
                  </p>
                  <p className="text-xs text-slate-500">{c.cargo ?? "—"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  {c.telefono && <a href={`tel:${c.telefono}`} className="flex items-center gap-1 hover:text-marca-700"><Phone size={13} />{c.telefono}</a>}
                  {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-marca-700"><Mail size={13} />{c.email}</a>}
                  {puede(perfil, ["dueno", "gerente"]) && (
                    <BotonBorrar accion={borrarContacto.bind(null, c.id)} mensaje={`¿Borrar a ${c.nombre}?`} texto="" />
                  )}
                </div>
              </div>
            ))}
            {!contactos?.length && <Vacio>Sin contactos.</Vacio>}
            {editable && (
              <details className="border-t border-slate-100">
                <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-marca-700">＋ Agregar contacto</summary>
                <form action={crearContacto} className="space-y-4 px-5 pb-5">
                  <CamposContacto empresaFija={empresa.id} />
                  <button className="boton">Guardar contacto</button>
                </form>
              </details>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="tarjeta">
            <h2 className="border-b border-slate-100 px-5 py-3 font-semibold">Actividad reciente</h2>
            <ul className="divide-y divide-slate-100">
              {(actividades ?? []).map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <p className={`text-sm ${a.completada ? "text-slate-400 line-through" : "font-medium"}`}>{a.titulo}</p>
                  <p className="text-xs text-slate-500">{TIPOS_ACTIVIDAD[a.tipo]} · {fechaHora(a.fecha)}</p>
                </li>
              ))}
            </ul>
            {!actividades?.length && <Vacio>Sin actividades.</Vacio>}
          </section>
          {empresa.notas && (
            <section className="tarjeta p-5">
              <h2 className="mb-2 font-semibold">Notas técnicas</h2>
              <p className="whitespace-pre-line text-sm text-slate-600">{empresa.notas}</p>
            </section>
          )}
        </div>
      </div>

      {editable && (
        <div className="mt-6">
          <Desplegable texto="Editar datos de la empresa">
            <form action={actualizarEmpresa.bind(null, empresa.id)} className="space-y-4">
              <CamposEmpresa empresa={empresa} />
              <button className="boton">Guardar cambios</button>
            </form>
          </Desplegable>
        </div>
      )}
    </>
  );
}
