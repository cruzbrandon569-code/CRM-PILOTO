import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, Printer } from "lucide-react";
import { obtenerSesion, puede, ROLES_ESCRITURA } from "@/lib/sesion";
import type { Cotizacion, Partida } from "@/lib/tipos";
import { Encabezado } from "@/components/ui";
import { BotonBorrar } from "@/components/boton-borrar";
import { EditorCotizacion } from "@/components/editor-cotizacion";
import { borrarCotizacion, nuevaVersion } from "../actions";

export default async function CotizacionPage({ params }: PageProps<"/cotizaciones/[id]">) {
  const { id } = await params;
  const { supabase, perfil } = await obtenerSesion();

  const [{ data: cotizacion }, { data: partidas }, { data: empresas }, { data: contactos }, { data: oportunidades }, { data: versiones }] =
    await Promise.all([
      supabase.from("cotizaciones").select("*").eq("id", id).maybeSingle<Cotizacion>(),
      supabase.from("cotizacion_partidas").select("*").eq("cotizacion_id", id).order("orden").returns<Partida[]>(),
      supabase.from("empresas").select("id, nombre").order("nombre"),
      supabase.from("contactos").select("id, nombre, empresa_id").order("nombre"),
      supabase.from("oportunidades").select("id, codigo, titulo").order("codigo"),
      supabase.from("cotizaciones").select("id, version, folio").order("version"),
    ]);

  if (!cotizacion) notFound();
  const otrasVersiones = (versiones ?? []).filter((v) => v.folio === cotizacion.folio);

  return (
    <>
      <Link href="/cotizaciones" className="text-sm text-slate-500 hover:underline">← Cotizaciones</Link>
      <Encabezado
        titulo={`${cotizacion.folio} · versión ${cotizacion.version}`}
        subtitulo={cotizacion.titulo}
        acciones={
          <>
            <Link href={`/imprimir/cotizacion/${cotizacion.id}`} target="_blank" className="boton-secundario">
              <Printer size={15} /> PDF / Imprimir
            </Link>
            {puede(perfil, ROLES_ESCRITURA) && (
              <form action={nuevaVersion.bind(null, cotizacion.id)}>
                <button className="boton-secundario"><Copy size={15} /> Nueva versión</button>
              </form>
            )}
            {puede(perfil, ["dueno", "gerente"]) && (
              <BotonBorrar accion={borrarCotizacion.bind(null, cotizacion.id)} mensaje="¿Borrar esta versión de la cotización?" />
            )}
          </>
        }
      />

      {otrasVersiones.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Versiones:</span>
          {otrasVersiones.map((v) => (
            <Link
              key={v.id}
              href={`/cotizaciones/${v.id}`}
              className={`rounded px-2 py-0.5 ${v.id === cotizacion.id ? "bg-marca-600 text-white" : "bg-white shadow-sm"}`}
            >
              v{v.version}
            </Link>
          ))}
        </div>
      )}

      <EditorCotizacion
        cotizacion={cotizacion}
        partidasIniciales={partidas ?? []}
        empresas={empresas ?? []}
        contactos={contactos ?? []}
        oportunidades={oportunidades ?? []}
        editable={puede(perfil, ROLES_ESCRITURA)}
      />
    </>
  );
}
