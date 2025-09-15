// src/services/mockApi.ts

// --- Mock para la lista de Servicios ---
export interface IService {
  ID_SERVICIO: string;
  NOMBRE_SERVICIO: string;
  UNIDAD_RESPONSABLE: string;
  DIRECCION_RESPONSABLE: string;
}
const mockServicios: IService[] = [
  { ID_SERVICIO: 'S-100', NOMBRE_SERVICIO: 'Cálculo de Prestaciones', UNIDAD_RESPONSABLE: 'Inspección', DIRECCION_RESPONSABLE: 'Dirección General de Inspección de Trabajo' },
  { ID_SERVICIO: 'S-101', NOMBRE_SERVICIO: 'Acoso Laboral o Malos Tratos', UNIDAD_RESPONSABLE: 'Inspección', DIRECCION_RESPONSABLE: 'Dirección General de Inspección de Trabajo' },
  { ID_SERVICIO: 'S-200', NOMBRE_SERVICIO: 'Reglamento Interno', UNIDAD_RESPONSABLE: 'Relaciones Laborales', DIRECCION_RESPONSABLE: 'Dirección General de Trabajo' },
];

// <-- ¡ASEGÚRATE DE QUE 'export' ESTÉ AQUÍ!
export const getServicios = async (): Promise<IService[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockServicios;
};


// --- Mock para la lista de Empresas ---
export interface IEmpresa {
  ID_REGEMP: string;
  RAZON_SOCIAL: string;
  NOMBRE_COMERCIAL: string;
  TIPO_RAZON_SOCIAL: 'PN' | 'PJ' | '';
  DIRECCION: string;
  DISTRITO: string;
  TELEFONO: string;
  EMAIL: string;
  FECHA_REGISTRO: string;
  FECHA_MODIFICACION: string;
}
const mockEmpresas: IEmpresa[] = [
  { ID_REGEMP: 'E-001', RAZON_SOCIAL: 'GRUPO CALLEJA, S.A. DE C.V.', NOMBRE_COMERCIAL: 'Super Selectos', TIPO_RAZON_SOCIAL: 'PJ', DIRECCION: 'Calle Principal', DISTRITO: 'Santa Ana', TELEFONO: '2222-2222', EMAIL: 'contacto@selectos.com', FECHA_REGISTRO: new Date().toISOString(), FECHA_MODIFICACION: new Date().toISOString() },
  { ID_REGEMP: 'E-002', RAZON_SOCIAL: 'CORPORACIÓN MULTI INVERSIONES, S.A.', NOMBRE_COMERCIAL: 'Pollo Campero', TIPO_RAZON_SOCIAL: 'PJ', DIRECCION: 'Centro Comercial Galerías', DISTRITO: 'San Miguel', TELEFONO: '2323-2323', EMAIL: 'info@campero.com', FECHA_REGISTRO: new Date().toISOString(), FECHA_MODIFICACION: new Date().toISOString() },
];

// <-- ¡ASEGÚRATE DE QUE 'export' ESTÉ AQUÍ!
export const getEmpresas = async (): Promise<IEmpresa[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockEmpresas;
};

// <-- ¡ASEGÚRATE DE QUE 'export' ESTÉ AQUÍ!
export const saveEmpresa = async (data: Omit<IEmpresa, 'ID_REGEMP' | 'FECHA_REGISTRO' | 'FECHA_MODIFICACION'>): Promise<IEmpresa> => {
    const now = new Date().toISOString();
    const newEmpresa: IEmpresa = { 
        ...data, 
        ID_REGEMP: `E-NEW-${Date.now()}`,
        FECHA_REGISTRO: now,
        FECHA_MODIFICACION: now
    };
    mockEmpresas.push(newEmpresa);
    return newEmpresa;
}

// <-- ¡ASEGÚRATE DE QUE 'export' ESTÉ AQUÍ!
export const updateEmpresa = async (id: string, data: Partial<Omit<IEmpresa, 'ID_REGEMP' | 'FECHA_REGISTRO'>>): Promise<IEmpresa> => {
    const index = mockEmpresas.findIndex(e => e.ID_REGEMP === id);
    if(index > -1) {
        mockEmpresas[index] = { 
            ...mockEmpresas[index], 
            ...data,
            FECHA_MODIFICACION: new Date().toISOString()
        };
        return mockEmpresas[index];
    }
    throw new Error("Empresa no encontrada");
}