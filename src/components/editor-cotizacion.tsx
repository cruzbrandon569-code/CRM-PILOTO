"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { CATEGORIAS_PARTIDA, ESTADOS_COTIZACION } from "@/lib/catalogos";
import { dineroExacto } from "@/lib/formato";
import { totales } from "@/lib/cotizacion";
import type { Cotizacion, Partida } from "@/lib/tipos";
import { guardarCotizacion, type DatosCotizacion } from "@/app/(crm)/cotizaciones/actions";

const partidaVacia = (): Partida => ({ orden: 0, categoria: "equipo", descripcion: "", unidad: "pza", cantidad: 1, precio_unitario: 0 });

export function EditorCotizacion({
  cotizacion,
  partidasIniciales,
  empresas,
  contactos,
  oportunidades,
  editable,
}: {
  cotizacion: Cotizacion;
  partidasIniciales: Partida[];
  empresas: { id: string; nombre: string }[];
  contactos: { id: string; nombre: string; empresa_id: string | null }[];
  oportunidades: { id: string; codigo: string; titulo: string }[];
  editable: boolean;
}) {
  const [datos, setDatos] = useState<DatosCotizacion>({
    titulo: cotizacion.titulo,
    empresa_id: cotizacion.empresa_id,
    contacto_id: cotizacion.contacto_id,
    oportunidad_id: cotizacion.oportunidad_id,
    estado: cotizacion.estado,
    fecha_emision: cotizacion.fecha_emision,
    vigencia_dias: cotizacion.vigencia_dias,
    moneda: cotizacion.moneda,
    descuento_pct: Number(cotizacion.descuento_pct),
    iva_pct: Number(cotizacion.iva_pct),
    condiciones: cotizacion.condiciones,
    notas: cotizacion.notas,
  });
  const [partidas, setPartidas] = useState<Partida[]>(partidasIniciales.length ? partidasIniciales : [partidaVacia()]);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [cambios, setCambios] = useState(false);
  const [guardando, iniciar] = useTransition();

  const t = totales(partidas, datos.descuento_pct, datos.iva_pct);
  const contactosEmpresa = contactos.filter((c) => !datos.empresa_id || c.empresa_id === datos.empresa_id);

  function campo<K extends keyof DatosCotizacion>(clave: K, valor: DatosCotizacion[K]) {
    setDatos((d) => ({ ...d, [clave]: valor }));
    setCambios(true);
  }

  function partida(i: number, cambio: Partial<Partida>) {
    setPartidas((ps) => ps.map((p, j) => (j === i ? { ...p, ...cambio } : p)));
    setCambios(true);
  }

  function mover(i: number, delta: number) {
    setPartidas((ps) => {
      const copia = [...ps];
      const [p] = copia.splice(i, 1);
      copia.splice(i + delta, 0, p);
      return copia;
    });
    setCambios(true);
  }

  function guardar() {
    setMensaje(null);
    iniciar(async () => {
      const { error } = await guardarCotizacion(cotizacion.id, datos, partidas);
      if (error) setMensaje({ tipo: "error", texto: error });
      else {
        setMensaje({ tipo: "ok", texto: "Cotización guardada." });
        setCambios(false);
      }
    });
  }

  const deshabilitado = !editable;

  return (
    <fieldset disabled={deshabilitado} className="space-y-6">
      <section className="tarjeta grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="etiqueta">Título / alcance</label>
          <input className="campo" value={datos.titulo} onChange={(e) => campo("titulo", e.target.value)} />
        </div>
        <div>
          <label className="etiqueta">Estado</label>
          <select className="campo" value={datos.estado} onChange={(e) => campo("estado", e.target.value)}>
            {Object.entries(ESTADOS_COTIZACION).map(([v, txt]) => <option key={v} value={v}>{txt}</option>)}
          </select>
        </div>
        <div>
          <label className="etiqueta">Fecha de emisión</label>
          <input type="date" className="campo" value={datos.fecha_emision} onChange={(e) => campo("fecha_emision", e.target.value)} />
        </div>
        <div>
          <label className="etiqueta">Cliente</label>
          <select className="campo" value={datos.empresa_id ?? ""} onChange={(e) => campo("empresa_id", e.target.value || null)}>
            <option value="">— Sin empresa —</option>
            {empresas.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="etiqueta">Atención a</label>
          <select className="campo" value={datos.contacto_id ?? ""} onChange={(e) => campo("contacto_id", e.target.value || null)}>
            <option value="">— Sin contacto —</option>
            {contactosEmpresa.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="etiqueta">Oportunidad</label>
          <select className="campo" value={datos.oportunidad_id ?? ""} onChange={(e) => campo("oportunidad_id", e.target.value || null)}>
            <option value="">— Ninguna —</option>
            {oportunidades.map((o) => <option key={o.id} value={o.id}>{o.codigo} · {o.titulo}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="etiqueta">Moneda</label>
            <select className="campo" value={datos.moneda} onChange={(e) => campo("moneda", e.target.value)}>
              <option>MXN</option>
              <option>USD</option>
            </select>
          </div>
          <div>
            <label className="etiqueta">Vigencia (días)</label>
            <input type="number" min={0} className="campo" value={datos.vigencia_dias} onChange={(e) => campo("vigencia_dias", Number(e.target.value))} />
          </div>
        </div>
      </section>

      <section className="tarjeta overflow-x-auto">
        <table className="tabla min-w-[820px]">
          <thead>
            <tr>
              <th className="w-10">#</th>
              <th className="w-36">Categoría</th>
              <th>Descripción</th>
              <th className="w-20">Unidad</th>
              <th className="w-24 text-right">Cantidad</th>
              <th className="w-36 text-right">P. unitario</th>
              <th className="w-36 text-right">Importe</th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {partidas.map((p, i) => (
              <tr key={i}>
                <td className="text-slate-400">{i + 1}</td>
                <td>
                  <select className="campo" value={p.categoria} onChange={(e) => partida(i, { categoria: e.target.value })}>
                    {Object.entries(CATEGORIAS_PARTIDA).map(([v, txt]) => <option key={v} value={v}>{txt}</option>)}
                  </select>
                </td>
                <td>
                  <textarea rows={1} className="campo min-h-9" value={p.descripcion} onChange={(e) => partida(i, { descripcion: e.target.value })} />
                </td>
                <td><input className="campo" value={p.unidad} onChange={(e) => partida(i, { unidad: e.target.value })} /></td>
                <td><input type="number" step="0.01" min={0} className="campo text-right" value={p.cantidad} onChange={(e) => partida(i, { cantidad: Number(e.target.value) })} /></td>
                <td><input type="number" step="0.01" min={0} className="campo text-right" value={p.precio_unitario} onChange={(e) => partida(i, { precio_unitario: Number(e.target.value) })} /></td>
                <td className="text-right tabular-nums">{dineroExacto(Number(p.cantidad) * Number(p.precio_unitario), datos.moneda)}</td>
                <td>
                  <div className="flex justify-end gap-1 text-slate-400">
                    <button type="button" title="Subir" disabled={i === 0} onClick={() => mover(i, -1)} className="hover:text-slate-700 disabled:opacity-30"><ArrowUp size={15} /></button>
                    <button type="button" title="Bajar" disabled={i === partidas.length - 1} onClick={() => mover(i, 1)} className="hover:text-slate-700 disabled:opacity-30"><ArrowDown size={15} /></button>
                    <button type="button" title="Quitar" onClick={() => { setPartidas((ps) => ps.filter((_, j) => j !== i)); setCambios(true); }} className="hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editable && (
          <button type="button" onClick={() => { setPartidas((ps) => [...ps, partidaVacia()]); setCambios(true); }} className="m-3 inline-flex items-center gap-1 text-sm font-medium text-marca-700">
            <Plus size={15} /> Agregar partida
          </button>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="tarjeta space-y-4 p-5 lg:col-span-2">
          <div>
            <label className="etiqueta">Condiciones comerciales</label>
            <textarea rows={5} className="campo" value={datos.condiciones ?? ""} onChange={(e) => campo("condiciones", e.target.value || null)} />
          </div>
          <div>
            <label className="etiqueta">Notas internas (no salen en el PDF)</label>
            <textarea rows={2} className="campo" value={datos.notas ?? ""} onChange={(e) => campo("notas", e.target.value || null)} />
          </div>
        </section>

        <section className="tarjeta space-y-3 p-5 text-sm">
          <Fila texto="Subtotal" valor={dineroExacto(t.subtotal, datos.moneda)} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Descuento %</span>
            <input type="number" min={0} max={100} step="0.5" className="campo w-24 text-right" value={datos.descuento_pct} onChange={(e) => campo("descuento_pct", Number(e.target.value))} />
          </div>
          {t.descuento > 0 && <Fila texto="Descuento" valor={`− ${dineroExacto(t.descuento, datos.moneda)}`} />}
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">IVA %</span>
            <input type="number" min={0} max={100} step="1" className="campo w-24 text-right" value={datos.iva_pct} onChange={(e) => campo("iva_pct", Number(e.target.value))} />
          </div>
          <Fila texto="IVA" valor={dineroExacto(t.iva, datos.moneda)} />
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{dineroExacto(t.total, datos.moneda)}</span>
          </div>
          {editable && (
            <button type="button" onClick={guardar} disabled={guardando} className="boton mt-2 w-full">
              {guardando ? "Guardando…" : cambios ? "Guardar cambios" : "Guardado"}
            </button>
          )}
          {mensaje && (
            <p className={`text-center text-sm ${mensaje.tipo === "ok" ? "text-green-700" : "text-red-700"}`}>{mensaje.texto}</p>
          )}
        </section>
      </div>
    </fieldset>
  );
}

function Fila({ texto, valor }: { texto: string; valor: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{texto}</span>
      <span className="tabular-nums">{valor}</span>
    </div>
  );
}
