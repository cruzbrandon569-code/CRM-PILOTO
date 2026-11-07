import Link from "next/link";
import { obtenerSesion, puede, ROLES_ESCRITURA } from "@/lib/sesion";
import { dinero, fecha } from "@/lib/formato";
import { ESTADOS_COTIZACION } from "@/lib/catalogos";
import { totales } from "@/lib/cotizacion";
import type { Cotizacion, Partida } from "@/lib/tipos";
import { colorEstado, Encabezado, Insignia, Vacio } from "@/components/ui";
import { crearCotizacion } from "./actions";

export default async function CotizacionesPage({ searchParams }: PageProps<"/cotizaciones">) {
  const { supabase, perfil } = await obtenerSesion();
  const { estado } = await searchParams;
  const filtro = typeof estado === "string" && estado in ESTADOS_COTIZACION ? estado : null;

  let consulta = supabase
    .from("cotizaciones")
    .select("*, empresas(nombre), cotizacion_partidas(cantidad, precio_unitario)")
    .order("folio", { ascending: false })
    .order("version", { ascending: false });
  if (filtro) consulta = consulta.eq("estado", filtro);
  const { data: cotizaciones } = await consulta.returns<
    (Cotizacion & { empresas: { nombre: string } | null; cotizacion_partidas: Partida[] })[]
  >();

  return (
    <>
      <Encabezado
        titulo="Cotizaciones"
        subtitulo="Propuestas con partidas de equipo, material y mano de obra"
        acciones={
          puede(perfil, ROLES_ESCRITURA) && (
            <form action={crearCotizacion.bind(null, null)}>
              <button className="boton">Nueva cotización</button>
            </form>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {[["", "Todas"], ...Object.entries(ESTADOS_COTIZACION)].map(([clave, texto]) => (
          <Link
            key={clave}
            href={clave ? `/cotizaciones?estado=${clave}` : "/cotizaciones"}
            className={`rounded-lg px-3 py-1.5 text-sm ${(filtro ?? "") === clave ? "bg-marca-600 text-white" : "bg-white text-slate-600 shadow-sm"}`}
          >
            {texto}
          </Link>
        ))}
      </div>

      <div className="tarjeta overflow-x-auto">
        <table className="tabla">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Proyecto</th>
              <th>Cliente</th>
              <th>Emisión</th>
              <th>Estado</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(cotizaciones ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td>
                  <Link href={`/cotizaciones/${c.id}`} className="font-medium text-marca-700 hover:underline">
                    {c.folio} <span className="text-slate-400">v{c.version}</span>
                  </Link>
                </td>
                <td className="max-w-xs truncate">{c.titulo}</td>
                <td className="text-slate-600">{c.empresas?.nombre ?? "—"}</td>
                <td className="text-slate-600">{fecha(c.fecha_emision)}</td>
                <td><Insignia color={colorEstado(c.estado)}>{ESTADOS_COTIZACION[c.estado]}</Insignia></td>
                <td className="text-right tabular-nums">{dinero(totales(c.cotizacion_partidas, c.descuento_pct, c.iva_pct).total, c.moneda)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!cotizaciones?.length && <Vacio>No hay cotizaciones.</Vacio>}
      </div>
    </>
  );
}
