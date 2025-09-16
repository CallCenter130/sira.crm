// =================================================================================================
// ARCHIVO: src/services/mockUsuarioApi.ts
// INSTRUCCIÓN: CÓDIGO COMPLETO PARA EL NUEVO ARCHIVO
// =================================================================================================

// 1. Definimos una interfaz para la estructura del usuario, basada en tus columnas de G-Sheet.
export interface IUsuario {
  KEY_ATUS: string;
  TIPO_IDENTIFICACION: 'DUI-' | 'RES-' | 'DCA-' | 'PAS-';
  ID_USUARIO: string;
  PAIS_IDENTIFICACION: string; // Puede ser de Centroamérica o del mundo
  NOMBRE_USUARIO: string;
  APELLIDO_USUARIO: string;
  SEXO_USUARIO: 'MASCULINO' | 'FEMENINO';
  CARACTERISTICA_USUARIO: string;
  TEL_USUARIO: string;
  EMAIL_USUARIO: string;
  CARGO: string; // Añadimos el campo Cargo que solicitaste
}

// 2. Creamos una base de datos simulada en memoria.
const mockUsuarios: IUsuario[] = [
  { 
    KEY_ATUS: 'DUI-014735502', TIPO_IDENTIFICACION: 'DUI-', ID_USUARIO: '014735502',
    PAIS_IDENTIFICACION: 'EL SALVADOR', NOMBRE_USUARIO: 'ABEL IVAN', APELLIDO_USUARIO: 'CASTRO DURAN',
    SEXO_USUARIO: 'MASCULINO', CARACTERISTICA_USUARIO: 'NINGUNA',
    TEL_USUARIO: '7777-8888', EMAIL_USUARIO: 'abel.castro@email.com', CARGO: 'OPERARIO DE MAQUILA'
  },
  { 
    KEY_ATUS: 'DUI-019641287', TIPO_IDENTIFICACION: 'DUI-', ID_USUARIO: '019641287',
    PAIS_IDENTIFICACION: 'EL SALVADOR', NOMBRE_USUARIO: 'ANA SOFIA', APELLIDO_USUARIO: 'GOMEZ PEREZ',
    SEXO_USUARIO: 'FEMENINO', CARACTERISTICA_USUARIO: 'MLACT',
    TEL_USUARIO: '7123-4567', EMAIL_USUARIO: 'ana.gomez@email.com', CARGO: 'ASISTENTE ADMINISTRATIVA'
  },
   { 
    KEY_ATUS: 'DCA-HN12345', TIPO_IDENTIFICACION: 'DCA-', ID_USUARIO: 'HN12345',
    PAIS_IDENTIFICACION: 'HONDURAS', NOMBRE_USUARIO: 'CARLOS', APELLIDO_USUARIO: 'MOLINA',
    SEXO_USUARIO: 'MASCULINO', CARACTERISTICA_USUARIO: 'NINGUNA',
    TEL_USUARIO: '50499887766', EMAIL_USUARIO: 'carlos.m@email.hn', CARGO: 'CONDUCTOR'
  },
];

/**
 * Simula la búsqueda de un usuario en la base de datos (Google Sheet) por su KEY_ATUS.
 * @param keyAtus La clave única del usuario (ej. 'DUI-014735502').
 * @returns Una promesa que resuelve con el objeto de usuario o null si no se encuentra.
 */
export const findUsuarioByKey = async (keyAtus: string): Promise<IUsuario | null> => {
  console.log(`[API MOCK] Buscando usuario con KEY_ATUS: ${keyAtus}`);
  // Simular latencia de red
  await new Promise(resolve => setTimeout(resolve, 600));

  const usuarioEncontrado = mockUsuarios.find(u => u.KEY_ATUS === keyAtus.toUpperCase());
  
  if (usuarioEncontrado) {
    console.log('[API MOCK] Usuario encontrado:', usuarioEncontrado);
    return usuarioEncontrado;
  } else {
    console.log('[API MOCK] Usuario no encontrado.');
    return null;
  }
};