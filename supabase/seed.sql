-- =====================================================================
-- Datos de prueba ficticios para el piloto de Ártica (HVAC).
-- Ningún nombre corresponde a una empresa real.
-- =====================================================================

insert into public.empresas (id, nombre, giro, telefono, email, ciudad, direccion, notas) values
  ('10000000-0000-0000-0000-000000000001', 'Corporativo Torre Cumbres',     'Oficinas corporativas', '81 1111 2001', 'facilities@torrecumbres.example', 'Monterrey',   'Av. Ejemplo 100, San Pedro', 'Edificio de 18 niveles, sistema VRF existente de 2012.'),
  ('10000000-0000-0000-0000-000000000002', 'Hotel Bahía Serena',            'Hotelería',             '322 111 2002', 'mantenimiento@bahiaserena.example', 'Puerto Vallarta', 'Blvd. Costero 450', '220 habitaciones; interesados en chiller de alta eficiencia.'),
  ('10000000-0000-0000-0000-000000000003', 'Laboratorios Nexalia',          'Farmacéutica',          '55 1111 2003', 'ingenieria@nexalia.example', 'Toluca',      'Parque Industrial Norte, Nave 7', 'Requieren control de humedad para cuarto limpio ISO 7.'),
  ('10000000-0000-0000-0000-000000000004', 'Plaza Comercial Los Álamos',    'Retail',                '33 1111 2004', 'admin@plazaalamos.example', 'Guadalajara', 'Av. Principal 2200', '45 locales; extracción en área de comida.'),
  ('10000000-0000-0000-0000-000000000005', 'Clínica Médica Santa Fe Norte', 'Salud',                 '81 1111 2005', 'direccion@clinicasfn.example', 'Monterrey',   'Calle Salud 15', 'Quirófanos con presión positiva.'),
  ('10000000-0000-0000-0000-000000000006', 'Bodegas Logísticas del Bajío',  'Logística',             '477 111 2006', 'operaciones@bodegasbajio.example', 'León',        'Carretera Federal km 12', 'Naves de 8,000 m² sin climatizar.'),
  ('10000000-0000-0000-0000-000000000007', 'Colegio Bilingüe Arboleda',     'Educación',             '442 111 2007', 'administracion@arboleda.example', 'Querétaro',   'Camino Real 300', '32 aulas con minisplits de diferentes marcas.'),
  ('10000000-0000-0000-0000-000000000008', 'Restaurantes Grupo Fogón',      'Restaurantes',          '81 1111 2008', 'proyectos@grupofogon.example', 'Monterrey',   'Av. Gastronómica 88', '6 sucursales; mantenimiento preventivo trimestral.');

insert into public.contactos (id, empresa_id, nombre, cargo, telefono, email, es_principal) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Ing. Laura Medina',     'Gerente de Facilities',       '81 2222 3001', 'laura.medina@torrecumbres.example', true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Roberto Salinas',       'Compras',                     '81 2222 3002', 'compras@torrecumbres.example', false),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Arq. Daniela Ruiz',     'Directora de Proyectos',      '322 222 3003', 'druiz@bahiaserena.example', true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Ing. Marco Treviño',    'Jefe de Ingeniería',          '55 2222 3004', 'mtrevino@nexalia.example', true),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'Sofía Herrera',         'Administradora',              '33 2222 3005', 'sherrera@plazaalamos.example', true),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', 'Dr. Andrés Cavazos',    'Director Médico',             '81 2222 3006', 'acavazos@clinicasfn.example', true),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', 'Jorge Ibarra',          'Gerente de Operaciones',      '477 222 3007', 'jibarra@bodegasbajio.example', true),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000007', 'Mtra. Paola Rangel',    'Directora Administrativa',    '442 222 3008', 'prangel@arboleda.example', true),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000008', 'Luis Garza',            'Director de Expansión',       '81 2222 3009', 'lgarza@grupofogon.example', true);

insert into public.oportunidades
  (id, titulo, empresa_id, contacto_id, etapa_id, monto_estimado, tipo_proyecto, tipo_sistema, toneladas_tr, origen, fecha_cierre_estimada, motivo_perdida, fecha_cierre_real)
values
  ('30000000-0000-0000-0000-000000000001', 'Reemplazo VRF niveles 10 al 18',          '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 6, 2850000, 'reemplazo',     'vrf',        96,  'Referido',  current_date + 20, null, null),
  ('30000000-0000-0000-0000-000000000002', 'Chiller enfriado por agua 300 TR',        '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 5, 6400000, 'reemplazo',     'chiller',    300, 'Licitación', current_date + 35, null, null),
  ('30000000-0000-0000-0000-000000000003', 'Climatización cuarto limpio ISO 7',       '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 4, 1980000, 'obra_nueva',    'paquete',    40,  'Sitio web', current_date + 45, null, null),
  ('30000000-0000-0000-0000-000000000004', 'Extracción área de comida',               '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 3, 620000,  'ampliacion',    'extraccion', null, 'Llamada',  current_date + 30, null, null),
  ('30000000-0000-0000-0000-000000000005', 'Quirófanos: UMAs con filtración HEPA',    '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000006', 2, 1450000, 'obra_nueva',    'paquete',    25,  'Referido',  current_date + 60, null, null),
  ('30000000-0000-0000-0000-000000000006', 'Ventilación naves 1 y 2',                 '10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000007', 1, 900000,  'obra_nueva',    'extraccion', null, 'Expo HVAC', current_date + 90, null, null),
  ('30000000-0000-0000-0000-000000000007', 'Póliza de mantenimiento anual 32 aulas',  '10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000008', 7, 384000,  'mantenimiento', 'minisplit',  64,  'Cliente actual', current_date - 10, null, current_date - 8),
  ('30000000-0000-0000-0000-000000000008', 'Mantenimiento preventivo 6 sucursales',   '10000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000009', 7, 528000,  'mantenimiento', 'paquete',    72,  'Cliente actual', current_date - 25, null, current_date - 22),
  ('30000000-0000-0000-0000-000000000009', 'Sucursal nueva Cumbres: equipos paquete', '10000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000009', 4, 760000,  'obra_nueva',    'paquete',    20,  'Cliente actual', current_date + 25, null, null),
  ('30000000-0000-0000-0000-000000000010', 'Minisplits inverter oficinas planta baja','10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 8, 210000,  'reemplazo',     'minisplit',  12,  'Referido',  current_date - 15, 'Precio: eligieron proveedor más barato', current_date - 12),
  ('30000000-0000-0000-0000-000000000011', 'Torre de enfriamiento: rehabilitación',   '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 2, 480000,  'reemplazo',     'chiller',    null, 'Llamada',  current_date + 50, null, null),
  ('30000000-0000-0000-0000-000000000012', 'Clima laboratorio de control de calidad', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 1, 350000,  'ampliacion',    'minisplit',  10,  'Sitio web', current_date + 75, null, null);

insert into public.actividades (tipo, titulo, descripcion, fecha, duracion_min, ubicacion, completada, oportunidad_id, empresa_id, contacto_id) values
  ('visita_tecnica', 'Levantamiento en azotea y cuarto de máquinas', 'Medir equipos existentes y rutas de tubería.',   now() + interval '1 day' + interval '10 hours',  120, 'Torre Cumbres, azotea',        false, '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('reunion',        'Presentación de propuesta técnica chiller',    'Llevar comparativa de eficiencias IPLV.',        now() + interval '3 days' + interval '12 hours', 90,  'Hotel Bahía Serena, sala B',   false, '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003'),
  ('visita_tecnica', 'Visita a área de comida: medición de campanas', null,                                            now() + interval '2 days' + interval '9 hours',  90,  'Plaza Los Álamos',             false, '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005'),
  ('llamada',        'Confirmar presupuesto autorizado',              'Preguntar si el proyecto entra en el CAPEX 2027.', now() + interval '5 hours',                    15,  null,                           false, '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000006'),
  ('seguimiento',    'Enviar cálculo de cargas actualizado',          null,                                            now() - interval '1 day',                        30,  null,                           false, '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004'),
  ('tarea',          'Solicitar precio de equipos al distribuidor',  'Cotizar 4 equipos paquete de 5 TR.',            now() + interval '6 days',                       30,  null,                           false, '30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000009'),
  ('llamada',        'Primer contacto: necesidades de ventilación',  null,                                            now() - interval '4 days',                       20,  null,                           true,  '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000007'),
  ('visita_tecnica', 'Levantamiento cuarto limpio',                   'Se tomaron mediciones de humedad y presión.',   now() - interval '9 days',                       180, 'Laboratorios Nexalia, Nave 7', true,  '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004');

insert into public.cotizaciones (id, titulo, oportunidad_id, empresa_id, contacto_id, estado, fecha_emision, version, condiciones) values
  ('40000000-0000-0000-0000-000000000001', 'Suministro e instalación de chiller enfriado por agua 300 TR', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'enviada',  current_date - 6,  1, (select condiciones_default from public.configuracion_empresa where id = 1)),
  ('40000000-0000-0000-0000-000000000002', 'Reemplazo de sistema VRF niveles 10 al 18',                   '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'enviada',  current_date - 12, 1, (select condiciones_default from public.configuracion_empresa where id = 1)),
  ('40000000-0000-0000-0000-000000000003', 'Póliza de mantenimiento preventivo anual',                    '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000008', 'aceptada', current_date - 20, 1, (select condiciones_default from public.configuracion_empresa where id = 1));

insert into public.cotizacion_partidas (cotizacion_id, orden, categoria, descripcion, unidad, cantidad, precio_unitario) values
  ('40000000-0000-0000-0000-000000000001', 1, 'equipo',    'Chiller centrífugo enfriado por agua 300 TR, refrigerante de bajo GWP', 'pza',  1, 4250000),
  ('40000000-0000-0000-0000-000000000001', 2, 'equipo',    'Bomba de agua helada 60 HP con variador de frecuencia',                  'pza',  2, 285000),
  ('40000000-0000-0000-0000-000000000001', 3, 'material',  'Tubería de acero al carbón cédula 40, aislamiento y soportería',          'lote', 1, 410000),
  ('40000000-0000-0000-0000-000000000001', 4, 'mano_obra', 'Maniobra, instalación, arranque y balanceo hidráulico',                  'lote', 1, 520000),
  ('40000000-0000-0000-0000-000000000002', 1, 'equipo',    'Unidades condensadoras VRF 24 HP',                                       'pza',  4, 365000),
  ('40000000-0000-0000-0000-000000000002', 2, 'equipo',    'Evaporadoras tipo cassette 4 vías',                                      'pza', 36, 28500),
  ('40000000-0000-0000-0000-000000000002', 3, 'material',  'Tubería de cobre, derivadores y control centralizado',                   'lote', 1, 260000),
  ('40000000-0000-0000-0000-000000000002', 4, 'mano_obra', 'Desmontaje de equipos existentes e instalación',                         'lote', 1, 340000),
  ('40000000-0000-0000-0000-000000000003', 1, 'mano_obra', 'Mantenimiento preventivo trimestral a 32 minisplits (4 visitas)',         'visita', 4, 82750),
  ('40000000-0000-0000-0000-000000000003', 2, 'material',  'Filtros, químicos de limpieza y consumibles',                            'lote', 1, 0);
