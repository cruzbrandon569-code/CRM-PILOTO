import Link from "next/link";
import { AlertTriangle, CalendarClock, Gauge, Target, ThermometerSnowflake, TrendingUp } from "lucide-react";
import { obtenerSesion } from "@/lib/sesion";
import { dinero, fechaHora, numero } from "@/lib/formato";
import { TIPOS_ACTIVIDAD } from "@/lib/catalogos";
import type { Actividad, Etapa, Oportunidad } from "@/lib/tipos";
import { Encabezado } from "@/components/ui";
import { TiempoReal } from "@/components/tiempo-real";

export default async function DashboardPage() {
  const { supabase, perfil } = await obtenerSesion();

  const ahora = new Date();
  const enSieteDias = new Date(ahora.getTime() + 7 * 86_400_000).toISOString();
  const hace90 = new Date(ahora.getTime() - 90 * 86_400_000).toISOString().slice(0, 10);

  const [{ data: etapas }, { data: oportunidades }, { data: proximas }, { count: vencidas }] = await Promise.all([
    supabase.from("etapas_pipeline").select("*").order("orden").returns<Etapa[]>(),
    supabase.from("oportunidades").select("*").returns<Oportunidad[]>(),
    supabase
      .from("actividades")
      .select("*, empresas(nombre)")
      .eq("completada", false)
      .gte("fecha", ahora.toISOString())
      .lte("fecha", enSieteDias)
      .order("fecha")
      .limit(6)
      .returns<Actividad[]>(),
    supabase
      .from("actividades")
      .select("id", { count: "exact", head: true })
      .eq("completada", false)
      .lt("fecha", ahora.toISOString()),
  ]);

  const listaEtapas = etapas ?? [];
  const lista = oportunidades ?? [];
  const etapaPorId = new Map(listaEtapas.map((e) => [e.id, e]));

  const abiertas = lista.filter((o) => {
    const e = etapaPorId.get(o.etapa_id);
    return e && !e.es_ganada && !e.es_perdida;
  });
  const ganadas = lista.filter((o) => etapaPorId.get(o.etapa_id)?.es_ganada);
  const perdidas = lista.filter((o) => etapaPorId.get(o.etapa_id)?.es_perdida);
  const ganadas90 = ganadas.filter((o) => (o.fecha_cierre_real ?? o.updated_at.slice(0, 10)) >= hace90);
  const perdidas90 = perdidas.filter((o) => (o.fecha_cierre_real ?? o.updated_at.slice(0, 10)) >= hace90);

  const valorAbierto = abiertas.reduce((s, o) => s + Number(o.monto_estimado), 0);
  const valorPonderado = abiertas.reduce(
    (s, o) => s + (Number(o.monto_estimado) * (etapaPorId.get(o.etapa_id)?.probabilidad ?? 0)) / 100,
    0,
  );
  const valorGanado90 = ganadas90.reduce((s, o) => s + Number(o.monto_estimado), 0);
  const cerradas90 = ganadas90.length + perdidas90.length;
  const tasaCierre = cerradas90 ? Math.round((ganadas90.length / cerradas90) * 100) : null;
  const trAbiertas = abiertas.reduce((s, o) => s + Number(o.toneladas_tr ?? 0), 0);

  const porEtapa = listaEtapas
    .filter((e) => !e.es_perdida)
    .map((e) => {
      const de = lista.filter((o) => o.etapa_id === e.id);
      return { etapa: e, cantidad: de.length, monto: de.reduce((s, o) => s + Number(o.monto_estimado), 0) };
    });
  const montoMaximo = Math.max(1, ...porEtapa.map((p) => p.monto));

  const kpis = [
    { titulo: "Pipeline abierto", valor: dinero(valorAbierto), detalle: `${abiertas.length} oportunidades`, icono: TrendingUp },
    { titulo: "Pronóstico ponderado", valor: dinero(valorPonderado), detalle: "monto × probabilidad de etapa", icono: Target },
    { titulo: "Ganado (90 días)", valor: dinero(valorGanado90), detalle: `${ganadas90.length} cerradas`, icono: Gauge },
    { titulo: "Tasa de cierre (90 días)", valor: tasaCierre === null ? "—" : `${tasaCierre}%`, detalle: `${cerradas90} decididas`, icono: Gauge },
    { titulo: "TR en pipeline", valor: `${numero(trAbiertas, 1)} TR`, detalle: "toneladas de refrigeración", icono: ThermometerSnowflake },
  ];

  return (
    <>
      <TiempoReal tablas={["oportunidades", "actividades"]} />
      <Encabezado titulo={`Hola, ${perfil?.nombre?.split(" ")[0] ?? ""}`} subtitulo="Resumen comercial de Ártica" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map(({ titulo, valor, detalle, icono: Icono }) => (
          <div key={titulo} className="tarjeta p-5">
            <div className="flex items-center justify-between text-slate-500">
              <p className="text-xs font-medium uppercase tracking-wide">{titulo}</p>
              <Icono size={16} />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{valor}</p>
            <p className="mt-1 text-xs text-slate-500">{detalle}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="tarjeta p-5 xl:col-span-2">
          <h2 className="mb-4 font-semibold">Monto por etapa</h2>
          <div className="space-y-3">
            {porEtapa.map(({ etapa, cantidad, monto }) => (
              <div key={etapa.id} className="grid grid-cols-[150px_1fr_110px] items-center gap-3 text-sm max-sm:grid-cols-[110px_1fr_90px]">
                <span className="truncate text-slate-600">{etapa.nombre}</span>
                <div className="h-6 rounded bg-slate-100">
                  <div
                    className="flex h-6 items-center rounded px-2 text-xs font-medium text-white"
                    style={{ width: `${Math.max(4, (monto / montoMaximo) * 100)}%`, backgroundColor: etapa.color }}
                  >
                    {cantidad || ""}
                  </div>
                </div>
                <span className="text-right tabular-nums">{dinero(monto)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="tarjeta p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Próximos 7 días</h2>
            <Link href="/actividades" className="text-xs text-marca-600 hover:underline">Ver agenda</Link>
          </div>
          {Boolean(vencidas) && (
            <Link href="/actividades" className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle size={15} /> {vencidas} actividades vencidas
            </Link>
          )}
          <ul className="space-y-3">
            {(proximas ?? []).map((a) => (
              <li key={a.id} className="flex gap-3">
                <CalendarClock size={16} className="mt-0.5 shrink-0 text-marca-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.titulo}</p>
                  <p className="text-xs text-slate-500">
                    {TIPOS_ACTIVIDAD[a.tipo]} · {fechaHora(a.fecha)}
                    {a.empresas?.nombre ? ` · ${a.empresas.nombre}` : ""}
                  </p>
                </div>
              </li>
            ))}
            {!proximas?.length && <li className="text-sm text-slate-500">Sin actividades próximas.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
