import type { Contacto, Empresa } from "@/lib/tipos";

export function Campo({
  etiqueta,
  nombre,
  valor,
  tipo = "text",
  requerido,
  className = "",
  ...resto
}: {
  etiqueta: string;
  nombre: string;
  valor?: string | number | null;
  tipo?: string;
  requerido?: boolean;
  className?: string;
  step?: string;
  min?: string;
  placeholder?: string;
}) {
  return (
    <div className={className}>
      <label className="etiqueta" htmlFor={nombre}>{etiqueta}</label>
      <input
        id={nombre}
        name={nombre}
        type={tipo}
        required={requerido}
        defaultValue={valor ?? ""}
        className="campo"
        {...resto}
      />
    </div>
  );
}

export function Selector({
  etiqueta,
  nombre,
  valor,
  opciones,
  vacio,
  requerido,
  className = "",
}: {
  etiqueta: string;
  nombre: string;
  valor?: string | number | null;
  opciones: { valor: string | number; texto: string }[];
  vacio?: string;
  requerido?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="etiqueta" htmlFor={nombre}>{etiqueta}</label>
      <select id={nombre} name={nombre} defaultValue={valor ?? ""} required={requerido} className="campo">
        {vacio !== undefined && <option value="">{vacio}</option>}
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>{o.texto}</option>
        ))}
      </select>
    </div>
  );
}

export function AreaTexto({ etiqueta, nombre, valor, className = "" }: { etiqueta: string; nombre: string; valor?: string | null; className?: string }) {
  return (
    <div className={className}>
      <label className="etiqueta" htmlFor={nombre}>{etiqueta}</label>
      <textarea id={nombre} name={nombre} rows={3} defaultValue={valor ?? ""} className="campo" />
    </div>
  );
}

export const opcionesDe = (catalogo: Record<string, string>) =>
  Object.entries(catalogo).map(([valor, texto]) => ({ valor, texto }));

export function CamposEmpresa({ empresa }: { empresa?: Empresa }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Campo etiqueta="Nombre comercial *" nombre="nombre" valor={empresa?.nombre} requerido />
      <Campo etiqueta="Giro" nombre="giro" valor={empresa?.giro} placeholder="Hotelería, salud, retail…" />
      <Campo etiqueta="RFC" nombre="rfc" valor={empresa?.rfc} />
      <Campo etiqueta="Teléfono" nombre="telefono" valor={empresa?.telefono} tipo="tel" />
      <Campo etiqueta="Correo" nombre="email" valor={empresa?.email} tipo="email" />
      <Campo etiqueta="Sitio web" nombre="sitio_web" valor={empresa?.sitio_web} />
      <Campo etiqueta="Ciudad" nombre="ciudad" valor={empresa?.ciudad} />
      <Campo etiqueta="Dirección" nombre="direccion" valor={empresa?.direccion} className="sm:col-span-2" />
      <AreaTexto etiqueta="Notas técnicas" nombre="notas" valor={empresa?.notas} className="sm:col-span-2 lg:col-span-3" />
    </div>
  );
}

export function CamposContacto({
  contacto,
  empresas,
  empresaFija,
}: {
  contacto?: Contacto;
  empresas?: Pick<Empresa, "id" | "nombre">[];
  empresaFija?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {empresaFija ? (
        <input type="hidden" name="empresa_id" value={empresaFija} />
      ) : (
        <Selector
          etiqueta="Empresa"
          nombre="empresa_id"
          valor={contacto?.empresa_id}
          vacio="— Sin empresa —"
          opciones={(empresas ?? []).map((e) => ({ valor: e.id, texto: e.nombre }))}
        />
      )}
      <Campo etiqueta="Nombre *" nombre="nombre" valor={contacto?.nombre} requerido />
      <Campo etiqueta="Cargo" nombre="cargo" valor={contacto?.cargo} />
      <Campo etiqueta="Teléfono / WhatsApp" nombre="telefono" valor={contacto?.telefono} tipo="tel" />
      <Campo etiqueta="Correo" nombre="email" valor={contacto?.email} tipo="email" />
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" name="es_principal" defaultChecked={contacto?.es_principal} /> Contacto principal
      </label>
    </div>
  );
}
