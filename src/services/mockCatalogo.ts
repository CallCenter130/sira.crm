// =================================================================================================
// ARCHIVO: src/services/mockCatalogo.ts (VERSIÓN A PRUEBA DE FALLOS)
// =================================================================================================

// La palabra 'export' aquí es la solución. Asegúrate de que está presente.
export interface ICatalogoServicio {
  ID_SERVICIO: string;
  NOMBRE_SERVICIO: string;
  OBJETIVO_SERVICIO: string;
  PROCEDIMIENTO: string;
  [key: string]: any; 
}

const mockCatalogo: ICatalogoServicio[] = [
  { ID_SERVICIO: 'CAT-01', NOMBRE_SERVICIO: 'Inscripción de Contrato Colectivo', OBJETIVO_SERVICIO: 'Registrar legalmente los contratos colectivos.', PROCEDIMIENTO: '1. Presentar solicitud escrita...\n2. Adjuntar 3 copias del contrato...' },
  { ID_SERVICIO: 'CAT-02', NOMBRE_SERVICIO: 'Cálculo de Indemnización', OBJETIVO_SERVICIO: 'Proveer un cálculo estimado de la indemnización por despido.', PROCEDIMIENTO: '1. Presentar DUI y carta de despido...\n2. El cálculo se entrega en el momento.' },
];

export const getCatalogoServicios = async (): Promise<ICatalogoServicio[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCatalogo;
};