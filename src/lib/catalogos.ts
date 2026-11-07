// Etiquetas visibles. Para otro cliente o industria basta con cambiar este archivo:
// los valores técnicos (claves) son los mismos en la base de datos de todos los clientes.

export const ROLES: Record<string, string> = {
  dueno: "Dueño",
  gerente: "Coordinador de servicio",
  comercial: "Vendedor",
  operativo: "Técnico de campo",
  lectura: "Cobranza / consulta",
};

export const TIPOS_PROYECTO: Record<string, string> = {
  obra_nueva: "Obra nueva",
  reemplazo: "Reemplazo",
  ampliacion: "Ampliación",
  mantenimiento: "Mantenimiento",
};

export const TIPOS_SISTEMA: Record<string, string> = {
  vrf: "VRF",
  chiller: "Chiller",
  minisplit: "Minisplit",
  paquete: "Equipo paquete",
  extraccion: "Extracción / ventilación",
  otro: "Otro",
};

export const TIPOS_ACTIVIDAD: Record<string, string> = {
  visita_tecnica: "Visita técnica",
  llamada: "Llamada",
  reunion: "Reunión",
  seguimiento: "Seguimiento",
  tarea: "Tarea",
};

export const ESTADOS_COTIZACION: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

export const CATEGORIAS_PARTIDA: Record<string, string> = {
  equipo: "Equipo",
  material: "Material",
  mano_obra: "Mano de obra",
  otro: "Otro",
};
