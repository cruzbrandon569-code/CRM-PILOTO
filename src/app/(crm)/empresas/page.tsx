import Link from "next/link";
import { Search } from "lucide-react";
import { obtenerSesion, puede, ROLES_ESCRITURA } from "@/lib/sesion";
import { limpiarBusqueda } from "@/lib/formularios";
import type { Empresa } from "@/lib/tipos";
import { Desplegable, Encabezado, Vacio } from "@/components/ui";
import { CamposEmpresa } from "@/components/campos";
import { crearEmpresa } from "./actions";

export default async function EmpresasPage({ searchParams }: PageProps<"/empresas">) {
  const { supabase, perfil } = await obtenerSesion();
  const { q } = await searchParams;
  const busqueda = limpiarBusqueda(q);

  let consulta = supabase.from("empresas").select("*, contactos(count), oportunidades(count)").order("nombre");
  if (busqueda) consulta = consulta.or(`nombre.ilike.%${busqueda}%,ciudad.ilike.%${busqueda}%,giro.ilike.%${busqueda}%`);
  const { data: empresas } = await consulta.returns<
    (Empresa & { contactos: { count: number }[]; oportunidades: { count: number }[] })[]
  >();

  return (
    <>
      <Encabezado titulo="Empresas" subtitulo="Clientes y prospectos" />

      {puede(perfil, ROLES_ESCRITURA) && (
        <Desplegable texto="Nueva empresa">
          <form action={crearEmpresa} className="space-y-4">
            <CamposEmpresa />
            <button className="boton">Guardar empresa</button>
          </form>
        </Desplegable>
      )}

      <div className="tarjeta overflow-hidden">
        <form className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Search size={16} className="text-slate-400" />
          <input name="q" defaultValue={busqueda} placeholder="Buscar por nombre, ciudad o giro" className="w-full text-sm outline-none" />
        </form>
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Giro</th>
                <th>Ciudad</th>
                <th>Teléfono</th>
                <th className="text-right">Contactos</th>
                <th className="text-right">Oportunidades</th>
              </tr>
            </thead>
            <tbody>
              {(empresas ?? []).map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td>
                    <Link href={`/empresas/${e.id}`} className="font-medium text-marca-700 hover:underline">{e.nombre}</Link>
                  </td>
                  <td className="text-slate-600">{e.giro ?? "—"}</td>
                  <td className="text-slate-600">{e.ciudad ?? "—"}</td>
                  <td className="text-slate-600">{e.telefono ?? "—"}</td>
                  <td className="text-right tabular-nums">{e.contactos[0]?.count ?? 0}</td>
                  <td className="text-right tabular-nums">{e.oportunidades[0]?.count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!empresas?.length && <Vacio>No hay empresas{busqueda ? " con esa búsqueda" : ""}.</Vacio>}
        </div>
      </div>
    </>
  );
}
