/**
 * agentsService.gs
 *
 * Este archivo contiene la lógica de negocio específica para la gestión de agentes del Call Center.
 * Utiliza sheetsService.gs para las operaciones CRUD con la hoja 'Agentes'.
 * También integra logService.gs para registrar actividades y utils.gs para validaciones.
 */

// Nombre lógico de la hoja donde se almacenan los agentes.
const AGENTS_SHEET_NAME = 'Agentes';
// Nombre de la columna que contiene el ID único del agente.
const AGENT_ID_COLUMN = 'ID_Agente';

/**
 * Crea un nuevo agente en el sistema.
 * Realiza validaciones y prepara los datos antes de llamar al sheetsService.
 *
 * @param {Object} agentData Objeto con los datos del nuevo agente (Nombre, Apellido, Email_Google, Rol, Estado).
 * @returns {Object} Los datos del agente creado.
 * @throws {Error} Si faltan campos requeridos, el email ya existe o el rol/estado no es válido.
 */
function createAgent(agentData) {
  const requiredFields = ['Nombre', 'Apellido', 'Email_Google', 'Rol', 'Estado'];
  if (!hasRequiredFields(agentData, requiredFields)) {
    throw new Error('Datos incompletos para crear un agente. Se requieren: ' + requiredFields.join(', '));
  }
  if (!isValidEmail(agentData.Email_Google)) {
    throw new Error(`El email '${agentData.Email_Google}' no tiene un formato válido.`);
  }

  // Verificar si el email ya está registrado
  const existingAgents = sheetsService.getAllRows(AGENTS_SHEET_NAME);
  const emailExists = existingAgents.some(agent => String(agent.Email_Google).toUpperCase() === String(agentData.Email_Google).toUpperCase());
  if (emailExists) {
    throw new Error(`El email '${agentData.Email_Google}' ya está registrado para otro agente.`);
  }

  // Validar Rol y Estado contra listas de configuración (obtenidas de Configuracion.gsheet)
  // Se asume que 'configService.gs' existirá para una gestión más limpia,
  // por ahora, usamos sheetsService.getValuesForList directamente si configService no está creado aún.
  const allowedRoles = sheetsService.getValuesForList('Configuracion', 'ROLES_AGENTE'); 
  if (!allowedRoles.includes(agentData.Rol)) {
    throw new Error(`El rol '${agentData.Rol}' no es un rol permitido. Roles válidos: ${allowedRoles.join(', ')}.`);
  }
  
  // Asumimos que los estados válidos son Activo e Inactivo. Puedes obtenerlos de Configuracion.gsheet también.
  const allowedStates = ['Activo', 'Inactivo']; 
  if (!allowedStates.includes(agentData.Estado)) {
    throw new Error(`El estado '${agentData.Estado}' no es un estado permitido. Estados válidos: ${allowedStates.join(', ')}.`);
  }

  // sheetsService.addRow se encargará de generar ID_Agente, Fecha_Creacion y Creado_Por
  const newAgent = sheetsService.addRow(AGENTS_SHEET_NAME, agentData, AGENT_ID_COLUMN);
  
  // Log de auditoría
  logActivity(newAgent[AGENT_ID_COLUMN], 'CREATE_AGENT', AGENTS_SHEET_NAME, newAgent[AGENT_ID_COLUMN], `Nuevo agente creado: ${newAgent.Nombre} ${newAgent.Apellido} (${newAgent.Email_Google})`);

  return newAgent;
}

/**
 * Obtiene la información de un agente por su ID.
 *
 * @param {string} agentId El ID del agente.
 * @returns {Object | null} El objeto del agente, o null si no se encuentra.
 */
function getAgentById(agentId) {
  // isNumeric es una función de utils.gs
  if (!isNumeric(agentId)) {
    throw new Error('ID de agente inválido. Debe ser numérico.');
  }
  return sheetsService.getRowById(AGENTS_SHEET_NAME, AGENT_ID_COLUMN, agentId);
}

/**
 * Obtiene la información de un agente por su dirección de correo electrónico de Google.
 *
 * @param {string} email El correo electrónico del agente.
 * @returns {Object | null} El objeto del agente, o null si no se encuentra.
 */
function getAgentByEmail(email) {
  // isValidEmail es una función de utils.gs
  if (!isValidEmail(email)) {
    throw new Error(`El email '${email}' no tiene un formato válido.`);
  }
  const allAgents = sheetsService.getAllRows(AGENTS_SHEET_NAME);
  // Comparación insensible a mayúsculas/minúsculas para el email
  return allAgents.find(agent => String(agent.Email_Google).toUpperCase() === String(email).toUpperCase());
}


/**
 * Actualiza la información de un agente existente.
 * Realiza validaciones y prepara los datos antes de llamar al sheetsService.
 *
 * @param {string} agentId El ID del agente a actualizar.
 * @param {Object} updatedData Objeto con los datos a actualizar del agente.
 * @returns {Object | null} Los datos del agente actualizado, o null si no se encuentra.
 * @throws {Error} Si el ID es inválido, el email ya existe (si se cambia) o el rol/estado no es válido.
 */
function updateAgent(agentId, updatedData) {
  if (!isNumeric(agentId)) {
    throw new Error('ID de agente inválido para actualizar. Debe ser numérico.');
  }

  const existingAgent = sheetsService.getRowById(AGENTS_SHEET_NAME, AGENT_ID_COLUMN, agentId);
  if (!existingAgent) {
    return null; // Agente no encontrado
  }

  // Validar Email_Google si se intenta cambiar
  if (updatedData.Email_Google && String(updatedData.Email_Google).toUpperCase() !== String(existingAgent.Email_Google).toUpperCase()) {
    if (!isValidEmail(updatedData.Email_Google)) {
      throw new Error(`El nuevo email '${updatedData.Email_Google}' no tiene un formato válido.`);
    }
    const allAgents = sheetsService.getAllRows(AGENTS_SHEET_NAME);
    // Verificar que el nuevo email no exista ya para OTRO agente
    const emailExists = allAgents.some(agent => String(agent.Email_Google).toUpperCase() === String(updatedData.Email_Google).toUpperCase() && String(agent[AGENT_ID_COLUMN]) !== String(agentId));
    if (emailExists) {
      throw new Error(`El email '${updatedData.Email_Google}' ya está registrado para otro agente.`);
    }
  }

  // Validar Rol si se intenta cambiar
  if (updatedData.Rol) {
    const allowedRoles = sheetsService.getValuesForList('Configuracion', 'ROLES_AGENTE');
    if (!allowedRoles.includes(updatedData.Rol)) {
      throw new Error(`El rol '${updatedData.Rol}' no es un rol permitido. Roles válidos: ${allowedRoles.join(', ')}.`);
    }
  }

  // Validar Estado si se intenta cambiar
  if (updatedData.Estado) {
    const allowedStates = ['Activo', 'Inactivo'];
    if (!allowedStates.includes(updatedData.Estado)) {
      throw new Error(`El estado '${updatedData.Estado}' no es un estado permitido. Estados válidos: ${allowedStates.join(', ')}.`);
    }
  }

  const updatedAgent = sheetsService.updateRow(AGENTS_SHEET_NAME, AGENT_ID_COLUMN, agentId, updatedData);

  // Log de auditoría
  logActivity(agentId, 'UPDATE_AGENT', AGENTS_SHEET_NAME, agentId, `Agente actualizado: ${existingAgent.Nombre} ${existingAgent.Apellido} a ${updatedAgent.Nombre} ${updatedAgent.Apellido}`);

  return updatedAgent;
}

/**
 * Lista todos los agentes, opcionalmente filtrando por estado.
 *
 * @param {string | null} [statusFilter=null] Filtra por 'Activo' o 'Inactivo'. Si es null, lista todos.
 * @returns {Array<Object>} Un array de objetos de agentes.
 * @throws {Error} Si el statusFilter no es válido.
 */
function listAgents(statusFilter = null) {
  const allAgents = sheetsService.getAllRows(AGENTS_SHEET_NAME);
  if (statusFilter) {
    const allowedStates = ['Activo', 'Inactivo'];
    if (!allowedStates.includes(statusFilter)) {
      throw new Error(`El filtro de estado '${statusFilter}' no es válido. Use 'Activo' o 'Inactivo'.`);
    }
    return allAgents.filter(agent => agent.Estado === statusFilter);
  }
  return allAgents;
}

/**
 * Elimina lógicamente un agente (establece su estado a 'Inactivo').
 * NOTA ISO 37001: Para sistemas gubernamentales, rara vez se eliminan registros físicos.
 * Es preferible la eliminación lógica para mantener la trazabilidad.
 *
 * @param {string} agentId El ID del agente a desactivar.
 * @returns {Object | null} El objeto del agente actualizado (inactivo), o null si no se encuentra.
 */
function deactivateAgent(agentId) {
    if (!isNumeric(agentId)) {
        throw new Error('ID de agente inválido para desactivar. Debe ser numérico.');
    }
    const updatedAgent = sheetsService.updateRow(AGENTS_SHEET_NAME, AGENT_ID_COLUMN, agentId, { Estado: 'Inactivo' });
    
    // Log de auditoría
    if (updatedAgent) {
        logActivity(agentId, 'DEACTIVATE_AGENT', AGENTS_SHEET_NAME, agentId, `Agente desactivado: ${updatedAgent.Nombre} ${updatedAgent.Apellido}`);
    }

    return updatedAgent;
}

// --- Importante para la Seguridad ---
// Asegúrate de que las llamadas a estas funciones desde Code.gs tengan
// una capa de autorización robusta basada en roles, implementada en authService.gs.