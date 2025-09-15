/**
 * sheetsService.gs
 *
 * Este archivo contiene la capa de abstracción para interactuar con los Google Sheets.
 * Proporciona funciones genéricas para operaciones CRUD (Crear, Leer, Actualizar, Borrar)
 * en las "tablas" representadas por archivos Google Sheet individuales.
 */

// Dependencias de utils.gs para acceder a constantes y funciones de utilidad.
// Asegúrate de que utils.gs esté en el mismo proyecto GAS y esté guardado.
const SCRIPT_PROPERTY_ID_PREFIX = 'SHEET_ID_'; // Definido en utils.gs


// --- FUNCIONES INTERNAS DE AYUDA ---

/**
 * Obtiene el ID de un Google Sheet específico de las propiedades del script.
 * Construye la clave de la propiedad usando el prefijo definido en utils.gs.
 *
 * @param {string} logicalSheetName El nombre lógico de la hoja (ej. "Agentes", "Usuarios").
 * @returns {string} El ID del Google Sheet.
 * @throws {Error} Si el ID de la hoja no se encuentra en las propiedades del script.
 */
function getSheetIdByLogicalName(logicalSheetName) {
  // Construye la clave de la propiedad tal como se almacena en las propiedades del script
  // (ej. 'SHEET_ID_SIRA_AGENTES' si logicalSheetName es 'Agentes')
  const propKey = SCRIPT_PROPERTY_ID_PREFIX + String(logicalSheetName).toUpperCase();
  const sheetId = PropertiesService.getScriptProperties().getProperty(propKey);
  if (!sheetId) {
    throw new Error(`ERROR: ID para la hoja lógica '${logicalSheetName}' (propiedad '${propKey}') no encontrado en las propiedades del script. Asegúrate de que está en SheetPropiedades y marcada como Activa.`);
  }
  return sheetId;
}

/**
 * Abre un archivo Google Sheet por su nombre lógico y devuelve su primera hoja de datos.
 * Asume que cada archivo .gsheet usado como "tabla" tiene sus datos en la primera hoja.
 *
 * @param {string} logicalSheetName El nombre lógico de la hoja.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} El objeto Sheet de Google Apps Script.
 * @throws {Error} Si la hoja no se puede abrir o no tiene hojas de datos.
 */
function openSheetByLogicalName(logicalSheetName) {
  const sheetId = getSheetIdByLogicalName(logicalSheetName);
  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheets()[0]; // Asume que la tabla está en la primera hoja del libro
  if (!sheet) {
    throw new Error(`ERROR: No se encontró una hoja de datos en el archivo '${logicalSheetName}' (ID: ${sheetId}).`);
  }
  return sheet;
}

/**
 * Lee la primera fila de una hoja para obtener los encabezados de columna.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet El objeto Sheet.
 * @returns {Array<string>} Un array de cadenas con los nombres de los encabezados.
 */
function getHeaders(sheet) {
  // Si la hoja está completamente vacía, getLastColumn() podría devolver 0.
  // getRange(1, 1, 1, 1) garantiza que al menos intentamos leer la primera celda
  // para evitar errores si la hoja está recién creada y sin encabezados.
  if (sheet.getLastColumn() === 0) {
      return [];
  }
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}


// --- FUNCIONES CRUD GENÉRICAS ---

/**
 * Obtiene todos los datos de una hoja específica como un array de objetos.
 * Cada objeto representa una fila, con las claves basadas en los encabezados.
 *
 * @param {string} logicalSheetName El nombre lógico de la hoja/tabla.
 * @returns {Array<Object>} Un array de objetos, donde cada objeto es una fila.
 * @throws {Error} Si la hoja lógica no se puede abrir o está vacía.
 */
function getAllRows(logicalSheetName) {
  const sheet = openSheetByLogicalName(logicalSheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();

  if (values.length < 2) {
    return []; // La hoja está vacía o solo tiene encabezados sin datos.
  }

  const headers = values[0]; // La primera fila son los encabezados
  const data = [];
  for (let i = 1; i < values.length; i++) { // Empezar desde la segunda fila para los datos
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    data.push(row);
  }
  return data;
}

/**
 * Busca una fila específica por un ID único en una columna dada.
 *
 * @param {string} logicalSheetName El nombre lógico de la hoja/tabla.
 * @param {string} idColumnName El nombre de la columna que contiene el ID único (ej. "ID_Agente").
 * @param {*} idValue El valor del ID a buscar.
 * @returns {Object | null} El objeto de la fila encontrada, o null si no se encuentra.
 */
function getRowById(logicalSheetName, idColumnName, idValue) {
  const allRows = getAllRows(logicalSheetName);
  for (let i = 0; i < allRows.length; i++) {
    // Comparación robusta: convierte a string para evitar problemas de tipo
    // si los IDs son numéricos en sheets o si hay ceros a la izquierda.
    if (String(allRows[i][idColumnName]) === String(idValue)) {
      return allRows[i];
    }
  }
  return null;
}

/**
 * Añade una nueva fila a una hoja específica.
 * Genera un ID único y añade metadatos de creación automáticamente.
 *
 * @param {string} logicalSheetName El nombre lógico de la hoja/tabla.
 * @param {Object} rowData Un objeto con los datos de la fila a añadir (las claves deben coincidir con los encabezados de columna).
 * @param {string} idColumnName El nombre de la columna que debe contener el ID único (ej. "ID_Agente").
 * @returns {Object} Los datos de la fila que se añadió, incluyendo los campos generados automáticamente.
 * @throws {Error} Si faltan encabezados o si ocurre un error al añadir.
 */
function addRow(logicalSheetName, rowData, idColumnName) {
  const sheet = openSheetByLogicalName(logicalSheetName);
  const headers = getHeaders(sheet);

  if (headers.length === 0) {
      throw new Error(`ERROR: La hoja '${logicalSheetName}' no tiene encabezados definidos. No se puede añadir la fila.`);
  }

  // Generar ID único automáticamente si no se proporciona (o si es nulo/vacío)
  if (!rowData[idColumnName]) {
    rowData[idColumnName] = generateUniqueId(logicalSheetName, idColumnName);
  }

  // Añadir campos de auditoría automáticamente
  rowData['Fecha_Creacion'] = formatDateToISO(new Date());
  rowData['Creado_Por'] = Session.getActiveUser().getEmail(); 

  // Construir la nueva fila como un array, asegurando que el orden coincide con los encabezados
  const newRowArray = headers.map(header => rowData[header] !== undefined ? rowData[header] : '');

  sheet.appendRow(newRowArray);
  return rowData;
}

/**
 * Actualiza una fila existente en una hoja específica basándose en su ID.
 * Añade metadatos de actualización automáticamente.
 *
 * @param {string} logicalSheetName El nombre lógico de la hoja/tabla.
 * @param {string} idColumnName El nombre de la columna que contiene el ID único.
 * @param {*} idValue El valor del ID de la fila a actualizar.
 * @param {Object} updatedData Un objeto con los datos a actualizar (las claves deben coincidir con los encabezados de columna).
 * @returns {Object | null} El objeto de la fila actualizada, o null si no se encuentra la fila.
 * @throws {Error} Si faltan encabezados o si ocurre un error al actualizar.
 */
function updateRow(logicalSheetName, idColumnName, idValue, updatedData) {
  const sheet = openSheetByLogicalName(logicalSheetName);
  const headers = getHeaders(sheet);
  const values = sheet.getDataRange().getValues();

  if (headers.length === 0 || values.length < 2) {
      throw new Error(`ERROR: La hoja '${logicalSheetName}' está vacía o no tiene datos para actualizar.`);
  }

  // Encontrar la fila por ID
  let rowIndex = -1; // Índice basado en 0 para el array 'values'
  const idColIndex = headers.indexOf(idColumnName);
  if (idColIndex === -1) {
    throw new Error(`Columna ID '${idColumnName}' no encontrada en la hoja '${logicalSheetName}'.`);
  }

  for (let i = 1; i < values.length; i++) { // Empezar desde la segunda fila (después de los encabezados)
    const currentId = values[i][idColIndex];
    if (String(currentId) === String(idValue)) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex === -1) {
    return null; // Fila no encontrada
  }

  // Obtener los datos actuales de la fila como un objeto
  const currentRowObject = {};
  for (let j = 0; j < headers.length; j++) {
    currentRowObject[headers[j]] = values[rowIndex][j];
  }

  // Fusionar datos actuales con los datos actualizados
  const mergedData = { ...currentRowObject, ...updatedData };

  // Añadir campos de auditoría de actualización automáticamente
  mergedData['Fecha_Actualizacion'] = formatDateToISO(new Date());
  mergedData['Actualizado_Por'] = Session.getActiveUser().getEmail();

  // Construir la fila actualizada como un array para escribir de nuevo
  const updatedRowArray = headers.map(header => mergedData[header] !== undefined ? mergedData[header] : '');

  // Actualizar el rango específico de la fila (rowIndex + 1 porque Sheet ranges son 1-based)
  sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([updatedRowArray]); 

  return mergedData;
}

/**
 * Elimina una fila existente de una hoja específica basándose en su ID.
 *
 * NOTA DE ISO: Para datos críticos, considera implementar una "eliminación lógica"
 * (por ejemplo, actualizando un campo 'Estado' a 'Inactivo' o 'Eliminado')
 * en lugar de borrar la fila físicamente, para mantener la trazabilidad.
 * Esta implementación realiza una eliminación física.
 *
 * @param {string} logicalSheetName El nombre lógico de la hoja/tabla.
 * @param {string} idColumnName El nombre de la columna que contiene el ID único.
 * @param {*} idValue El valor del ID de la fila a eliminar.
 * @returns {boolean} True si la fila fue eliminada, false si no se encontró.
 * @throws {Error} Si ocurre un error al eliminar.
 */
function deleteRow(logicalSheetName, idColumnName, idValue) {
  const sheet = openSheetByLogicalName(logicalSheetName);
  const headers = getHeaders(sheet);
  const values = sheet.getDataRange().getValues();

  if (headers.length === 0 || values.length < 2) {
      Logger.log(`Advertencia: La hoja '${logicalSheetName}' está vacía o no tiene datos para eliminar.`);
      return false; // No hay datos para eliminar
  }

  let rowIndexToDelete = -1; // Índice basado en 0 para el array 'values'
  const idColIndex = headers.indexOf(idColumnName);
   if (idColIndex === -1) {
    throw new Error(`Columna ID '${idColumnName}' no encontrada en la hoja '${logicalSheetName}'.`);
  }

  for (let i = 1; i < values.length; i++) {
    const currentId = values[i][idColIndex];
    if (String(currentId) === String(idValue)) {
      rowIndexToDelete = i;
      break;
    }
  }

  if (rowIndexToDelete !== -1) {
    // sheet.deleteRow() espera un índice basado en 1 para la fila.
    // rowIndex es el índice del array (0-based), así que la fila en la hoja es rowIndex + 1.
    sheet.deleteRow(rowIndexToDelete + 1); 
    return true;
  }
  return false; // Fila no encontrada
}


// --- FUNCIONES DE UTILIDAD PARA DATOS ---

/**
 * Genera un ID numérico único (autoincremental simple) para una nueva fila en una "tabla".
 * Lee todos los IDs existentes en la columna especificada y devuelve el máximo + 1.
 *
 * @param {string} logicalSheetName El nombre lógico de la hoja/tabla.
 * @param {string} idColumnName El nombre de la columna que contendrá los IDs.
 * @returns {number} El nuevo ID único.
 * @throws {Error} Si la columna ID no se encuentra.
 */
function generateUniqueId(logicalSheetName, idColumnName) {
  const sheet = openSheetByLogicalName(logicalSheetName);
  const headers = getHeaders(sheet);
  const idColIndex = headers.indexOf(idColumnName);

  if (idColIndex === -1) {
    throw new Error(`Columna ID '${idColumnName}' no encontrada en la hoja '${logicalSheetName}'. No se puede generar un ID único.`);
  }

  const lastRow = sheet.getLastRow();
  let idValues = [];
  if (lastRow > 1) { 
    idValues = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1).getValues();
  }
  
  let maxId = 0;

  idValues.forEach(row => {
    const id = parseInt(row[0]);
    if (!isNaN(id)) {
      maxId = Math.max(maxId, id);
    }
  });

  return maxId + 1;
}

/**
 * Obtiene una lista de valores únicos de una columna específica de una hoja.
 * Útil para cargar listas desplegables o catálogos simples.
 *
 * @param {string} logicalSheetName El nombre lógico de la hoja/tabla.
 * @param {string} columnName El nombre de la columna de la cual obtener los valores.
 * @returns {Array<string>} Un array de cadenas con los valores únicos.
 */
function getValuesForList(logicalSheetName, columnName) {
  const sheet = openSheetByLogicalName(logicalSheetName);
  const headers = getHeaders(sheet);
  const colIndex = headers.indexOf(columnName);

  if (colIndex === -1) {
    Logger.log(`Advertencia: Columna '${columnName}' no encontrada en la hoja '${logicalSheetName}'. Devolviendo array vacío.`);
    return [];
  }

  const lastRow = sheet.getLastRow();
  let columnValues = [];
  if (lastRow > 1) {
      columnValues = sheet.getRange(2, colIndex + 1, lastRow - 1, 1).getValues();
  }
  
  const uniqueValues = new Set();

  columnValues.forEach(row => {
    const value = String(row[0]).trim();
    if (value) {
      uniqueValues.add(value);
    }
  });

  return Array.from(uniqueValues);
}