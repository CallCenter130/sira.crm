// =================================================================================================
// ARCHIVO: src/services/mockColaboradores.ts (CORREGIDO)
// =================================================================================================
// --- CORRECCIÓN: Añadir 'export' a la interfaz ---
export interface IColaborador {
  ID: string;
  NOMBRE_EMPLEADO: string;
  EXTENSION: string;
  OFICINA: string;
  DIRECCION: string;
}

const mockColaboradores: IColaborador[] = [
  { ID: 'C001', NOMBRE_EMPLEADO: 'JUAN CARLOS PEREZ GOMEZ', EXTENSION: '2050', OFICINA: 'Dirección General de Inspección', DIRECCION: 'Recursos Humanos' },
  { ID: 'C002', NOMBRE_EMPLEADO: 'MARIA ELENA RODRIGUEZ', EXTENSION: '2055', OFICINA: 'Dirección General de Trabajo', DIRECCION: 'Relaciones Laborales' },
  { ID: 'C003', NOMBRE_EMPLEADO: 'CARLOS ALBERTO MARTINEZ', EXTENSION: '3010', OFICINA: 'Despacho Ministerial', DIRECCION: 'Asistente' },
];

export const getColaboradores = async (): Promise<IColaborador[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockColaboradores;
};