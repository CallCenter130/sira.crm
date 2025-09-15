/**
 * Code.gs
 *
 * Este archivo actúa como el API Gateway del backend del CRM.
 * Maneja todas las solicitudes HTTP (GET, POST, PUT, DELETE a través de POST) del frontend,
 * enruta las peticiones a los servicios de lógica de negocio correspondientes,
 * y se encarga de la autenticación y el manejo de errores.
 *
 * Integra authService para la gestión de acceso y logService para el registro de actividades.
 */

// --- API GATEWAY FUNCTIONS ---

/**
 * Maneja las solicitudes HTTP GET entrantes.
 * Espera parámetros como 'entity' y 'action' en la URL.
 *
 * @param {GoogleAppsScript.Events.DoGet} e El objeto de evento que contiene los parámetros de la solicitud.
 * @returns {GoogleAppsScript.Content.TextOutput} Una respuesta JSON.
 */
function doGet(e) {
  // Configuración de encabezados CORS.
  // IMPORTANTE: Para producción, cambia '*' a la URL específica de tu frontend (ej. 'https://callcenter130.github.io').
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400' // Cache preflight response por 24 horas
  };

  if (e.parameter.method === 'OPTIONS') { // Manejo de preflight requests para CORS
    return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT).setHeaders(headers);
  }

  let agent = null; // Variable para almacenar el agente autenticado
  const entity = e.parameter.entity ? String(e.parameter.entity).toUpperCase() : 'N/A';
  const action = e.parameter.action;
  const id = e.parameter.id;
  
  try {
    // 1. Autenticación del usuario: Obtiene el agente o lanza un error si no está registrado/activo.
    agent = authService.getLoggedInAgent(); 
    // Si agent es null (no registrado), authService.getLoggedInAgent() ya habría lanzado un error.
    
    // 2. Autorización basada en el rol del agente (Reglas para GET).
    // ESTAS SON REGLAS DE EJEMPLO Y DEBEN SER AJUSTADAS A LAS POLÍTICAS DE TU MINISTERIO.
    let requiredRole = 'AGENTE'; // Rol mínimo por defecto para la mayoría de las lecturas.

    switch (entity) {
      case 'AGENTES':
        // Los agentes pueden listar, ver su perfil y buscar otros agentes.
        requiredRole = 'AGENTE'; 
        break;
      case 'USUARIOS':
        // Los agentes pueden listar y ver información de usuarios.
        requiredRole = 'AGENTE';
        break;
      case 'SERVICIOS':
        // Cualquiera (agente) puede ver el catálogo de servicios.
        requiredRole = 'AGENTE';
        break;
      case 'CONFIGURACION':
        // Los agentes pueden obtener listas de configuración (ej. para dropdowns).
        requiredRole = 'AGENTE';
        break;
      case 'INTERACCIONES':
      case 'SOLICITUDES_INSPECCION':
      case 'SUGERENCIAS_QUEJAS':
        // Agentes pueden ver sus propias interacciones/solicitudes/feedback o los asignados a ellos.
        // La lógica específica de "propio" o "asignado" se implementaría en el respectivo *Service.gs.
        requiredRole = 'AGENTE';
        break;
      default:
        // Si no se especifica una entidad conocida, se asume un rol más alto o se deniega.
        throw new Error(`Entidad '${entity}' no reconocida para solicitudes GET.`);
    }

    // Ejecuta la verificación de autorización. Si no cumple, lanza un error.
    authService.authorize(agent, requiredRole, entity, action);

    // 3. Enrutamiento de la solicitud a la lógica de negocio.
    let result;
    switch (entity) {
      case 'AGENTES':
        switch (action) {
          case 'list':
            result = agentsService.listAgents(e.parameter.status);
            break;
          case 'getById':
            if (!id) throw new Error("ID de agente es requerido para 'getById'.");
            result = agentsService.getAgentById(id);
            break;
          case 'getByEmail':
            const email = e.parameter.email;
            if (!email) throw new Error("Email es requerido para 'getByEmail'.");
            result = agentsService.getAgentByEmail(email);
            break;
          default:
            throw new Error(`Acción GET '${action}' no válida para la entidad '${entity}'.`);
        }
        break;
      // TODO: Añadir casos para otras entidades (USUARIOS, INTERACCIONES, SERVICIOS, etc.) aquí
      // case 'USUARIOS':
      //   switch (action) {
      //     case 'list': result = usersService.listUsers(e.parameter.filter); break;
      //     case 'getById': if (!id) throw new Error("ID de usuario es requerido."); result = usersService.getUserById(id); break;
      //     case 'search': if (!e.parameter.query) throw new Error("Query de búsqueda es requerida."); result = usersService.searchUsers(e.parameter.query); break;
      //     default: throw new Error(`Acción GET '${action}' no válida para la entidad '${entity}'.`);
      //   }
      //   break;
      // case 'SERVICIOS':
      //   switch (action) {
      //     case 'listActive': result = servicesService.listActiveServices(e.parameter.category); break;
      //     case 'getById': if (!id) throw new Error("ID de servicio es requerido."); result = servicesService.getServiceById(id); break;
      //     default: throw new Error(`Acción GET '${action}' no válida para la entidad '${entity}'.`);
      //   }
      //   break;
      // case 'CONFIGURACION':
      //   switch (action) {
      //     case 'getList':
      //       const key = e.parameter.key;
      //       if (!key) throw new Error("Clave de configuración es requerida.");
      //       result = configService.getList(key); // Asume que configService.gs existe
      //       break;
      //     default: throw new Error(`Acción GET '${action}' no válida para la entidad '${entity}'.`);
      //   }
      //   break;
      default:
        throw new Error(`Entidad '${entity}' no reconocida o no implementada para solicitudes GET.`);
    }

    // 4. Devolver respuesta exitosa.
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);

  } catch (error) {
    // 5. Manejo de errores centralizado.
    const errorMessage = error.message;
    const agentId = agent ? agent.ID_Agente : null;
    const logDetails = `Error en GET: ${action} ${entity}. Mensaje: ${errorMessage}.`;

    Logger.log(`ERROR en doGet para agente ${agent ? agent.Email_Google : 'No Autenticado'}, entidad ${entity}, acción ${action}: ${errorMessage} (Stack: ${error.stack})`);
    
    // Registrar el error en el log de actividades (especialmente los fallos de autorización).
    if (errorMessage.includes("Acceso denegado") || errorMessage.includes("Usuario no identificado")) {
      logActivity(agentId, 'AUTHORIZATION_FAILED', entity, id, logDetails);
    } else {
      logActivity(agentId, 'API_ERROR_GET', entity, id, logDetails);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: errorMessage }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

/**
 * Maneja las solicitudes HTTP POST entrantes.
 * Se utiliza para operaciones de creación, actualización y eliminación (simulando PUT/DELETE).
 * Espera 'entity' y 'action' en el cuerpo JSON, junto con 'data' e 'id'.
 *
 * @param {GoogleAppsScript.Events.DoPost} e El objeto de evento que contiene el cuerpo de la solicitud.
 * @returns {GoogleAppsScript.Content.TextOutput} Una respuesta JSON.
 */
function doPost(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Cámbiate a tu dominio de frontend en producción
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };

  let agent = null; // Variable para almacenar el agente autenticado
  let requestBody = {}; // Para parsear el cuerpo de la petición

  const entity = requestBody.entity ? String(requestBody.entity).toUpperCase() : 'N/A';
  const action = requestBody.action;
  const id = requestBody.id;
  
  try {
    // 1. Parsear el cuerpo de la petición.
    requestBody = JSON.parse(e.postData.contents);
    const data = requestBody.data || {};

    // Actualizamos entity, action, id con lo del requestBody si no estaban definidos al inicio
    const currentEntity = requestBody.entity ? String(requestBody.entity).toUpperCase() : 'N/A';
    const currentAction = requestBody.action;
    const currentId = requestBody.id;


    // 2. Autenticación del usuario.
    agent = authService.getLoggedInAgent(); 

    // 3. Autorización basada en el rol del agente (Reglas para POST/PUT/DELETE).
    // ESTAS SON REGLAS DE EJEMPLO Y DEBEN SER AJUSTADAS A LAS POLÍTICAS DE TU MINISTERIO.
    let requiredRole = 'AGENTE'; // Rol mínimo por defecto para operaciones de escritura.

    switch (currentEntity) {
      case 'AGENTES':
        if (currentAction === 'create' || currentAction === 'update' || currentAction === 'deactivate') {
            requiredRole = 'ADMINISTRADOR'; // Solo administradores pueden gestionar agentes.
        }
        break;
      case 'USUARIOS':
        if (currentAction === 'create' || currentAction === 'update') {
            requiredRole = 'AGENTE'; // Agentes pueden crear/actualizar usuarios.
        }
        break;
      case 'INTERACCIONES':
        if (currentAction === 'create' || currentAction === 'update' || currentAction === 'close') {
            requiredRole = 'AGENTE'; // Agentes pueden gestionar sus interacciones.
        }
        break;
      case 'SERVICIOS':
        if (currentAction === 'create' || currentAction === 'update' || currentAction === 'deactivate') {
            requiredRole = 'ADMINISTRADOR'; // Solo administradores pueden gestionar servicios.
        }
        break;
      case 'SOLICITUDES_INSPECCION':
        if (currentAction === 'create') {
            requiredRole = 'AGENTE'; // Agentes pueden crear solicitudes.
        } else if (currentAction === 'updateStatus' || currentAction === 'assign') {
            requiredRole = 'SUPERVISOR'; // Supervisor o superior para gestionar el estado/asignación.
        }
        break;
      case 'SUGERENCIAS_QUEJAS':
        if (currentAction === 'submit') {
            requiredRole = 'AGENTE'; // Agentes pueden enviar feedback.
        } else if (currentAction === 'updateStatus' || currentAction === 'assign' || currentAction === 'resolve') {
            requiredRole = 'SUPERVISOR'; // Supervisor o superior para gestionar feedback.
        }
        break;
      case 'CONFIGURACION':
        if (currentAction === 'update' || currentAction === 'create') {
            requiredRole = 'ADMINISTRADOR'; // Solo administradores pueden cambiar la configuración del sistema.
        }
        break;
      default:
        throw new Error(`Entidad '${currentEntity}' no reconocida para solicitudes POST.`);
    }

    // Ejecuta la verificación de autorización.
    authService.authorize(agent, requiredRole, currentEntity, currentAction);

    // 4. Enrutamiento de la solicitud a la lógica de negocio.
    let result;
    switch (currentEntity) {
      case 'AGENTES':
        switch (currentAction) {
          case 'create':
            result = agentsService.createAgent(data);
            break;
          case 'update':
            if (!currentId) throw new Error("ID de agente es requerido para 'update'.");
            result = agentsService.updateAgent(currentId, data);
            break;
          case 'deactivate':
            if (!currentId) throw new Error("ID de agente es requerido para 'deactivate'.");
            result = agentsService.deactivateAgent(currentId);
            break;
          default:
            throw new Error(`Acción POST '${currentAction}' no válida para la entidad '${currentEntity}'.`);
        }
        break;
      // TODO: Añadir casos para otras entidades (USUARIOS, INTERACCIONES, etc.) aquí
      // case 'USUARIOS':
      //   switch (currentAction) {
      //     case 'create': result = usersService.createUser(data, agent.ID_Agente); break;
      //     case 'update': if (!currentId) throw new Error("ID de usuario es requerido."); result = usersService.updateUser(currentId, data); break;
      //     default: throw new Error(`Acción POST '${currentAction}' no válida para la entidad '${currentEntity}'.`);
      //   }
      //   break;
      // case 'INTERACCIONES':
      //   switch (currentAction) {
      //     case 'create': result = interactionsService.createInteraction(data, agent.ID_Agente); break;
      //     case 'update': if (!currentId) throw new Error("ID de interacción es requerido."); result = interactionsService.updateInteraction(currentId, data); break;
      //     case 'close': if (!currentId) throw new Error("ID de interacción es requerido."); result = interactionsService.closeInteraction(currentId, data.closingNotes, agent.ID_Agente); break;
      //     default: throw new Error(`Acción POST '${currentAction}' no válida para la entidad '${currentEntity}'.`);
      //   }
      //   break;
      // case 'SOLICITUDES_INSPECCION':
      //   switch (currentAction) {
      //     case 'create': result = inspectionsService.createInspectionRequest(data, agent.ID_Agente); break;
      //     case 'updateStatus': if (!currentId) throw new Error("ID de solicitud es requerido."); result = inspectionsService.updateInspectionStatus(currentId, data.newStatus, agent.ID_Agente); break;
      //     case 'assign': if (!currentId) throw new Error("ID de solicitud es requerido."); result = inspectionsService.assignInspector(currentId, data.assignedAgentId); break;
      //     default: throw new Error(`Acción POST '${currentAction}' no válida para la entidad '${currentEntity}'.`);
      //   }
      //   break;
      // case 'SUGERENCIAS_QUEJAS':
      //   switch (currentAction) {
      //     case 'submit': result = feedbackService.submitFeedback(data, agent.ID_Agente); break;
      //     case 'updateStatus': if (!currentId) throw new Error("ID de feedback es requerido."); result = feedbackService.updateFeedbackStatus(currentId, data.newStatus, agent.ID_Agente); break;
      //     case 'resolve': if (!currentId) throw new Error("ID de feedback es requerido."); result = feedbackService.resolveFeedback(currentId, data.actionsTaken, agent.ID_Agente); break;
      //     default: throw new Error(`Acción POST '${currentAction}' no válida para la entidad '${currentEntity}'.`);
      //   }
      //   break;
      // case 'CONFIGURACION':
      //   switch (currentAction) {
      //     case 'update':
      //       const key = data.key;
      //       const newValue = data.value;
      //       if (!key || newValue === undefined) throw new Error("Clave y valor son requeridos para actualizar configuración.");
      //       result = configService.updateConfig(key, newValue);
      //       break;
      //     default: throw new Error(`Acción POST '${currentAction}' no válida para la entidad '${currentEntity}'.`);
      //   }
      //   break;
      default:
        throw new Error(`Entidad '${currentEntity}' no reconocida o no implementada para solicitudes POST.`);
    }

    // 5. Devolver respuesta exitosa.
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);

  } catch (error) {
    // 6. Manejo de errores centralizado.
    const errorMessage = error.message;
    const agentId = agent ? agent.ID_Agente : null;
    const logDetails = `Error en POST: ${currentAction} ${currentEntity}. Mensaje: ${errorMessage}.`;

    Logger.log(`ERROR en doPost para agente ${agent ? agent.Email_Google : 'No Autenticado'}, entidad ${currentEntity}, acción ${currentAction}: ${errorMessage} (Stack: ${error.stack})`);
    
    // Registrar el error en el log de actividades.
    if (errorMessage.includes("Acceso denegado") || errorMessage.includes("Usuario no identificado")) {
      logActivity(agentId, 'AUTHORIZATION_FAILED', currentEntity, currentId, logDetails);
    } else {
      logActivity(agentId, 'API_ERROR_POST', currentEntity, currentId, logDetails);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: errorMessage }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}