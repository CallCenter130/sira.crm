/**
 * logService.gs
 *
 * Este archivo contiene la lógica para registrar las actividades clave de la aplicación
 * en un Google Sheet dedicado para logs de auditoría.
 * Es fundamental para la trazabilidad, auditoría y cumplimiento de ISO 9001 y 37001.
 */

// Dependencias de sheetsService.gs (para abrir el sheet de log) y utils.gs (para formatear fechas).
// Asegúrate de que estos archivos estén en el mismo proyecto GAS y estén guardados.

// Nombre lógico de la hoja donde se almacenarán los logs de actividad de la aplicación.
// ESTE NOMBRE DEBE ESTAR REGISTRADO EN TU HOJA 'SheetPropiedades' con un ID válido y el Estado 'Activo'.
const LOG_ACTIVITY_SHEET_NAME = 'Log_Actividades_CRM';

/**
 * Registra una actividad significativa en la hoja de log de actividades del CRM.
 * Esta función es llamada desde otros servicios para crear un rastro auditable.
 *
 * @param {string | null} agentId El ID del agente que realizó la acción. Puede ser null si la acción no está ligada a un agente (ej. fallo de autenticación inicial).
 * @param {string} action El tipo de acción realizada (ej. 'CREATE_AGENT', 'UPDATE_USER', 'AUTHORIZATION_FAILED', 'SUBMIT_FEEDBACK').
 * @param {string} entity La entidad o módulo afectado por la acción (ej. 'AGENTES', 'USUARIOS', 'AUTH', 'INSPECCIONES').
 * @param {string | null} entityId El ID de la entidad afectada, si aplica (ej. el ID del agente creado, ID de la solicitud de inspección).
 * @param {string} details Una descripción detallada de la actividad.
 * @param {string | null} [ipAddress=null] La dirección IP desde donde se originó la acción, si está disponible. (Puede ser difícil de obtener directamente en GAS para llamadas web app).
 */
function logActivity(agentId, action, entity, entityId, details, ipAddress = null) {
  try {
    // Intenta obtener la hoja de log usando sheetsService
    const logSheet = sheetsService.openSheetByLogicalName(LOG_ACTIVITY_SHEET_NAME);
    
    // Obtiene el email del usuario que actualmente está ejecutando el script.
    // Si el script se ejecuta como "Me", será el email del propietario del script.
    // Si se despliega como "Usuario que accede a la aplicación", será el email del usuario final.
    const userEmail = Session.getActiveUser().getEmail(); 
    
    const timestamp = formatDateToISO(new Date()); // Formatear fecha a ISO usando la función de utils.gs

    // Asegúrate de que los encabezados en tu 'Log_Actividades_CRM.gsheet' coincidan con este orden EXACTO:
    // Timestamp, Agente_ID, Agente_Email, Accion, Entidad_Afectada, ID_Entidad_Afectada, Detalles, IP_Address
    logSheet.appendRow([
      timestamp,
      agentId || 'N/A', // Usar 'N/A' si el ID de agente es null
      userEmail || 'N/A', // Usar 'N/A' si el email no está disponible (ej. en ciertos fallos de autenticación)
      action,
      entity,
      entityId || 'N/A', // Usar 'N/A' si el ID de entidad es null
      details,
      ipAddress || 'N/A' // Si no se proporciona IP, usa 'N/A'
    ]);

    Logger.log(`Actividad registrada: ${action} en ${entity} por ${userEmail || 'N/A'}`);

  } catch (error) {
    // Si falla el log de actividad, es un error crítico que debe ser reportado.
    // No debe detener la aplicación principal, pero debe alertar sobre la falla del sistema de auditoría.
    Logger.log(`ERROR CRÍTICO: No se pudo registrar la actividad '${action}' en el log '${LOG_ACTIVITY_SHEET_NAME}'. Detalles: ${error.message} (Stack: ${error.stack})`);
    // Considera implementar un mecanismo de alerta (ej. enviar un email a un administrador) aquí,
    // ya que la falla del log de auditoría es una no conformidad seria para las normativas ISO.
  }
}