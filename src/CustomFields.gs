function listCustomFields(token, areaId) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_CUSTOM_FIELDS);
  var fields = data.filter(function(row) { return row[4] === areaId; }).map(function(row) {
    return {
      id: row[0],
      fieldName: row[1],
      fieldType: row[2],
      fieldOptions: row[3],
      areaId: row[4],
      required: row[5],
      displayOrder: row[6]
    };
  });

  return { success: true, fields: fields };
}

function saveCustomField(token, data) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };
  if (!data.fieldName || data.fieldName.trim() === '') return { success: false, error: 'El nombre del campo es obligatorio' };
  if (!data.fieldType) return { success: false, error: 'El tipo de campo es obligatorio' };
  if (!data.areaId) return { success: false, error: 'Selecciona un área' };

  var id = 'cf_' + Date.now();
  appendRow(SHEET_CUSTOM_FIELDS, [
    id,
    data.fieldName.trim(),
    data.fieldType,
    data.fieldOptions || '',
    data.areaId,
    data.required ? 'TRUE' : 'FALSE',
    data.displayOrder || '0',
    new Date().toISOString()
  ]);

  logAction('admin', 'CREATE_CUSTOM_FIELD', 'Campo "' + data.fieldName + '" creado para área ID: ' + data.areaId);

  return { success: true, id: id };
}

function updateCustomField(token, id, data) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_CUSTOM_FIELDS, 0, id);
  if (idx === -1) return { success: false, error: 'Campo no encontrado' };

  updateRow(SHEET_CUSTOM_FIELDS, idx, [
    id,
    data.fieldName.trim(),
    data.fieldType,
    data.fieldOptions || '',
    data.areaId,
    data.required ? 'TRUE' : 'FALSE',
    data.displayOrder || '0',
    new Date().toISOString()
  ]);

  logAction('admin', 'UPDATE_CUSTOM_FIELD', 'Campo "' + data.fieldName + '" actualizado');

  return { success: true };
}

function deleteCustomField(token, id) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_CUSTOM_FIELDS, 0, id);
  if (idx === -1) return { success: false, error: 'Campo no encontrado' };

  deleteRow(SHEET_CUSTOM_FIELDS, idx);
  logAction('admin', 'DELETE_CUSTOM_FIELD', 'Campo eliminado ID: ' + id);

  return { success: true };
}

function saveProjectFieldValues(token, projectId, values) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var existing = getSheetData(SHEET_PROJECT_FIELD_VALUES);
  existing.forEach(function(row, idx) {
    if (row[1] === projectId) {
      deleteRow(SHEET_PROJECT_FIELD_VALUES, idx);
    }
  });

  if (values && values.length > 0) {
    values.forEach(function(v) {
      appendRow(SHEET_PROJECT_FIELD_VALUES, ['pfv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), projectId, v.fieldId, v.value]);
    });
  }

  return { success: true };
}

function getProjectFieldValues(token, projectId) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_PROJECT_FIELD_VALUES);
  var values = data.filter(function(row) { return row[1] === projectId; }).map(function(row) {
    return { id: row[0], fieldId: row[2], value: row[3] };
  });

  return { success: true, values: values };
}
