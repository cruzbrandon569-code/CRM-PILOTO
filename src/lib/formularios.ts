/** Texto del formulario; cadenas vacías se guardan como null. */
export function texto(fd: FormData, campo: string) {
  const valor = String(fd.get(campo) ?? "").trim();
  return valor === "" ? null : valor;
}

export function numeroDe(fd: FormData, campo: string) {
  const valor = texto(fd, campo);
  if (valor === null) return null;
  const n = Number(valor.replace(/[,$\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Quita caracteres que romperían un filtro `.or()` de PostgREST. */
export function limpiarBusqueda(valor: string | string[] | undefined) {
  return typeof valor === "string" ? valor.replace(/[,()%*\\]/g, " ").trim() : "";
}

/** Lanza el error de Supabase para que lo muestre la pantalla de error. */
export function revisar<T extends { error: { message: string } | null }>(resultado: T): T {
  if (resultado.error) throw new Error(resultado.error.message);
  return resultado;
}
