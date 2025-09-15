// src/services/api.ts

/**
 * Simula una llamada a la API de Google Apps Script para obtener el país de un número de teléfono.
 * Esta función imita el comportamiento de la API real, incluyendo un retraso artificial.
 * 
 * @param phoneNumber El número de teléfono internacional a validar.
 * @returns Una promesa que resuelve con un objeto similar a la respuesta de la API real.
 */
export const getCountryFromPhone = async (phoneNumber: string): Promise<{ success: boolean; data?: { country: string }; error?: string }> => {
  console.log(`[API MOCK] Solicitando país para: ${phoneNumber}`);

  // Simulación de retraso de red
  await new Promise(resolve => setTimeout(resolve, 800));

  // Lógica de simulación
  // Podemos añadir lógica simple para simular diferentes respuestas
  if (phoneNumber.startsWith('+1')) {
    console.log('[API MOCK] Respuesta exitosa para +1');
    return {
      success: true,
      data: {
        country: 'ESTADOS UNIDOS/CANADÁ'
      }
    };
  }
  
  if (phoneNumber.startsWith('+503')) {
    console.log('[API MOCK] Respuesta de error para +503 (es local)');
     return {
      success: false,
      error: 'El Número de teléfono inicia con +50322313122, solo debe ingresar los últimos 8 digitos ya que es local ejemplo 22313122. Los números telefónicos internacionales inician con 1 y debe anteponer el signo ( + ), ejemplo: +12025550123'
    };
  }

  // Respuesta por defecto para cualquier otro número internacional
  console.log('[API MOCK] Respuesta genérica exitosa');
  return {
    success: true,
    data: {
      country: 'INTERNACIONAL (SIMULADO)'
    }
  };
};

/**
 * En el futuro, cuando conectemos el backend real, esta sería la función que usaríamos.
 * La comentamos por ahora.
 */
/*
import axios from 'axios';
const GAS_API_URL = import.meta.env.VITE_GAS_API_URL;

export const getCountryFromPhoneReal = async (phoneNumber: string) => {
  const response = await axios.post(GAS_API_URL, {
    action: 'GET_COUNTRY_FROM_PHONE',
    payload: { phoneNumber }
  });
  return response.data; // { success: boolean, data: { country: string } }
}
*/