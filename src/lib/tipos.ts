export type Rol = "dueno" | "gerente" | "comercial" | "operativo" | "lectura";

export interface Perfil {
  id: string;
  nombre: string;
  email: string | null;
  rol: Rol | null;
}

export interface Empresa {
  id: string;
  nombre: string;
  rfc: string | null;
  giro: string | null;
  telefono: string | null;
  email: string | null;
  sitio_web: string | null;
  direccion: string | null;
  ciudad: string | null;
  notas: string | null;
  created_at: string;
}

export interface Contacto {
  id: string;
  empresa_id: string | null;
  nombre: string;
  cargo: string | null;
  telefono: string | null;
  email: string | null;
  es_principal: boolean;
  notas: string | null;
}

export interface Etapa {
  id: number;
  nombre: string;
  orden: number;
  probabilidad: number;
  color: string;
  es_ganada: boolean;
  es_perdida: boolean;
}

export interface Oportunidad {
  id: string;
  codigo: string;
  titulo: string;
  empresa_id: string | null;
  contacto_id: string | null;
  etapa_id: number;
  monto_estimado: number;
  moneda: string;
  tipo_proyecto: string | null;
  tipo_sistema: string | null;
  toneladas_tr: number | null;
  origen: string | null;
  fecha_cierre_estimada: string | null;
  fecha_cierre_real: string | null;
  motivo_perdida: string | null;
  responsable_id: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
  empresas?: { nombre: string } | null;
}

export interface Actividad {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  duracion_min: number | null;
  ubicacion: string | null;
  completada: boolean;
  oportunidad_id: string | null;
  empresa_id: string | null;
  contacto_id: string | null;
  empresas?: { nombre: string } | null;
  oportunidades?: { codigo: string; titulo: string } | null;
}

export interface Cotizacion {
  id: string;
  folio: string;
  version: number;
  oportunidad_id: string | null;
  empresa_id: string | null;
  contacto_id: string | null;
  titulo: string;
  estado: string;
  fecha_emision: string;
  vigencia_dias: number;
  moneda: string;
  descuento_pct: number;
  iva_pct: number;
  condiciones: string | null;
  notas: string | null;
  created_at: string;
}

export interface Partida {
  id?: string;
  orden: number;
  categoria: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
}
