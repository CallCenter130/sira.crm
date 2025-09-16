// =================================================================================================
// ARCHIVO: src/services/mockSedes.ts (CORREGIDO)
// =================================================================================================
// --- CORRECCIÓN: Añadir 'export' a la interfaz ---
export interface ISede {
  ID: string;
  SEDE: string;
  JEFE_DE_SEDE: string;
  DIRECCION_SEDE: string;
  TELEFONOS: string;
  [key: string]: any;
}

const mockSedes: ISede[] = [
  { ID: 'S01', SEDE: 'Oficinas Centrales, San Salvador', JEFE_DE_SEDE: 'Lic. Juan Pérez', DIRECCION_SEDE: 'Alameda Juan Pablo II y 17 Av. Norte', TELEFONOS: '2529-3700, 2529-3701' },
  { ID: 'S02', SEDE: 'Oficina Departamental, Santa Ana', JEFE_DE_SEDE: 'Lic. Ana Morales', DIRECCION_SEDE: '4a Av. Sur, entre 1a y 3a Calle Pte', TELEFONOS: '2441-1634' },
  { ID: 'S03', SEDE: 'Oficina Departamental, San Miguel', JEFE_DE_SEDE: 'Lic. Carlos Rivas', DIRECCION_SEDE: '8a Calle Pte, entre 6a y 8a Av. Nte.', TELEFONOS: '2661-2943' },
];

export const getSedes = async (): Promise<ISede[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockSedes;
}