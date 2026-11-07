import Link from "next/link";
import { CheckCircle2, Circle, MapPin } from "lucide-react";
import { obtenerSesion, puede } from "@/lib/sesion";
import { fecha, fechaHora } from "@/lib/formato";
import { TIPOS_ACTIVIDAD } from "@/lib/catalogos";
import type { Actividad } from "@/lib/tipos";
import { Desplegable, Encabezado, Vacio } from "@/components/ui";
import { CamposActividad } from "@/components/campos-actividad";
import { TiempoReal } from "@/components/tiempo-real";
import { alternarCompletada, crearActividad } from "./actions";

const VISTAS = { pendientes: "Pendientes", completadas: "Completadas" } as const;

export default async function ActividadesPage({ searchParams }: PageProps<"/actividades">) {
  const { supabase, perfil } = await obtenerSesion();
  const { vista: v } = await searchParams;
  const vista = v === "completadas" ? "completadas" : "pendientes";

  const [{ data: actividades }, { data: oportunidades }] = await Promise.all([
    supabase
      .from("actividades")
      .select("*, empresas(nombre), oportunidades(codigo, titulo)")
      .eq("completada", vista === "completadas")
      .order("fecha", { ascending: vista === "pendientes" })
      .limit(200)
      .returns<Actividad[]>(),
    supabase.from("oportunidades").select("id, codigo, titulo, empresa_id").order("codigo"),
  ]);

  const ahora = new Date().toISOString();
  const lista = actividades ?? [];
  const grupos =
    vista === "pendientes"
      ? [
          { titulo: "Vencidas", items: lista.filter((a) => a.fecha < ahora), alerta: true },
          { titulo: "Próximas", items: lista.filter((a) => a.fecha >= ahora), alerta: false },
        ]
      : [{ titulo: "Completadas", items: lista, alerta: false }];

  return (
    <>
      <TiempoReal tablas={["actividades"]} />
      <Encabezado titulo="Agenda" subtitulo="Visitas técnicas, llamadas y seguimientos" />

      {puede(perfil, ["dueno", "gerente", "comercial", "operativo"]) && (
        <Desplegable texto="Nueva actividad">
          <form action={crearActividad} className="space-y-4">
            <CamposActividad oportunidades={oportunidades ?? []} />
            <button className="boton">Guardar actividad</button>
          </form>
        </Desplegable>
      )}

      <div className="mb-4 flex gap-2">
        {Object.entries(VISTAS).map(([clave, texto]) => (
          <Link
            key={clave}
            href={`/actividades?vista=${clave}`}
            className={`rounded-lg px-3 py-1.5 text-sm ${vista === clave ? "bg-marca-600 text-white" : "bg-white text-slate-600 shadow-sm"}`}
          >
            {texto}
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        {grupos.map((g) => (
          <section key={g.titulo} className="tarjeta">
            <h2 className={`border-b border-slate-100 px-5 py-3 font-semibold ${g.alerta && g.items.length ? "text-amber-700" : ""}`}>
              {g.titulo} <span className="text-sm font-normal text-slate-400">({g.items.length})</span>
            </h2>
            <ul className="divide-y divide-slate-100">
              {g.items.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <form action={alternarCompletada.bind(null, a.id, !a.completada)}>
                    <button title={a.completada ? "Marcar como pendiente" : "Marcar como completada"} className="mt-0.5 text-marca-500 hover:text-marca-700">
                      {a.completada ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                  </form>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${a.completada ? "text-slate-400 line-through" : "font-medium"}`}>{a.titulo}</p>
                    <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-slate-500">
                      <span className="font-medium text-marca-700">{TIPOS_ACTIVIDAD[a.tipo]}</span>
                      <span>{fechaHora(a.fecha)}</span>
                      {a.ubicacion && <span className="flex items-center gap-0.5"><MapPin size={11} />{a.ubicacion}</span>}
                      {a.empresa_id && <Link href={`/empresas/${a.empresa_id}`} className="hover:underline">{a.empresas?.nombre}</Link>}
                      {a.oportunidad_id && <Link href={`/pipeline/${a.oportunidad_id}`} className="hover:underline">{a.oportunidades?.codigo}</Link>}
                    </p>
                    {a.descripcion && <p className="mt-1 text-sm text-slate-600">{a.descripcion}</p>}
                  </div>
                  {g.alerta && <span className="shrink-0 text-xs text-amber-700">desde {fecha(a.fecha)}</span>}
                </li>
              ))}
            </ul>
            {!g.items.length && <Vacio>Nada por aquí.</Vacio>}
          </section>
        ))}
      </div>
    </>
  );
}
