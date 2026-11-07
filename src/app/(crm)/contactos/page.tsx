import Link from "next/link";
import { Search, Star } from "lucide-react";
import { obtenerSesion, puede, ROLES_ESCRITURA } from "@/lib/sesion";
import { limpiarBusqueda } from "@/lib/formularios";
import type { Contacto } from "@/lib/tipos";
import { Desplegable, Encabezado, Vacio } from "@/components/ui";
import { CamposContacto } from "@/components/campos";
import { crearContacto } from "../empresas/actions";

export default async function ContactosPage({ searchParams }: PageProps<"/contactos">) {
  const { supabase, perfil } = await obtenerSesion();
  const { q } = await searchParams;
  const busqueda = limpiarBusqueda(q);

  let consulta = supabase.from("contactos").select("*, empresas(nombre)").order("nombre");
  if (busqueda) consulta = consulta.or(`nombre.ilike.%${busqueda}%,email.ilike.%${busqueda}%,cargo.ilike.%${busqueda}%`);

  const [{ data: contactos }, { data: empresas }] = await Promise.all([
    consulta.returns<(Contacto & { empresas: { nombre: string } | null })[]>(),
    supabase.from("empresas").select("id, nombre").order("nombre"),
  ]);

  return (
    <>
      <Encabezado titulo="Contactos" subtitulo="Personas con las que tratamos en cada empresa" />

      {puede(perfil, ROLES_ESCRITURA) && (
        <Desplegable texto="Nuevo contacto">
          <form action={crearContacto} className="space-y-4">
            <CamposContacto empresas={empresas ?? []} />
            <button className="boton">Guardar contacto</button>
          </form>
        </Desplegable>
      )}

      <div className="tarjeta overflow-hidden">
        <form className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Search size={16} className="text-slate-400" />
          <input name="q" defaultValue={busqueda} placeholder="Buscar por nombre, correo o cargo" className="w-full text-sm outline-none" />
        </form>
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Empresa</th>
                <th>Teléfono</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              {(contactos ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="font-medium">
                    <span className="flex items-center gap-1.5">
                      {c.nombre} {c.es_principal && <Star size={13} className="fill-amber-400 text-amber-400" />}
                    </span>
                  </td>
                  <td className="text-slate-600">{c.cargo ?? "—"}</td>
                  <td>
                    {c.empresa_id ? (
                      <Link href={`/empresas/${c.empresa_id}`} className="text-marca-700 hover:underline">{c.empresas?.nombre}</Link>
                    ) : "—"}
                  </td>
                  <td className="text-slate-600">{c.telefono ? <a href={`tel:${c.telefono}`}>{c.telefono}</a> : "—"}</td>
                  <td className="text-slate-600">{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!contactos?.length && <Vacio>No hay contactos{busqueda ? " con esa búsqueda" : ""}.</Vacio>}
        </div>
      </div>
    </>
  );
}
