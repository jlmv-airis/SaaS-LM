function listOperators(token) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_OPERATORS);
  var operators = data.map(function(row) {
    return { id: row[0], name: row[1], area: row[3] || '', createdAt: row[4] || row[3] };
  });

  return { success: true, operators: operators };
}

function createOperator(token, name, password, area) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  if (!name || name.trim() === '') {
    return { success: false, error: 'El nombre es obligatorio' };
  }
  if (!password || password.trim() === '') {
    return { success: false, error: 'La contraseña es obligatoria' };
  }

  var data = getSheetData(SHEET_OPERATORS);
  var exists = data.some(function(row) {
    return row[1].toLowerCase() === name.trim().toLowerCase();
  });
  if (exists) {
    return { success: false, error: 'Ya existe un operador con ese nombre' };
  }

  var id = 'op_' + Date.now();
  appendRow(SHEET_OPERATORS, [id, name.trim(), password, area || '', new Date().toISOString()]);
  logAction('admin', 'CREATE_OPERATOR', 'Creado operador: ' + name.trim() + ' (Área: ' + (area || 'sin área') + ')');

  return { success: true, id: id };
}

function updateOperator(token, id, data) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_OPERATORS, 0, id);
  if (idx === -1) return { success: false, error: 'Operador no encontrado' };

  var rows = getSheetData(SHEET_OPERATORS);
  var row = rows[idx];

  if (data.name !== undefined) row[1] = data.name;
  if (data.password !== undefined) row[2] = data.password;
  if (data.area !== undefined) row[3] = data.area;

  updateRow(SHEET_OPERATORS, idx, row);
  logAction('admin', 'UPDATE_OPERATOR', 'Operador actualizado ID: ' + id);

  return { success: true };
}

function updateOperatorPassword(token, id, newPassword) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  if (!newPassword || newPassword.trim() === '') {
    return { success: false, error: 'La contraseña es obligatoria' };
  }

  var idx = findRowIndex(SHEET_OPERATORS, 0, id);
  if (idx === -1) return { success: false, error: 'Operador no encontrado' };

  var data = getSheetData(SHEET_OPERATORS);
  var row = data[idx];
  row[2] = newPassword;
  updateRow(SHEET_OPERATORS, idx, row);
  logAction('admin', 'UPDATE_OPERATOR_PASS', 'Contraseña actualizada para operador ID: ' + id);

  return { success: true };
}

function deleteOperator(token, id) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_OPERATORS, 0, id);
  if (idx === -1) return { success: false, error: 'Operador no encontrado' };

  deleteRow(SHEET_OPERATORS, idx);
  logAction('admin', 'DELETE_OPERATOR', 'Eliminado operador ID: ' + id);

  return { success: true };
}
