/**
 * utils.gs
 *
 * Este archivo contiene funciones de utilidad general para el proyecto CRM,
 * incluyendo la gestión de propiedades del script desde Google Sheets
 * y el registro de eventos en hojas de cálculo de log.
 */

// --- CONSTANTES ---
// Clave en las propiedades del script que guarda el ID de SheetPropiedades.
// Según tu log, esta propiedad se llama 'SHEET_ID_SIRA_SHEETPROPIEDADES'.
const PROPERTIES_SHEET_NAME_KEY = 'SHEET_ID_SIRA_SHEETPROPIEDADES'; 

// Nombre lógico del archivo de log de propiedades en SheetPropiedades.
// Este valor DEBE coincidir exactamente con lo que está en la columna 'Nombre_googlesheet'
// de tu SheetPropiedades para la fila del log.
// Asumiremos que es el nombre "limpio" que quieres: 'Log_Propiedades_CRM'.
const LOG_SHEET_IDENTIFIER_NAME = 'sira_Log_Propiedades_CRM';

// Prefijo base para todas las propiedades de ID de hojas que se almacenan en las propiedades del script.
// Esto asegura consistencia, según tu log, este prefijo es 'SHEET_ID_SIRA_'.
const SCRIPT_PROPERTY_ID_PREFIX = 'SHEET_ID_';


// --- FUNCIONES DE LOGGING Y GESTIÓN DE PROPIEDADES ---

/**
 * Helper function para registrar cambios importantes en la configuración de Google Sheets
 * en el archivo 'Log_Propiedades_CRM.gsheet'.
 * Esta función es crucial para la auditoría y el cumplimiento de ISO 9001 y 37001.
 *
 * @param {string} action La acción realizada (e.g., "AÑADIDO", "ACTUALIZADO_ID", "DESACTIVADO_Y_ELIMINADO").
 * @param {string} sheetLogicalName El nombre lógico de la hoja/tabla afectada (e.g., "Agentes").
 * @param {string} propertyKey La clave de la propiedad del script que fue modificada (e.g., "SHEET_ID_SIRA_AGENTES").
 * @param {string | null} oldValue El valor antiguo de la propiedad (puede ser null).
 * @param {string | null} newValue El nuevo valor de la propiedad (puede ser null).
 * @param {string} statusInSheetProp El 'Estado' del item en SheetPropiedades en el momento del log (e.g., "Activo", "Inactivo").
 * @param {string} notes Notas adicionales sobre el cambio.
 */
function logPropertyChange(action, sheetLogicalName, propertyKey, oldValue, newValue, statusInSheetProp, notes) {
  try {
    const propertiesSheetId = PropertiesService.getScriptProperties().getProperty(PROPERTIES_SHEET_NAME_KEY);
    if (!propertiesSheetId) {
      Logger.log(`ERROR: '${PROPERTIES_SHEET_NAME_KEY}' no está configurado en las propiedades del script o el nombre es incorrecto. No se puede acceder a SheetPropiedades para obtener el ID del log.`);
      return;
    }

    const ssProperties = SpreadsheetApp.openById(propertiesSheetId);
    // Asumiendo que SheetPropiedades tiene los datos en la primera hoja del libro
    const sheetPropsData = ssProperties.getSheets()[0].getDataRange().getValues();

    let logSheetId = null;
    if (sheetPropsData.length > 1) {
      const headers = sheetPropsData[0];
      const nameColIdx = headers.indexOf('Nombre_googlesheet');
      const idColIdx = headers.indexOf('ID_googlesheet');

      // Buscar el ID del archivo de log dentro de SheetPropiedades usando su nombre lógico limpio
      for (let i = 1; i < sheetPropsData.length; i++) {
        if (sheetPropsData[i][nameColIdx] === LOG_SHEET_IDENTIFIER_NAME) { 
          logSheetId = sheetPropsData[i][idColIdx];
          break;
        }
      }
    }

    if (!logSheetId) {
      Logger.log(`ERROR: ID para el log sheet con nombre lógico '${LOG_SHEET_IDENTIFIER_NAME}' no encontrado en SheetPropiedades. Asegúrate de que está registrado correctamente en tu SheetPropiedades.`);
      return;
    }

    const logSs = SpreadsheetApp.openById(logSheetId);
    // Asumiendo que el archivo Log_Propiedades_CRM tiene los datos en la primera hoja del libro
    const logSheet = logSs.getSheets()[0];

    const userEmail = Session.getActiveUser().getEmail(); 
    const timestamp = formatDateToISO(new Date()); 

    logSheet.appendRow([
      timestamp,
      action,
      sheetLogicalName,
      propertyKey,
      oldValue,
      newValue,
      statusInSheetProp,
      userEmail,
      notes
    ]);
    Logger.log(`Log entry created: ${action} - ${sheetLogicalName} (${propertyKey})`);

  } catch (error) {
    Logger.log(`ERROR crítico al intentar registrar en el log: ${error.message} (Stack: ${error.stack})`);
  }
}

/**
 * Carga o actualiza las propiedades del script desde el Sheet "SheetPropiedades",
 * teniendo en cuenta el campo 'Estado' y registrando los cambios.
 * Esta función es la responsable de la sincronización automática.
 */
function updateScriptPropertiesFromSheetProperties() {
  const propertiesSheetId = PropertiesService.getScriptProperties().getProperty(PROPERTIES_SHEET_NAME_KEY);
  if (!propertiesSheetId) {
    Logger.log(`ERROR: '${PROPERTIES_SHEET_NAME_KEY}' no está configurado en las propiedades del script o el nombre es incorrecto.`);
    throw new Error(`${PROPERTIES_SHEET_NAME_KEY} no configurado.`);
  }

  const ss = SpreadsheetApp.openById(propertiesSheetId);
  const sheet = ss.getSheets()[0]; // Asumiendo que SheetPropiedades tiene los datos en la primera hoja

  if (!sheet) {
    Logger.log("ERROR: La hoja principal no se encontró en SheetPropiedades.");
    throw new Error("Hoja de propiedades no encontrada.");
  }

  const range = sheet.getDataRange();
  const values = range.getValues();

  if (values.length < 2) { 
    Logger.log("Advertencia: No hay datos en SheetPropiedades para cargar.");
    return;
  }

  const headers = values[0];
  const scriptProperties = PropertiesService.getScriptProperties();
  const currentScriptProperties = scriptProperties.getProperties(); 

  const nameColIdx = headers.indexOf('Nombre_googlesheet');
  const idColIdx = headers.indexOf('ID_googlesheet');
  const statusColIdx = headers.indexOf('Estado'); 

  if (nameColIdx === -1 || idColIdx === -1 || statusColIdx === -1) {
    Logger.log("ERROR: Encabezados obligatorios faltantes en SheetPropiedades (Nombre_googlesheet, ID_googlesheet, Estado).");
    throw new Error("Encabezados de SheetPropiedades incompletos.");
  }

  const processedPropertiesKeys = new Set(); // Para llevar un registro de las claves de propiedades del script procesadas

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const sheetLogicalName = row[nameColIdx]; // Nombre lógico limpio (ej. "Agentes", "Log_Propiedades_CRM")
    const sheetId = row[idColIdx];
    const sheetStatus = row[statusColIdx];

    if (!sheetLogicalName || !sheetId || !sheetStatus) {
      Logger.log(`Advertencia: Fila incompleta en SheetPropiedades, saltando procesamiento: ${JSON.stringify(row)}`);
      continue;
    }

    // Construir la clave de la propiedad del script con el prefijo consistente
    const propKey = SCRIPT_PROPERTY_ID_PREFIX + sheetLogicalName.toUpperCase();
    processedPropertiesKeys.add(propKey); // Añadir a las procesadas
    const oldId = currentScriptProperties[propKey];

    if (String(sheetStatus).toUpperCase() === 'ACTIVO') {
      if (oldId !== sheetId) {
        scriptProperties.setProperty(propKey, sheetId);
        logPropertyChange(
          oldId ? "ACTUALIZADO_ID" : "AÑADIDO",
          sheetLogicalName, // Nombre lógico para el log
          propKey,
          oldId,
          sheetId,
          sheetStatus,
          oldId ? "ID de la hoja actualizado en propiedades del script." : "Nueva hoja activada y añadida a propiedades del script."
        );
      } else {
        logPropertyChange(
          "ESTADO_MANTENIDO_ACTIVO",
          sheetLogicalName,
          propKey,
          sheetId, 
          sheetId, 
          sheetStatus,
          "Hoja activa, propiedad del script no requirió cambio de ID."
        );
      }
    } else if (String(sheetStatus).toUpperCase() === 'INACTIVO') {
      if (oldId) { 
        scriptProperties.deleteProperty(propKey);
        logPropertyChange(
          "DESACTIVADO_Y_ELIMINADO",
          sheetLogicalName,
          propKey,
          oldId,
          null, 
          sheetStatus,
          "Hoja desactivada en SheetPropiedades y eliminada de propiedades del script."
        );
      } else {
        logPropertyChange(
          "ESTADO_MANTENIDO_INACTIVO",
          sheetLogicalName,
          propKey,
          null,
          null,
          sheetStatus,
          "Hoja inactiva, propiedad del script no existía o ya estaba eliminada."
        );
      }
    } else {
      Logger.log(`Advertencia: Estado desconocido '${sheetStatus}' para la hoja '${sheetLogicalName}'.`);
      logPropertyChange(
        "ESTADO_DESCONOCIDO",
        sheetLogicalName,
        propKey,
        oldId,
        sheetId,
        sheetStatus,
        "Estado desconocido en SheetPropiedades. No se tomó acción sobre la propiedad del script."
      );
    }
  }

  // Eliminar propiedades del script que ya no existen en SheetPropiedades o están inactivas
  // y no fueron procesadas por el bucle principal (ej. si se eliminó una fila por completo).
  for (let propKey in currentScriptProperties) {
    // Solo procesar las propiedades que empiezan con nuestro prefijo
    if (propKey.startsWith(SCRIPT_PROPERTY_ID_PREFIX) && !processedPropertiesKeys.has(propKey)) {
      scriptProperties.deleteProperty(propKey);
      // Intentamos derivar el nombre lógico de la hoja del propKey si es posible
      const deletedSheetLogicalName = propKey.replace(SCRIPT_PROPERTY_ID_PREFIX, ''); // Quitamos el prefijo
      logPropertyChange(
        "ELIMINADO_NO_ENCONTRADO_EN_SHEET",
        deletedSheetLogicalName, // Usamos el nombre lógico derivado para el log
        propKey,
        currentScriptProperties[propKey],
        null,
        "N/A", // No podemos determinar el estado si ya no está en la hoja
        "Propiedad eliminada porque ya no existe en SheetPropiedades (o fue desactivada y no procesada)."
      );
    }
  }

  Logger.log("Propiedades del script actualizadas desde SheetPropiedades, con gestión de Estado y Logging.");
}

/**
 * Función que actuará como disparador 'onEdit' para el Google Sheet 'SheetPropiedades'.
 * Se activa cada vez que se edita el archivo vinculado.
 *
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e El objeto de evento que contiene información sobre la edición.
 */
function onSheetPropertiesEdit(e) {
  const propertiesSheetId = PropertiesService.getScriptProperties().getProperty(PROPERTIES_SHEET_NAME_KEY);
  if (e && e.source && e.source.getId() === propertiesSheetId) {
    Logger.log("Detectado un cambio en SheetPropiedades. Iniciando actualización de propiedades del script y registro...");
    updateScriptPropertiesFromSheetProperties();
  } else {
    Logger.log("Disparador onEdit ejecutado pero no desde el archivo SheetPropiedades o evento inválido. Ignorando.");
  }
}


// --- FUNCIONES DE UTILIDAD GENERAL ---

/**
 * Formatea un objeto Date a una cadena ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ).
 * @param {Date} dateObj El objeto Date a formatear.
 * @returns {string} La fecha formateada en ISO 8601.
 */
function formatDateToISO(dateObj) {
  if (!(dateObj instanceof Date)) {
    throw new Error("El argumento debe ser un objeto Date válido.");
  }
  return dateObj.toISOString();
}

/**
 * Obtiene un timestamp UNIX (milisegundos desde 1970-01-01 UTC).
 * @returns {number} El timestamp actual en milisegundos.
 */
function getTimestamp() {
  return new Date().getTime();
}

/**
 * Verifica si una cadena es un formato de correo electrónico válido (básico).
 * @param {string} email La cadena a validar.
 * @returns {boolean} True si es un email válido, false en caso contrario.
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Verifica si un valor es un número.
 * @param {*} value El valor a verificar.
 * @returns {boolean} True si el valor es numérico, false en caso contrario.
 */
function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Verifica si un objeto de datos contiene todos los campos requeridos.
 * @param {Object} data El objeto de datos a verificar.
 * @param {Array<string>} requiredFields Un array de cadenas con los nombres de los campos requeridos.
 * @returns {boolean} True si el objeto tiene todos los campos requeridos, false en caso contrario.
 */
function hasRequiredFields(data, requiredFields) {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in data) || data[field] === null || data[field] === undefined || String(data[field]).trim() === '') {
      Logger.log(`Campo requerido faltante o vacío: ${field}`);
      return false;
    }
  }
  return true;
}