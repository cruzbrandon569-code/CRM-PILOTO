const ZONA = "America/Monterrey";
// México no usa horario de verano desde 2022 (salvo la franja fronteriza).
export const DESFASE_ZONA = "-06:00";

export function dinero(valor: number | string | null | undefined, moneda = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(Number(valor ?? 0));
}

export function dineroExacto(valor: number | string | null | undefined, moneda = "MXN") {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda }).format(Number(valor ?? 0));
}

export function numero(valor: number | string | null | undefined, decimales = 0) {
  return new Intl.NumberFormat("es-MX", { maximumFractionDigits: decimales }).format(Number(valor ?? 0));
}

export function fecha(valor: string | null | undefined) {
  if (!valor) return "—";
  // Las columnas `date` llegan como "AAAA-MM-DD"; se fijan a mediodía para no cambiar de día por zona horaria.
  const d = valor.length === 10 ? new Date(`${valor}T12:00:00`) : new Date(valor);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: ZONA });
}

export function fechaHora(valor: string | null | undefined) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZONA,
  });
}

/** Valor para un <input type="datetime-local"> en hora local de la empresa. */
export function aInputFechaHora(valor: string | null | undefined) {
  if (!valor) return "";
  const partes = new Intl.DateTimeFormat("sv-SE", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
  return partes.replace(" ", "T");
}
