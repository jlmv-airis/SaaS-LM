function createProject(token, data) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  if (!data.operator) return { success: false, error: 'Selecciona un operador' };
  if (!data.client || data.client.trim() === '') return { success: false, error: 'El cliente es obligatorio' };
  if (!data.projectName || data.projectName.trim() === '') return { success: false, error: 'El nombre del proyecto es obligatorio' };
  if (!data.deadline) return { success: false, error: 'La fecha límite es obligatoria' };
  if (!data.manager1) return { success: false, error: 'Selecciona al menos un encargado' };

  var projectId = 'proj_' + Date.now();
  var managers = data.manager2 ? data.manager1 + '|' + data.manager2 : data.manager1;

  appendRow(SHEET_PROJECTS, [
    projectId,
    data.operator,
    data.client.trim(),
    data.projectName.trim(),
    data.deadline,
    'Abierto',
    managers,
    new Date().toISOString()
  ]);

  if (data.legalSteps && data.legalSteps.length > 0) {
    data.legalSteps.forEach(function(step) {
      appendRow(SHEET_LEGAL_STEPS, ['step_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6), projectId, step, 'FALSE']);
    });
  }

  if (data.matSteps && data.matSteps.length > 0) {
    data.matSteps.forEach(function(step) {
      appendRow(SHEET_MAT_STEPS, ['step_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6), projectId, step, 'FALSE']);
    });
  }

  logAction('admin', 'CREATE_PROJECT', 'Proyecto "' + data.projectName + '" creado para ' + data.operator);

  return { success: true, projectId: projectId };
}

function listProjects(token) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_PROJECTS);
  var projects = data.map(function(row) {
    return {
      id: row[0],
      operator: row[1],
      client: row[2],
      projectName: row[3],
      deadline: row[4],
      status: row[5],
      managers: row[6]
    };
  });

  return { success: true, projects: projects };
}
