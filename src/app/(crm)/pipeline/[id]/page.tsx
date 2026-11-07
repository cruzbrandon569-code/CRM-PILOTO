import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerSesion, puede, ROLES_ESCRITURA } from "@/lib/sesion";
import { dinero, fecha, fechaHora, numero } from "@/lib/formato";
import { ESTADOS_COTIZACION, TIPOS_ACTIVIDAD, TIPOS_PROYECTO, TIPOS_SISTEMA } from "@/lib/catalogos";
import { totales } from "@/lib/cotizacion";
import type { Actividad, Cotizacion, Etapa, Oportunidad, Partida } from "@/lib/tipos";
import { colorEstado, Desplegable, Encabezado, Insignia, Vacio } from "@/components/ui";
import { CamposOportunidad } from "@/components/campos-oportunidad";
import { BotonBorrar } from "@/components/boton-borrar";
import { CamposActividad } from "@/components/campos-actividad";
import { actualizarOportunidad, borrarOportunidad } from "../actions";
import { crearActividad } from "../../actividades/actions";
import { crearCotizacion } from "../../cotizaciones/actions";

export default async function OportunidadPage({ params }: PageProps<"/pipeline/[id]">) {
  const { id } = await params;
  const { supabase, perfil } = await obtenerSesion();

  const [{ data: o }, { data: etapas }, { data: empresas }, { data: contactos }, { data: actividades }, { data: cotizaciones }] =
    await Promise.all([
      supabase
        .from("oportunidades")
        .select("*, empresas(nombre), contactos(nombre, telefono, email)")
        .eq("id", id)
        .maybeSingle<Oportunidad & { contactos: { nombre: string; telefono: string | null; email: string | null } | null }>(),
      supabase.from("etapas_pipeline").select("*").order("orden").returns<Etapa[]>(),
      supabase.from("empresas").select("id, nombre").order("nombre"),
      supabase.from("contactos").select("id, nombre, empresa_id, empresas(nombre)").order("nombre"),
      supabase.from("actividades").select("*").eq("oportunidad_id", id).order("fecha", { ascending: false }).returns<Actividad[]>(),
      supabase
        .from("cotizaciones")
        .select("*, cotizacion_partidas(cantidad, precio_unitario)")
        .eq("oportunidad_id", id)
        .order("created_at", { ascending: false })
        .returns<(Cotizacion & { cotizacion_partidas: Partida[] })[]>(),
    ]);

  if (!o) notFound();
  const etapa = (etapas ?? []).find((e) => e.id === o.etapa_id);
  const editable = puede(perfil, ROLES_ESCRITURA);

  const datos = [
    ["Empresa", o.empresa_id ? <Link key="e" href={`/empresas/${o.empresa_id}`} className="text-marca-700 hover:underline">{o.empresas?.nombre}</Link> : "—"],
    ["Contacto", o.contactos ? `${o.contactos.nombre}${o.contactos.telefono ? ` · ${o.contactos.telefono}` : ""}` : "—"],
    ["Monto estimado", dinero(o.monto_estimado, o.moneda)],
    ["Cierre estimado", fecha(o.fecha_cierre_estimada)],
    ["Tipo de proyecto", o.tipo_proyecto ? TIPOS_PROYECTO[o.tipo_proyecto] : "—"],
    ["Sistema", o.tipo_sistema ? TIPOS_SISTEMA[o.tipo_sistema] : "—"],
    ["Capacidad", o.toneladas_tr ? `${numero(o.toneladas_tr, 1)} TR` : "—"],
    ["Origen", o.origen ?? "—"],
    ...(o.fecha_cierre_real ? [["Cerrada el", fecha(o.fecha_cierre_real)]] : []),
    ...(o.motivo_perdida ? [["Motivo de pérdida", o.motivo_perdida]] : []),
  ] as const;

  return (
    <>
      <Link href="/pipeline" className="text-sm text-slate-500 hover:underline">← Pipeline</Link>
      <Encabezado
        titulo={o.titulo}
        subtitulo={o.codigo}
        acciones={
          <>
            {etapa && <span className="self-center"><Insignia color={etapa.color}>{etapa.nombre}</Insignia></span>}
            {editable && (
              <form action={crearCotizacion.bind(null, o.id)}>
                <button className="boton">Nueva cotización</button>
              </form>
            )}
            {puede(perfil, ["dueno", "gerente"]) && (
              <BotonBorrar accion={borrarOportunidad.bind(null, o.id)} mensaje="¿Borrar esta oportunidad y sus actividades?" />
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="tarjeta p-5">
          <dl className="space-y-3 text-sm">
            {datos.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          {o.notas && <p className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm text-slate-600">{o.notas}</p>}
        </section>

        <div className="space-y-6 xl:col-span-2">
          <section className="tarjeta">
            <h2 className="border-b border-slate-100 px-5 py-3 font-semibold">Cotizaciones</h2>
            {(cotizaciones ?? []).map((c) => (
              <Link key={c.id} href={`/cotizaciones/${c.id}`} className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3 last:border-0 hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium">{c.folio} v{c.version}</p>
                  <p className="text-xs text-slate-500">{fecha(c.fecha_emision)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Insignia color={colorEstado(c.estado)}>{ESTADOS_COTIZACION[c.estado]}</Insignia>
                  <span className="text-sm tabular-nums">{dinero(totales(c.cotizacion_partidas, c.descuento_pct, c.iva_pct).total, c.moneda)}</span>
                </div>
              </Link>
            ))}
            {!cotizaciones?.length && <Vacio>Sin cotizaciones.</Vacio>}
          </section>

          <section className="tarjeta">
            <h2 className="border-b border-slate-100 px-5 py-3 font-semibold">Actividades</h2>
            <ul className="divide-y divide-slate-100">
              {(actividades ?? []).map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <p className={`text-sm ${a.completada ? "text-slate-400 line-through" : "font-medium"}`}>{a.titulo}</p>
                  <p className="text-xs text-slate-500">{TIPOS_ACTIVIDAD[a.tipo]} · {fechaHora(a.fecha)}{a.ubicacion ? ` · ${a.ubicacion}` : ""}</p>
                </li>
              ))}
            </ul>
            {!actividades?.length && <Vacio>Sin actividades.</Vacio>}
            {puede(perfil, ["dueno", "gerente", "comercial", "operativo"]) && (
              <details className="border-t border-slate-100">
                <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-marca-700">＋ Programar actividad</summary>
                <form action={crearActividad} className="space-y-4 px-5 pb-5">
                  <input type="hidden" name="oportunidad_id" value={o.id} />
                  <input type="hidden" name="empresa_id" value={o.empresa_id ?? ""} />
                  <input type="hidden" name="contacto_id" value={o.contacto_id ?? ""} />
                  <CamposActividad />
                  <button className="boton">Guardar actividad</button>
                </form>
              </details>
            )}
          </section>
        </div>
      </div>

      {editable && (
        <div className="mt-6">
          <Desplegable texto="Editar oportunidad">
            <form action={actualizarOportunidad.bind(null, o.id)} className="space-y-4">
              <CamposOportunidad oportunidad={o} etapas={etapas ?? []} empresas={empresas ?? []} contactos={(contactos ?? []) as never} />
              <button className="boton">Guardar cambios</button>
            </form>
          </Desplegable>
        </div>
      )}
    </>
  );
}
