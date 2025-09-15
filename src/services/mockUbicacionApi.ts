// =================================================================================================
// ARCHIVO: src/services/mockUbicacionApi.ts
// INSTRUCCIÓN: CÓDIGO COMPLETO PARA EL NUEVO ARCHIVO
// =================================================================================================

// 1. Definimos una interfaz para la estructura de nuestros datos.
//    Esto proporciona seguridad de tipos en toda la aplicación.
export interface IUbicacion {
  id_distrito: string;
  Distrito: string;
  Municipio: string;
  Departamento: string;
}

// 2. Mantenemos la constante con los datos mock dentro de este archivo.
//    No se exporta, ya que es un detalle de implementación interno.
const mockUbicaciones: IUbicacion[] = [
    { id_distrito: '1', Distrito: 'SAN SALVADOR', Municipio: 'SAN SALVADOR', Departamento: 'SAN SALVADOR' },
    { id_distrito: '2', Distrito: 'MEJICANOS', Municipio: 'SAN SALVADOR', Departamento: 'SAN SALVADOR' },
    // Puedes añadir más ubicaciones aquí para probar
    { id_distrito: '3', Distrito: 'SOYAPANGO', Municipio: 'SAN SALVADOR', Departamento: 'SAN SALVADOR' },
    { id_distrito: '4', Distrito: 'SANTA TECLA', Municipio: 'LA LIBERTAD', Departamento: 'LA LIBERTAD' },
];

/**
 * Simula una llamada a una API para obtener la lista de ubicaciones.
 * Incluye un retraso artificial para imitar la latencia de red.
 * @returns Una promesa que resuelve con un array de objetos IUbicacion.
 */
export const getUbicaciones = async (): Promise<IUbicacion[]> => {
  console.log('[API MOCK] Solicitando lista de ubicaciones...');
  
  // Simulación de retraso de red (ej. 300ms)
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log('[API MOCK] Respuesta exitosa de ubicaciones.');
  return mockUbicaciones;
};