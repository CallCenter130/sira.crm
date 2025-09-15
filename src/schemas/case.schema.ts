// src/schemas/case.schema.ts
import { z } from 'zod';

// --- Constantes y Enums ---
const sexos = ['H', 'M'] as const;
const tiposContacto = ['TRA', 'EMP', 'PAR', 'EST'] as const;
const mediosDigitales = ['AL', 'BS', 'WI', 'FB', 'IN', 'X', 'WA'] as const;
const tiposServicio = ['ASE', 'DEN', 'CON', 'CR', 'AM', 'FEE'] as const;
const lugaresDesempeno = ['CM', 'SU'] as const;
const tiposRazonSocial = ['PN', 'PJ'] as const;
const tiposDenuncia = ['ESP', 'PRO'] as const;
const tiposDocumento = ['DUI-', 'RES-', 'DCA-', 'PAS-'] as const;
const sexosUsuario = ['MASCULINO', 'FEMENINO'] as const;
const caracteristicas = ['NINGUNA', 'DISC', 'MEMB', 'MLACT', 'AMAY', 'ECRON', 'SINDI', 'ADOLE', 'LGBTQI'] as const;



export const caseSchema = z.object({
  // --- SECCIÓN 1: DATOS DE CONTACTO ---
  contacto: z.string().min(1, 'El campo Contacto es requerido'),
  nombreCompleto: z.string().min(1, 'El nombre es requerido'),
  sexo: z.enum(sexos).or(z.literal('')), // '' es para el estado inicial
  lugarContacto: z.string().optional(),
  tipoContacto: z.enum(tiposContacto).or(z.literal('')),
  canalContacto: z.string().min(1, 'El canal de contacto es requerido'),
  medioDigital: z.enum(mediosDigitales).or(z.literal('')).optional(),
  fechaContacto: z.date().nullable().optional(),
  horaContacto: z.string().optional(),

  // --- SECCIÓN 2: GESTIÓN ---
  tipoServicio: z.enum(tiposServicio).or(z.literal('')),

  detalleServicio: z.array(z.string()).optional(),
  
  consultaUsuario: z.string().optional(),
  respuestaAgente: z.string().optional(),
  
  // Campos de Denuncia
  empresaInvolucrada: z.string().optional(), // Este guarda el ID de la empresa
  lugarDesempenoLabores: z.enum(lugaresDesempeno),
  
  nombreComercial: z.string().optional(),
  direccionEmpresa: z.string().optional(),
  distritoEmpresa: z.string().optional(),
  telefonoEmpresa: z.string().optional(),
  emailEmpresa: z.string().email({ message: "Email inválido" }).or(z.literal('')).optional(),
  
  direccionSucursal: z.string().optional(),
  distritoSucursal: z.string().optional(),
  telefonoSucursal: z.string().optional(),
  emailSucursal: z.string().email({ message: "Email inválido" }).or(z.literal('')).optional(),

  // --- CORRECCIÓN CLAVE: Nombre estandarizado a camelCase ---
  tipoRazonSocial: z.enum(tiposRazonSocial).or(z.literal('')).optional(),
  tipoDenuncia: z.enum(tiposDenuncia).or(z.literal('')).optional(),

  // ... dentro de tu caseFormSchema
  actividadEconomica: z.enum(['AGR', 'IND', 'COM', 'SER', 'CON']).or(z.literal('')).optional(),
  // ...
  

  cantidadEmpleados: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number({ error: "Debe ser un número" })
     .positive("Debe ser un número positivo")
     .optional()
  ),

  nombreAgresor: z.string().optional(),
  cargoAgresor: z.string().optional(),
  // --- ¡NUEVO! SECCIÓN 3: DATOS DEL TRABAJADOR (PARA DENUNCIA ESPECIAL) ---
  trabajadorTipoDocumento: z.enum(tiposDocumento).or(z.literal('')),
  trabajadorNumeroDocumento: z.string(),
  trabajadorPaisDocumento: z.string().optional(), // Para DCA y PAS/RES
  trabajadorNombres: z.string(),
  trabajadorApellidos: z.string(),
  trabajadorSexo: z.enum(sexosUsuario).or(z.literal('')),
  trabajadorCaracteristica: z.enum(caracteristicas).or(z.literal('')),
  trabajadorCargo: z.string(),
  trabajadorTelefono: z.string(),
  trabajadorEmail: z.string().email({ message: "Email inválido" }).or(z.literal('')).optional(),
    // --- ¡NUEVO! SECCIÓN 4: DATOS DE CONMUTADOR ---
  conmutadorOpcion: z.string().optional(),
  conmutadorTransferenciaColaborador: z.string().optional(), // Guarda el ID del colaborador
  conmutadorInfoTramite: z.string().optional(), // Guarda el ID del servicio del catálogo
  conmutadorInfoSede: z.string().optional(), // Guarda el ID de la sede
  centroRecreacionConsultado: z.string().optional(), // Guarda el ID_CENTRO
})
.superRefine((data, ctx) => {
  // Regla para Asesoría
  if (data.tipoServicio === 'ASE') {
    // ... (lógica sin cambios)
  }

  // Reglas complejas para Denuncia
  if (data.tipoServicio === 'DEN') {
    // --- CORRECCIÓN CLAVE: Usar el nombre estandarizado 'tipoRazonSocial' ---
    if (!data.tipoRazonSocial) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['tipoRazonSocial'] });
    }
    if (!data.tipoDenuncia) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['tipoDenuncia'] });
    if (!data.actividadEconomica) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['actividadEconomica'] });
    if (!data.cantidadEmpleados) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['cantidadEmpleados'] });
    if (!data.consultaUsuario) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['consultaUsuario'] });
    if (!data.respuestaAgente) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['respuestaAgente'] });

    if (data.lugarDesempenoLabores === 'CM' || data.lugarDesempenoLabores === 'SU') {
        if (!data.nombreComercial) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['nombreComercial'] });
        // ... añadir más validaciones para los campos de CM
    }
    if (data.lugarDesempenoLabores === 'SU') {
        if (!data.direccionSucursal) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['direccionSucursal'] });
        // ... añadir más validaciones para los campos de SU
    }
    
    // Asumiendo que 'S-101' es el ID de "Acoso Laboral o Malos Tratos"
    if (data.detalleServicio?.includes('S-101')) {
      if (!data.nombreAgresor) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['nombreAgresor'] });
      if (!data.cargoAgresor) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['cargoAgresor'] });
    }
  }

  // --- ¡NUEVO! Reglas complejas para Denuncia Especial ---
    if (data.tipoServicio === 'DEN' && data.tipoDenuncia === 'ESP') {
        if (!data.trabajadorTipoDocumento) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['trabajadorTipoDocumento'] });
        if (!data.trabajadorNumeroDocumento) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['trabajadorNumeroDocumento'] });
        if (!data.trabajadorNombres) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['trabajadorNombres'] });
        if (!data.trabajadorApellidos) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['trabajadorApellidos'] });
        if (!data.trabajadorSexo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['trabajadorSexo'] });
        if (!data.trabajadorCaracteristica) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['trabajadorCaracteristica'] });
        if (!data.trabajadorCargo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['trabajadorCargo'] });
        if (!data.trabajadorTelefono) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['trabajadorTelefono'] });
        }

        // Reglas condicionales para el país
        if (data.trabajadorTipoDocumento === 'DCA-' && !data.trabajadorPaisDocumento) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'País es requerido', path: ['trabajadorPaisDocumento'] });
        }
        if ((data.trabajadorTipoDocumento === 'PAS-' || data.trabajadorTipoDocumento === 'RES-') && !data.trabajadorPaisDocumento) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'País es requerido', path: ['trabajadorPaisDocumento'] });
        }
});
export type CaseFormValues = z.infer<typeof caseSchema>;