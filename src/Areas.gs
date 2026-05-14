function listAreas(token) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_AREAS);
  var areas = data.map(function(row) {
    return { id: row[0], name: row[1] };
  });

  return { success: true, areas: areas };
}

function createArea(token, name) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };
  if (!name || name.trim() === '') return { success: false, error: 'El nombre es obligatorio' };

  var id = 'area_' + Date.now();
  appendRow(SHEET_AREAS, [id, name.trim(), new Date().toISOString()]);
  logAction('admin', 'CREATE_AREA', 'Área creada: ' + name.trim());

  return { success: true, id: id };
}

function deleteArea(token, id) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_AREAS, 0, id);
  if (idx === -1) return { success: false, error: 'Área no encontrada' };

  deleteRow(SHEET_AREAS, idx);
  logAction('admin', 'DELETE_AREA', 'Área eliminada ID: ' + id);

  return { success: true };
}
