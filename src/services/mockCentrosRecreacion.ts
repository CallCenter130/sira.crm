// =================================================================================================
// ARCHIVO: src/services/mockCentrosRecreacion.ts
// INSTRUCCIÓN: CÓDIGO COMPLETO PARA EL NUEVO ARCHIVO
// =================================================================================================

export interface ICentroRecreacion {
  ID_CENTRO: string;
  CENTRO_RECREACION: string;
  UBICACION: string;
  INSTALACIONES: string;
  INFORMACION: string;
  COSTOS: string;
  RESERVACIONES: string;
  CONTACTO_VISITA: string;
  AVISO_IMPORTANTE: string;
}

const mockCentros: ICentroRecreacion[] = [
  {
    ID_CENTRO: 'CR-COA',
    CENTRO_RECREACION: 'Centro de Recreación “1950 Constitución”',
    UBICACION: 'Lago de Coatepeque, Santa Ana',
    INSTALACIONES: 'Piscinas, cabañas, áreas de picnic, restaurante, acceso al lago.',
    INFORMACION: 'Abierto de martes a domingo de 8:00 a.m. a 5:00 p.m.',
    COSTOS: 'Entrada General: $1.50. Cabañas desde $25.00 por día.',
    RESERVACIONES: 'Llamar al 2441-1234 con al menos 72 horas de anticipación.',
    CONTACTO_VISITA: 'Juan Martínez, Administrador.',
    AVISO_IMPORTANTE: 'No se permite el ingreso de bebidas alcohólicas.'
  },
  {
    ID_CENTRO: 'CR-CON',
    CENTRO_RECREACION: 'Centro Recreativo “Romero Albergue”',
    UBICACION: 'Costa del Sol, La Paz',
    INSTALACIONES: 'Piscinas para adultos y niños, canchas de fútbol y baloncesto, restaurante, ranchos hamaqueros.',
    INFORMACION: 'Horario: 8:00 a.m. a 5:00 p.m. todos los días.',
    COSTOS: 'Entrada: $2.00. Uso de canchas incluido.',
    RESERVACIONES: 'Para eventos especiales, contactar al 2338-5678.',
    CONTACTO_VISITA: 'Sofía Hernández, Gerente.',
    AVISO_IMPORTANTE: 'Se recomienda el uso de protector solar. Marea alta después de las 3:00 p.m.'
  },
  {
    ID_CENTRO: 'CR-PAL',
    CENTRO_RECREACION: 'Centro de Recreación “Dr. Mario Zamora Rivas”',
    UBICACION: 'Los Planes de Renderos, San Salvador',
    INSTALACIONES: 'Piscinas, toboganes, áreas verdes, juegos para niños, anfiteatro.',
    INFORMACION: 'Abierto fines de semana y días festivos de 9:00 a.m. a 5:30 p.m.',
    COSTOS: 'Entrada General: $1.00. Niños menores de 5 años gratis.',
    RESERVACIONES: 'No se requiere reservación para visitas individuales.',
    CONTACTO_VISITA: 'Administración del parque.',
    AVISO_IMPORTANTE: 'El parqueo es limitado. Se recomienda llegar temprano.'
  },
  {
    ID_CENTRO: 'CR-TAM',
    CENTRO_RECREACION: 'Centro de Recreación “Dr. Miguel Félix Charlaix”',
    UBICACION: 'Tamarindo, La Unión',
    INSTALACIONES: 'Acceso a la playa, restaurante de mariscos, piscina, ranchos.',
    INFORMACION: 'Horario de 8:00 a.m. a 6:00 p.m.',
    COSTOS: 'Entrada: $1.50 por persona.',
    RESERVACIONES: 'Para grupos grandes, llamar al 2664-9876.',
    CONTACTO_VISITA: 'Carlos Fuentes, Encargado.',
    AVISO_IMPORTANTE: 'Cuidado con las corrientes marinas.'
  }
];

/**
 * Simula una llamada a API para obtener la lista de Centros de Recreación.
 * @returns Una promesa que resuelve con un array de objetos ICentroRecreacion.
 */
export const getCentrosRecreacion = async (): Promise<ICentroRecreacion[]> => {
  console.log('[API MOCK] Solicitando lista de Centros de Recreación...');
  // Simulación de retraso de red
  await new Promise(resolve => setTimeout(resolve, 350));
  console.log('[API MOCK] Respuesta exitosa de Centros de Recreación.');
  return mockCentros;
};