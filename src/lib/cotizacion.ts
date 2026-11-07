type Linea = { cantidad: number | string; precio_unitario: number | string };

/** Mismo cálculo que la vista `cotizaciones_totales` de la base de datos. */
export function totales(partidas: Linea[], descuentoPct: number | string, ivaPct: number | string) {
  const subtotal = partidas.reduce((s, p) => s + Number(p.cantidad) * Number(p.precio_unitario), 0);
  const descuento = (subtotal * Number(descuentoPct)) / 100;
  const base = subtotal - descuento;
  const iva = (base * Number(ivaPct)) / 100;
  return { subtotal, descuento, base, iva, total: base + iva };
}
