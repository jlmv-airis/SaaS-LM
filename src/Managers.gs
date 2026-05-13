function listManagers(token) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_MANAGERS);
  var managers = data.map(function(row) {
    return { id: row[0], name: row[1] };
  });

  return { success: true, managers: managers };
}
