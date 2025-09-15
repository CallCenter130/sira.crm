// =================================================================================================
// ARCHIVO: src/services/gasApi.ts (NUEVO ARCHIVO)
// RESPONSABILIDAD: Único punto de comunicación entre el Frontend y el Backend de Google Apps Script.
// =================================================================================================

// --- Importación de Tipos desde los archivos mock (reutilizamos las interfaces) ---
import type { IService, IEmpresa } from './mockApi';
import type { IUbicacion } from './mockUbicacionApi';
import type { IUsuario } from './mockUsuarioApi';
import type { ICentroRecreacion } from './mockCentrosRecreacion';
import type { IColaborador } from './mockColaboradores';
import type { ICatalogoServicio } from './mockCatalogo';
import type { ISede } from './mockSedes';
import type { IDireccion } from './mockDirecciones';

// 1. Obtenemos la URL de la API desde las variables de entorno.
const GAS_API_URL = import.meta.env.VITE_GAS_API_URL;

if (!GAS_API_URL) {
  throw new Error("Error de configuración: VITE_GAS_API_URL no está definida en el archivo .env.local");
}

// 2. Interfaz genérica para la respuesta de nuestra API de GAS.
interface GasApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// 3. Función genérica para realizar llamadas GET a nuestra API de GAS.
async function callGasGet<T>(entity: string, action: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(GAS_API_URL);
  url.searchParams.append('entity', entity);
  url.searchParams.append('action', action);
  for (const key in params) {
    url.searchParams.append(key, params[key]);
  }

  // NOTA: Para GAS, las llamadas con `withCredentials` requieren una configuración CORS específica
  // en el backend. Lo mantenemos simple por ahora.
  const response = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow', // GAS a menudo responde con una redirección que fetch debe seguir
  });

  const result: GasApiResponse<T> = await response.json();

  if (result.status === 'success' && result.data !== undefined) {
    return result.data;
  } else {
    throw new Error(result.message || 'Ocurrió un error desconocido en la API.');
  }
}

// 4. Función genérica para realizar llamadas POST a nuestra API de GAS.
async function callGasPost<T>(entity: string, action: string, data: Record<string, any> = {}, id?: string): Promise<T> {
  const body = {
    entity,
    action,
    data,
    id,
  };

  const response = await fetch(GAS_API_URL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // GAS a menudo prefiere text/plain para doPost
    },
  });
  
  const result: GasApiResponse<T> = await response.json();
  
  if (result.status === 'success' && result.data !== undefined) {
    return result.data;
  } else {
    throw new Error(result.message || 'Ocurrió un error desconocido en la API.');
  }
}


// =================================================================================
// EXPORTACIÓN DE FUNCIONES QUE REEMPLAZAN A LOS MOCKS
// Mantenemos la misma firma (nombres y parámetros) para una fácil sustitución.
// =================================================================================

// --- Desde mockApi.ts ---
export const getServicios = (): Promise<IService[]> => callGasGet('SERVICIOS', 'listActive');
export const getEmpresas = (): Promise<IEmpresa[]> => callGasGet('EMPRESAS', 'list');
export const saveEmpresa = (data: Omit<IEmpresa, 'ID_REGEMP'>): Promise<IEmpresa> => callGasPost('EMPRESAS', 'create', data);
export const updateEmpresa = (id: string, data: Partial<IEmpresa>): Promise<IEmpresa> => callGasPost('EMPRESAS', 'update', data, id);

// --- Desde mockUbicacionApi.ts ---
export const getUbicaciones = (): Promise<IUbicacion[]> => callGasGet('UBICACIONES', 'list');

// --- Desde mockUsuarioApi.ts ---
export const findUsuarioByKey = (keyAtus: string): Promise<IUsuario | null> => callGasGet('USUARIOS', 'findByKey', { key: keyAtus });

// --- Desde mockCentrosRecreacion.ts ---
export const getCentrosRecreacion = (): Promise<ICentroRecreacion[]> => callGasGet('CENTROS_RECREACION', 'list');

// --- Desde mockColaboradores.ts ---
export const getColaboradores = (): Promise<IColaborador[]> => callGasGet('COLABORADORES', 'list');

// --- Desde mockCatalogo.ts ---
export const getCatalogoServicios = (): Promise<ICatalogoServicio[]> => callGasGet('CATALOGO_SERVICIOS', 'list');

// --- Desde mockSedes.ts ---
export const getSedes = (): Promise<ISede[]> => callGasGet('SEDES', 'list');

// --- Desde mockDirecciones.ts ---
export const getDirecciones = (): Promise<IDireccion[]> => callGasGet('DIRECCIONES', 'list');

// --- Desde api.ts (getCountryFromPhone) ---
// Esta es una función especial que podría tener su propia lógica en GAS
export const getCountryFromPhone = (phoneNumber: string): Promise<{ success: boolean; data?: { country: string }; error?: string }> => {
    // Para este caso, la llamada es diferente, no sigue el patrón entity/action
    const url = new URL(GAS_API_URL);
    url.searchParams.append('action', 'getCountryFromPhone');
    url.searchParams.append('phone', phoneNumber);
    
    return fetch(url.toString(), { method: 'GET', redirect: 'follow' }).then(res => res.json());
}