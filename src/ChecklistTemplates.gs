function saveChecklistTemplate(token, type, name, items) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };
  if (!name || name.trim() === '') return { success: false, error: 'El nombre de la plantilla es obligatorio' };
  if (!items || items.length === 0) return { success: false, error: 'Agrega al menos un item a la plantilla' };

  var id = 'ct_' + Date.now();
  appendRow(SHEET_CHECKLIST_TEMPLATES, [
    id,
    type,
    name.trim(),
    items.join('|'),
    'admin',
    new Date().toISOString()
  ]);

  logAction('admin', 'SAVE_CHECKLIST_TEMPLATE', 'Plantilla "' + name + '" guardada (' + type + ')');

  return { success: true, id: id };
}

function listChecklistTemplates(token, type) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_CHECKLIST_TEMPLATES);
  var templates = data.filter(function(row) { return row[1] === type; }).map(function(row) {
    return {
      id: row[0],
      type: row[1],
      name: row[2],
      items: row[3] ? row[3].split('|') : []
    };
  });

  return { success: true, templates: templates };
}

function deleteChecklistTemplate(token, id) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_CHECKLIST_TEMPLATES, 0, id);
  if (idx === -1) return { success: false, error: 'Plantilla no encontrada' };

  deleteRow(SHEET_CHECKLIST_TEMPLATES, idx);
  logAction('admin', 'DELETE_CHECKLIST_TEMPLATE', 'Plantilla eliminada ID: ' + id);

  return { success: true };
}
