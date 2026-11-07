import { notFound } from "next/navigation";
import { Snowflake } from "lucide-react";
import { obtenerSesion } from "@/lib/sesion";
import { dineroExacto, fecha, numero } from "@/lib/formato";
import { CATEGORIAS_PARTIDA } from "@/lib/catalogos";
import { totales } from "@/lib/cotizacion";
import type { Cotizacion, Partida } from "@/lib/tipos";
import { BotonImprimir } from "./boton-imprimir";

interface Configuracion {
  nombre: string;
  razon_social: string | null;
  rfc: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  sitio_web: string | null;
  logo_url: string | null;
}

export default async function ImprimirCotizacionPage({ params }: PageProps<"/imprimir/cotizacion/[id]">) {
  const { id } = await params;
  const { supabase } = await obtenerSesion();

  const [{ data: c }, { data: partidas }, { data: config }] = await Promise.all([
    supabase
      .from("cotizaciones")
      .select("*, empresas(nombre, direccion, ciudad, rfc), contactos(nombre, cargo, email, telefono)")
      .eq("id", id)
      .maybeSingle<
        Cotizacion & {
          empresas: { nombre: string; direccion: string | null; ciudad: string | null; rfc: string | null } | null;
          contactos: { nombre: string; cargo: string | null; email: string | null; telefono: string | null } | null;
        }
      >(),
    supabase.from("cotizacion_partidas").select("*").eq("cotizacion_id", id).order("orden").returns<Partida[]>(),
    supabase.from("configuracion_empresa").select("*").eq("id", 1).maybeSingle<Configuracion>(),
  ]);

  if (!c) notFound();
  const lista = partidas ?? [];
  const t = totales(lista, c.descuento_pct, c.iva_pct);
  const vence = new Date(`${c.fecha_emision}T12:00:00`);
  vence.setDate(vence.getDate() + c.vigencia_dias);

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-white print:py-0">
      <div className="no-imprimir mx-auto mb-4 flex max-w-[210mm] justify-end gap-2 px-4">
        <BotonImprimir />
      </div>

      <article className="mx-auto max-w-[210mm] bg-white px-[16mm] py-[14mm] text-[12px] leading-relaxed text-slate-800 shadow-lg print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between border-b-2 border-marca-600 pb-5">
          <div className="flex items-center gap-3">
            {config?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.logo_url} alt="" className="h-14 w-auto" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-marca-600 text-white">
                <Snowflake size={26} />
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-marca-800">{config?.nombre}</p>
              {config?.razon_social && <p className="text-slate-500">{config.razon_social}{config.rfc ? ` · RFC ${config.rfc}` : ""}</p>}
              <p className="text-slate-500">{[config?.direccion, config?.telefono, config?.email].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold tracking-wide text-marca-700">COTIZACIÓN</p>
            <p className="font-medium">{c.folio}{c.version > 1 ? ` · Rev. ${c.version}` : ""}</p>
            <p className="text-slate-500">Emisión: {fecha(c.fecha_emision)}</p>
            <p className="text-slate-500">Vigencia: {fecha(vence.toISOString())}</p>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cliente</p>
            <p className="font-semibold">{c.empresas?.nombre ?? "—"}</p>
            {c.empresas?.rfc && <p>RFC {c.empresas.rfc}</p>}
            <p className="text-slate-600">{[c.empresas?.direccion, c.empresas?.ciudad].filter(Boolean).join(", ")}</p>
          </div>
          {c.contactos && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Atención</p>
              <p className="font-semibold">{c.contactos.nombre}</p>
              {c.contactos.cargo && <p>{c.contactos.cargo}</p>}
              <p className="text-slate-600">{[c.contactos.email, c.contactos.telefono].filter(Boolean).join(" · ")}</p>
            </div>
          )}
        </section>

        <h1 className="mt-6 text-sm font-semibold">{c.titulo}</h1>

        <table className="mt-3 w-full border-collapse">
          <thead>
            <tr className="bg-marca-50 text-left text-[10px] uppercase tracking-wider text-marca-800">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Descripción</th>
              <th className="px-2 py-2">Unidad</th>
              <th className="px-2 py-2 text-right">Cant.</th>
              <th className="px-2 py-2 text-right">P. unitario</th>
              <th className="px-2 py-2 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p, i) => (
              <tr key={p.id ?? i} className="break-inside-avoid border-b border-slate-100 align-top">
                <td className="px-2 py-2 text-slate-400">{i + 1}</td>
                <td className="px-2 py-2">
                  <span className="mr-1 text-[10px] font-medium uppercase text-marca-600">{CATEGORIAS_PARTIDA[p.categoria]}</span>
                  <span className="whitespace-pre-line">{p.descripcion}</span>
                </td>
                <td className="px-2 py-2">{p.unidad}</td>
                <td className="px-2 py-2 text-right tabular-nums">{numero(p.cantidad, 2)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{dineroExacto(p.precio_unitario, c.moneda)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{dineroExacto(Number(p.cantidad) * Number(p.precio_unitario), c.moneda)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <dl className="w-64 space-y-1">
            <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="tabular-nums">{dineroExacto(t.subtotal, c.moneda)}</dd></div>
            {t.descuento > 0 && (
              <div className="flex justify-between"><dt className="text-slate-500">Descuento {numero(c.descuento_pct, 2)}%</dt><dd className="tabular-nums">− {dineroExacto(t.descuento, c.moneda)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-slate-500">IVA {numero(c.iva_pct, 2)}%</dt><dd className="tabular-nums">{dineroExacto(t.iva, c.moneda)}</dd></div>
            <div className="flex justify-between border-t-2 border-marca-600 pt-1 text-sm font-semibold"><dt>Total {c.moneda}</dt><dd className="tabular-nums">{dineroExacto(t.total, c.moneda)}</dd></div>
          </dl>
        </div>

        {c.condiciones && (
          <section className="mt-8 break-inside-avoid">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Condiciones comerciales</p>
            <p className="mt-1 whitespace-pre-line text-slate-600">{c.condiciones}</p>
          </section>
        )}

        <footer className="mt-12 grid grid-cols-2 gap-10 break-inside-avoid text-center text-slate-500">
          <div className="border-t border-slate-300 pt-2">{config?.nombre}</div>
          <div className="border-t border-slate-300 pt-2">Aceptación del cliente</div>
        </footer>
      </article>
    </div>
  );
}
