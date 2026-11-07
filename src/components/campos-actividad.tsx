import { TIPOS_ACTIVIDAD } from "@/lib/catalogos";
import { aInputFechaHora } from "@/lib/formato";
import { AreaTexto, Campo, Selector, opcionesDe } from "./campos";

export function CamposActividad({
  oportunidades,
}: {
  oportunidades?: { id: string; codigo: string; titulo: string; empresa_id: string | null }[];
}) {
  const manana = new Date();
  manana.setUTCDate(manana.getUTCDate() + 1);
  manana.setUTCHours(15, 0, 0, 0); // 9:00 hora del centro

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Selector etiqueta="Tipo *" nombre="tipo" valor="visita_tecnica" opciones={opcionesDe(TIPOS_ACTIVIDAD)} requerido />
      <Campo etiqueta="Título *" nombre="titulo" requerido className="sm:col-span-2" />
      <Campo etiqueta="Fecha y hora *" nombre="fecha" tipo="datetime-local" valor={aInputFechaHora(manana.toISOString())} requerido />
      <Campo etiqueta="Duración (min)" nombre="duracion_min" tipo="number" valor={60} min="0" />
      <Campo etiqueta="Ubicación" nombre="ubicacion" placeholder="Sitio, dirección, videollamada…" />
      {oportunidades && (
        <Selector
          etiqueta="Oportunidad"
          nombre="oportunidad_id"
          vacio="— Ninguna —"
          opciones={oportunidades.map((o) => ({ valor: o.id, texto: `${o.codigo} · ${o.titulo}` }))}
          className="sm:col-span-2 lg:col-span-3"
        />
      )}
      <AreaTexto etiqueta="Descripción" nombre="descripcion" className="sm:col-span-2 lg:col-span-3" />
    </div>
  );
}
