/**
 * authService.gs
 *
 * Este archivo contiene la lógica para la autenticación y autorización de usuarios (agentes)
 * en el CRM. Identifica al usuario que ejecuta el script y verifica sus permisos basados en su rol.
 * Es crucial para el cumplimiento de ISO 27001 y ISO 37001.
 */

// Dependencias:
// - agentsService.gs (para obtener la información del agente por email)
// - utils.gs (para funciones de logging y utilidades generales)
// - logService.gs (Para loguear intentos de acceso - YA IMPLEMENTADO)

// --- CONFIGURACIÓN DE ROLES Y PERMISOS ---
// Define la jerarquía de roles para la autorización.
// Un rol con un índice más alto puede realizar tareas de roles con índices más bajos.
// NOTA IMPORTANTE: Estos nombres de roles DEBEN coincidir exactamente (ignorando mayúsculas/minúsculas)
// con los valores que esperas en la columna 'Rol' de tu hoja 'Agentes'
// y preferiblemente también en tu hoja 'Configuracion' bajo la clave 'ROLES_AGENTE'.
const ROLE_HIERARCHY = ['AGENTE', 'SUPERVISOR', 'ADMINISTRADOR']; 


/**
 * Intenta identificar al agente actualmente autenticado (usuario de Google Workspace)
 * y recupera su perfil completo de la hoja 'Agentes'.
 *
 * @returns {Object | null} El objeto del agente si está autenticado y registrado, o null.
 * @throws {Error} Si el usuario no está autenticado vía Google o si no hay un email disponible,
 *                 o si el agente está registrado pero inactivo.
 */
function getLoggedInAgent() {
  const userEmail = Session.getActiveUser().getEmail(); // Obtiene el email del usuario de Google
  if (!userEmail) {
    // Esto es un error crítico para un entorno de Google Workspace/CRM.
    // Asegúrate de que el despliegue del script esté configurado para 'Anyone with Google account'
    // o para tu dominio de Workspace, y que el usuario haya iniciado sesión en Google.
    Logger.log("ERROR: No se pudo obtener el correo electrónico del usuario autenticado.");
    // Loguear el fallo de autenticación (sin agentId ya que no se encontró)
    logActivity(null, 'AUTH_FAILED', 'AUTH', null, `Intento de acceso de usuario no autenticado (no email Google).`);
    throw new Error("No se pudo identificar al usuario autenticado. Asegúrese de haber iniciado sesión con su cuenta de Google.");
  }

  // Buscar el agente en la base de datos de agentes
  const agent = agentsService.getAgentByEmail(userEmail);

  if (!agent) {
    // Si el usuario está autenticado en Google pero no está registrado como agente en tu hoja 'Agentes'
    Logger.log(`ADVERTENCIA: Usuario autenticado (${userEmail}) no encontrado en la hoja de Agentes.`);
    logActivity(null, 'AUTH_FAILED', 'AUTH', null, `Intento de acceso de usuario autenticado pero no registrado: ${userEmail}`);
    throw new Error("Acceso denegado: Su cuenta de correo electrónico no está registrada como agente en el sistema.");
  }

  // Si el agente está inactivo, no debería poder acceder
  if (String(agent.Estado).toUpperCase() !== 'ACTIVO') {
    Logger.log(`ADVERTENCIA: Agente inactivo (${userEmail}) intentó acceder.`);
    logActivity(agent.ID_Agente, 'AUTH_FAILED', 'AUTH', agent.ID_Agente, `Agente inactivo intentó acceder: ${userEmail}`);
    throw new Error("Su cuenta de agente está inactiva. Contacte a un administrador.");
  }

  Logger.log(`Agente autenticado: ${agent.Nombre} ${agent.Apellido} (Rol: ${agent.Rol})`);
  return agent;
}

/**
 * Verifica si un agente tiene el rol mínimo requerido para realizar una acción.
 * Implementa un control de acceso basado en roles (RBAC) con una jerarquía simple.
 *
 * @param {Object} agent El objeto del agente (obtenido de getLoggedInAgent()).
 * @param {string} requiredRole El rol mínimo requerido (ej. 'AGENTE', 'SUPERVISOR', 'ADMINISTRADOR').
 * @param {string} entity La entidad a la que se intenta acceder (para logging, ej. 'AGENTES', 'USUARIOS').
 * @param {string} action La acción que se intenta realizar (para logging, ej. 'CREATE', 'READ', 'UPDATE').
 * @returns {boolean} True si el agente tiene el rol requerido o uno superior, false en caso contrario.
 * @throws {Error} Si el agente no tiene la autorización necesaria.
 */
function authorize(agent, requiredRole, entity = 'N/A', action = 'N/A') {
  if (!agent) {
    // Esto no debería ocurrir si getLoggedInAgent() ya lanzó un error. Es una salvaguarda.
    Logger.log("ERROR: Función 'authorize' llamada sin un agente identificado.");
    throw new Error("Acceso denegado: Agente no identificado para autorización.");
  }

  const agentRole = String(agent.Rol).toUpperCase();
  const reqRole = String(requiredRole).toUpperCase();

  const agentRoleIndex = ROLE_HIERARCHY.indexOf(agentRole);
  const requiredRoleIndex = ROLE_HIERARCHY.indexOf(reqRole);

  if (agentRoleIndex === -1) {
    Logger.log(`ERROR DE ROL: Rol desconocido para el agente '${agent.Email_Google}': '${agentRole}'.`);
    logActivity(agent.ID_Agente, 'AUTH_FAILED_UNKNOWN_ROLE', entity, null, `Rol desconocido: ${agentRole} para ${agent.Email_Google} intentando ${action} ${entity}`);
    throw new Error(`Acceso denegado: Su rol de agente es desconocido o inválido.`);
  }

  if (requiredRoleIndex === -1) {
    Logger.log(`ERROR DE CONFIGURACIÓN: Rol requerido inválido en la autorización: '${requiredRole}'.`);
    throw new Error(`Error de configuración de seguridad: El rol requerido '${requiredRole}' es inválido.`);
  }

  if (agentRoleIndex >= requiredRoleIndex) {
    // El agente tiene el rol requerido o uno superior en la jerarquía.
    Logger.log(`Autorización exitosa para ${agent.Email_Google} (Rol: ${agentRole}) para ${action} ${entity} (Rol requerido: ${reqRole}).`);
    return true;
  } else {
    // El agente no tiene el rol mínimo requerido.
    Logger.log(`ACCESO DENEGADO: Agente ${agent.Email_Google} (Rol: ${agentRole}) intentó ${action} ${entity} pero se requiere rol ${reqRole}.`);
    logActivity(agent.ID_Agente, 'AUTH_FAILED_DENIED', entity, null, `Acceso denegado: ${agent.Email_Google} (Rol: ${agentRole}) intentando ${action} ${entity} (Rol requerido: ${reqRole})`);
    throw new Error(`Acceso denegado: No tiene los permisos necesarios (Rol requerido: ${requiredRole}).`);
  }
}

/**
 * Función helper para verificar si un agente tiene un rol específico.
 * Es útil para lógicas condicionales dentro de los servicios.
 *
 * @param {Object} agent El objeto del agente.
 * @param {string} roleToCheck El rol a verificar (ej. 'ADMINISTRADOR').
 * @returns {boolean} True si el agente tiene el rol, false en caso contrario.
 */
function hasRole(agent, roleToCheck) {
  if (!agent || !agent.Rol) return false;
  return String(agent.Rol).toUpperCase() === String(roleToCheck).toUpperCase();
}