import { TIPOS_PROYECTO, TIPOS_SISTEMA } from "@/lib/catalogos";
import type { Contacto, Empresa, Etapa, Oportunidad } from "@/lib/tipos";
import { AreaTexto, Campo, Selector, opcionesDe } from "./campos";

export function CamposOportunidad({
  oportunidad,
  etapas,
  empresas,
  contactos,
  empresaInicial,
}: {
  oportunidad?: Oportunidad;
  etapas: Etapa[];
  empresas: Pick<Empresa, "id" | "nombre">[];
  contactos: (Pick<Contacto, "id" | "nombre" | "empresa_id"> & { empresas?: { nombre: string } | null })[];
  empresaInicial?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Campo etiqueta="Título del proyecto *" nombre="titulo" valor={oportunidad?.titulo} requerido className="sm:col-span-2" />
      <Selector
        etiqueta="Etapa *"
        nombre="etapa_id"
        valor={oportunidad?.etapa_id ?? etapas[0]?.id}
        opciones={etapas.map((e) => ({ valor: e.id, texto: `${e.nombre} (${e.probabilidad}%)` }))}
        requerido
      />
      <Selector
        etiqueta="Empresa"
        nombre="empresa_id"
        valor={oportunidad?.empresa_id ?? empresaInicial}
        vacio="— Sin empresa —"
        opciones={empresas.map((e) => ({ valor: e.id, texto: e.nombre }))}
      />
      <Selector
        etiqueta="Contacto"
        nombre="contacto_id"
        valor={oportunidad?.contacto_id}
        vacio="— Sin contacto —"
        opciones={contactos.map((c) => ({ valor: c.id, texto: c.empresas?.nombre ? `${c.nombre} · ${c.empresas.nombre}` : c.nombre }))}
      />
      <Campo etiqueta="Origen" nombre="origen" valor={oportunidad?.origen} placeholder="Referido, licitación, web…" />
      <Campo etiqueta="Monto estimado" nombre="monto_estimado" valor={oportunidad?.monto_estimado} tipo="number" step="0.01" min="0" />
      <Selector etiqueta="Moneda" nombre="moneda" valor={oportunidad?.moneda ?? "MXN"} opciones={[{ valor: "MXN", texto: "MXN" }, { valor: "USD", texto: "USD" }]} />
      <Campo etiqueta="Cierre estimado" nombre="fecha_cierre_estimada" valor={oportunidad?.fecha_cierre_estimada} tipo="date" />
      <Selector etiqueta="Tipo de proyecto" nombre="tipo_proyecto" valor={oportunidad?.tipo_proyecto} vacio="—" opciones={opcionesDe(TIPOS_PROYECTO)} />
      <Selector etiqueta="Tipo de sistema" nombre="tipo_sistema" valor={oportunidad?.tipo_sistema} vacio="—" opciones={opcionesDe(TIPOS_SISTEMA)} />
      <Campo etiqueta="Toneladas de refrigeración (TR)" nombre="toneladas_tr" valor={oportunidad?.toneladas_tr} tipo="number" step="0.1" min="0" />
      {oportunidad && (
        <Campo etiqueta="Motivo de pérdida" nombre="motivo_perdida" valor={oportunidad.motivo_perdida} className="sm:col-span-2 lg:col-span-3" />
      )}
      <AreaTexto etiqueta="Notas" nombre="notas" valor={oportunidad?.notas} className="sm:col-span-2 lg:col-span-3" />
    </div>
  );
}
