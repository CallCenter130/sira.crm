// =================================================================================================
// ARCHIVO: src/services/mockDirecciones.ts
// RESPONSABILIDAD: Proveer una lista simulada de las Direcciones internas del ministerio.
// =================================================================================================

export interface IDireccion {
  ID_DIRECCION: string;
  DIRECCION: string;
}

const mockDirecciones: IDireccion[] = [
  { ID_DIRECCION: 'DIR-01', DIRECCION: 'DIRECCIÓN GENERAL DE TRABAJO' },
  { ID_DIRECCION: 'DIR-02', DIRECCION: 'DIRECCIÓN GENERAL DE INSPECCIÓN DE TRABAJO' },
  { ID_DIRECCION: 'DIR-03', DIRECCION: 'DIRECCIÓN GENERAL DE PREVISIÓN SOCIAL' },
  { ID_DIRECCION: 'DIR-04', DIRECCION: 'DIRECCIÓN NACIONAL DE EMPLEO' },
  { ID_DIRECCION: 'DIR-05', DIRECCION: 'DIRECCIÓN DE RELACIONES INTERNACIONALES DE TRABAJO' },
];

export const getDirecciones = async (): Promise<IDireccion[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  return mockDirecciones;
};