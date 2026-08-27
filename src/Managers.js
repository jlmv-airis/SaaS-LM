function listManagers(token) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_MANAGERS);
  var managers = data.map(function(row) {
    return { id: row[0], name: row[1] };
  });

  return { success: true, managers: managers };
}

function createManager(token, name, password) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };
  if (!name || name.trim() === '') return { success: false, error: 'El nombre es obligatorio' };
  if (!password || password.trim() === '') return { success: false, error: 'La contraseña es obligatoria' };

  var data = getSheetData(SHEET_MANAGERS);
  var exists = data.some(function(row) {
    return row[1].toLowerCase() === name.trim().toLowerCase();
  });
  if (exists) return { success: false, error: 'Ya existe un manager con ese nombre' };

  var id = 'man_' + Date.now();
  appendRow(SHEET_MANAGERS, [id, name.trim(), password, new Date().toISOString()]);
  logAction('admin', 'CREATE_MANAGER', 'Creado manager: ' + name.trim());

  return { success: true, id: id };
}

function updateManager(token, id, name, password) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_MANAGERS, 0, id);
  if (idx === -1) return { success: false, error: 'Manager no encontrado' };

  var rows = getSheetData(SHEET_MANAGERS);
  var row = rows[idx];

  for (var i = 0; i < rows.length; i++) {
    if (i !== idx && rows[i][1].toLowerCase() === name.toLowerCase()) {
      return { success: false, error: 'Ya existe un manager con ese nombre' };
    }
  }

  row[1] = name;
  if (password) row[2] = password;

  updateRow(SHEET_MANAGERS, idx, row);
  logAction('admin', 'UPDATE_MANAGER', 'Manager actualizado ID: ' + id);

  return { success: true };
}

function deleteManager(token, id) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_MANAGERS, 0, id);
  if (idx === -1) return { success: false, error: 'Manager no encontrado' };

  deleteRow(SHEET_MANAGERS, idx);
  logAction('admin', 'DELETE_MANAGER', 'Eliminado manager ID: ' + id);

  return { success: true };
}
