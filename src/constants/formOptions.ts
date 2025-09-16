// src/constants/formOptions.ts

export const opcionesSexo = [
  { value: 'H', label: 'Hombre' },
  { value: 'M', label: 'Mujer' },
];

export const opcionesTipoContacto = [
  { value: 'TRA', label: 'Trabajador/a' },
  { value: 'EMP', label: 'Empleador' },
  { value: 'PAR', label: 'Particular' },
  { value: 'EST', label: 'Estudiante' },
];

export const opcionesCanalTelefono = [
  { value: 'Llamada Entrante', label: 'Llamada Entrante' },
  { value: 'Llamada Saliente', label: 'Llamada Saliente' },
];

export const opcionesTipoServicio = [
  { value: 'ASE', label: 'Asesoría' },
  { value: 'DEN', label: 'Denuncia' },
  { value: 'CON', label: 'Conmutador' },
  { value: 'CR', label: 'Centro de Recreación' },
  { value: 'AM', label: 'Alcaldía Municipal' },
  { value: 'FEE', label: 'Buzón de Quejas y Sugerencias' },
];

export const opcionesRazonSocial = [
  { value: 'PN', label: 'Persona Natural' },
  { value: 'PJ', label: 'Persona Jurídica' },
];

export const opcionesTipoDenuncia = [
  { value: 'ESP', label: 'Denuncia Especial' },
  { value: 'PRO', label: 'Denuncia Programada' },
];

export const opcionesActividadEconomica = [
  { value: 'AGR', label: 'Agricultura' },
  { value: 'IND', label: 'Industria' },
  { value: 'COM', label: 'Comercio' },
  { value: 'SER', label: 'Servicios' },
  { value: 'CON', label: 'Construcción' },
];

export const opcionesTipoDocumento = [
  { value: 'DUI-', label: 'DUI' },
  { value: 'RES-', label: 'Carnet de Residencia' },
  { value: 'DCA-', label: 'Documento Centro Americano' },
  { value: 'PAS-', label: 'Pasaporte' },
];

export const opcionesPaisCA = [
  { value: 'GUATEMALA', label: 'GUATEMALA' },
  { value: 'BELICE', label: 'BELICE' },
  { value: 'HONDURAS', label: 'HONDURAS' },
  { value: 'NICARAGUA', label: 'NICARAGUA' },
  { value: 'COSTA RICA', label: 'COSTA RICA' },
  { value: 'PANAMA', label: 'PANAMA' },
];

export const opcionesSexoUsuario = [
    { value: 'MASCULINO', label: 'MASCULINO' }, 
    { value: 'FEMENINO', label: 'FEMENINO' },
];

export const opcionesCaracteristica = [
    { value: 'NINGUNA', label: 'NINGUNA' },
    { value: 'DISC', label: 'DISCAPACIDAD' },
    { value: 'MEMB', label: 'MUJER EMBARAZADA' },
    { value: 'MLACT', label: 'MUJER LACTANTE' },
    { value: 'AMAY', label: 'ADULTO MAYOR' },
    { value: 'ECRON', label: 'ENFERMEDAD CRONICA' },
    { value: 'SINDI', label: 'SINDICALISTA' },
    { value: 'ADOLE', label: 'ADOLESCENTE' },
    { value: 'LGBTQI', label: 'IDENTIDAD DE GENERO' },
];

// --- ¡NUEVO! Opciones para la sección de Conmutador ---
export const opcionesConmutador = [
    { value: 'NC', label: 'No Contesta' },
    { value: 'NE', label: 'Número Equivocado' },
    { value: 'TR', label: 'Transferencia' },
    { value: 'IT', label: 'Información de Trámites y Servicios' },
    { value: 'IU', label: 'Información de Ubicación de Oficina' },
    { value: 'HA', label: 'Horario de Atención y Números de Sedes' },
    { value: 'ANI', label: 'Asesoría No Institucional' },
];