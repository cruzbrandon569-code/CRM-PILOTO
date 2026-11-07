"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CalendarDays, ThermometerSnowflake } from "lucide-react";
import { dinero, fecha, numero } from "@/lib/formato";
import { TIPOS_SISTEMA } from "@/lib/catalogos";
import type { Etapa, Oportunidad } from "@/lib/tipos";
import { moverOportunidad } from "@/app/(crm)/pipeline/actions";

export function Kanban({
  etapas,
  oportunidades,
  editable,
}: {
  etapas: Etapa[];
  oportunidades: Oportunidad[];
  editable: boolean;
}) {
  // La tarjeta se mueve al instante; si el servidor rechaza el cambio, vuelve sola a su columna.
  const [tarjetas, moverOptimista] = useOptimistic(
    oportunidades,
    (actuales, { id, etapaId }: { id: string; etapaId: number }) =>
      actuales.map((t) => (t.id === id ? { ...t, etapa_id: etapaId } : t)),
  );
  const [arrastrando, setArrastrando] = useState<Oportunidad | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, iniciarTransicion] = useTransition();

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  function alSoltar({ active, over }: DragEndEvent) {
    setArrastrando(null);
    if (!over) return;
    const id = String(active.id);
    const etapaId = Number(over.id);
    const tarjeta = tarjetas.find((t) => t.id === id);
    if (!tarjeta || tarjeta.etapa_id === etapaId) return;

    const destino = etapas.find((e) => e.id === etapaId);
    let motivo: string | undefined;
    if (destino?.es_perdida) {
      const respuesta = prompt("¿Por qué se perdió? (precio, tiempo, competencia…)");
      if (respuesta === null) return;
      motivo = respuesta;
    }

    setError(null);
    iniciarTransicion(async () => {
      moverOptimista({ id, etapaId });
      const { error } = await moverOportunidad(id, etapaId, motivo);
      if (error) setError("No se pudo mover la oportunidad: " + error);
    });
  }

  return (
    <>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      <DndContext
        sensors={sensores}
        onDragStart={({ active }) => setArrastrando(tarjetas.find((t) => t.id === active.id) ?? null)}
        onDragEnd={alSoltar}
        onDragCancel={() => setArrastrando(null)}
      >
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
          {etapas.map((etapa) => (
            <Columna
              key={etapa.id}
              etapa={etapa}
              tarjetas={tarjetas.filter((t) => t.etapa_id === etapa.id)}
              editable={editable}
            />
          ))}
        </div>
        <DragOverlay>{arrastrando && <Tarjeta oportunidad={arrastrando} flotante />}</DragOverlay>
      </DndContext>
    </>
  );
}

function Columna({ etapa, tarjetas, editable }: { etapa: Etapa; tarjetas: Oportunidad[]; editable: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa.id, disabled: !editable });
  const total = tarjetas.reduce((s, t) => s + Number(t.monto_estimado), 0);

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 rounded-lg border-t-4 bg-white px-3 py-2 shadow-sm" style={{ borderTopColor: etapa.color }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{etapa.nombre}</h2>
          <span className="rounded-full bg-slate-100 px-2 text-xs text-slate-600">{tarjetas.length}</span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          <span className="font-medium tabular-nums text-slate-700">{dinero(total)}</span> · {etapa.probabilidad}%
        </p>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-40 flex-1 flex-col gap-2 rounded-lg p-1 transition ${isOver ? "bg-marca-100" : "bg-slate-100/70"}`}
      >
        {tarjetas.map((t) => (
          <Arrastrable key={t.id} oportunidad={t} editable={editable} />
        ))}
      </div>
    </div>
  );
}

function Arrastrable({ oportunidad, editable }: { oportunidad: Oportunidad; editable: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: oportunidad.id, disabled: !editable });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={isDragging ? "opacity-30" : ""}>
      <Tarjeta oportunidad={oportunidad} />
    </div>
  );
}

function Tarjeta({ oportunidad: o, flotante }: { oportunidad: Oportunidad; flotante?: boolean }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-3 ${flotante ? "rotate-2 shadow-lg" : "shadow-sm hover:border-marca-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <Link href={`/pipeline/${o.id}`} className="text-sm font-medium leading-snug hover:text-marca-700">
          {o.titulo}
        </Link>
      </div>
      <p className="mt-1 truncate text-xs text-slate-500">
        {o.codigo} · {o.empresas?.nombre ?? "Sin empresa"}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="font-semibold tabular-nums text-slate-800">{dinero(o.monto_estimado, o.moneda)}</span>
        {o.toneladas_tr && (
          <span className="flex items-center gap-1"><ThermometerSnowflake size={12} />{numero(o.toneladas_tr, 1)} TR</span>
        )}
        {o.tipo_sistema && <span>{TIPOS_SISTEMA[o.tipo_sistema]}</span>}
        {o.fecha_cierre_estimada && (
          <span className="flex items-center gap-1"><CalendarDays size={12} />{fecha(o.fecha_cierre_estimada)}</span>
        )}
      </div>
    </div>
  );
}
