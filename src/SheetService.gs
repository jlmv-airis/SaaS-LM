var SHEET_CONFIG = 'Config';
var SHEET_OPERATORS = 'Operators';
var SHEET_MANAGERS = 'Managers';
var SHEET_PROJECTS = 'Projects';
var SHEET_LEGAL_STEPS = 'LegalSteps';
var SHEET_MAT_STEPS = 'MatSteps';
var SHEET_COMMENTS = 'Comments';
var SHEET_LOGS = 'Logs';

function ensureSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets().map(function(s) { return s.getName(); });

  var required = [
    { name: SHEET_CONFIG, headers: ['key', 'value'] },
    { name: SHEET_OPERATORS, headers: ['id', 'name', 'password', 'createdAt'] },
    { name: SHEET_MANAGERS, headers: ['id', 'name', 'password', 'createdAt'] },
    { name: SHEET_PROJECTS, headers: ['id', 'operator', 'client', 'projectName', 'deadline', 'status', 'managers'] },
    { name: SHEET_LEGAL_STEPS, headers: ['id', 'projectId', 'name', 'done'] },
    { name: SHEET_MAT_STEPS, headers: ['id', 'projectId', 'name', 'done'] },
    { name: SHEET_COMMENTS, headers: ['id', 'projectId', 'author', 'text', 'date', 'history'] },
    { name: SHEET_LOGS, headers: ['timestamp', 'user', 'action', 'detail'] }
  ];

  required.forEach(function(sheet) {
    if (sheets.indexOf(sheet.name) === -1) {
      var newSheet = ss.insertSheet(sheet.name);
      newSheet.appendRow(sheet.headers);
      newSheet.setFrozenRows(1);
    }
  });

  initConfig();
}

function initConfig() {
  var data = getSheetData(SHEET_CONFIG);
  var keys = {};
  data.forEach(function(row) { keys[row[0]] = true; });

  if (!keys['admin_pass']) {
    appendRow(SHEET_CONFIG, ['admin_pass', 'admin']);
  }
  if (!keys['app_initialized']) {
    appendRow(SHEET_CONFIG, ['app_initialized', 'true']);
    seedDefaultManagers();
  }
}

function seedDefaultManagers() {
  var existing = getSheetData(SHEET_MANAGERS);
  if (existing.length > 0) return;

  var defaults = [
    { name: 'Emmanuel', pass: '6666' },
    { name: 'Maite', pass: '7777' },
    { name: 'Julia', pass: '8888' },
    { name: 'Amaury', pass: '9999' },
    { name: 'Alfredo', pass: '1010' },
    { name: 'Caleb', pass: '1212' }
  ];

  defaults.forEach(function(m) {
    appendRow(SHEET_MANAGERS, ['man_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), m.name, m.pass, new Date().toISOString()]);
  });
}

function getSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  return rows.slice(1);
}

function appendRow(sheetName, values) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  sheet.appendRow(values);
}

function getLastRow(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  return sheet.getLastRow();
}

function updateRow(sheetName, rowIndex, values) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var range = sheet.getRange(rowIndex + 2, 1, 1, values.length);
  range.setValues([values]);
}

function deleteRow(sheetName, dataIndex) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  sheet.deleteRow(dataIndex + 2);
}

function findRowIndex(sheetName, columnIndex, value) {
  var data = getSheetData(sheetName);
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][columnIndex]) === String(value)) return i;
  }
  return -1;
}

function getConfig(key) {
  var data = getSheetData(SHEET_CONFIG);
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}

function updateConfig(key, value) {
  var data = getSheetData(SHEET_CONFIG);
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      updateRow(SHEET_CONFIG, i, [key, value]);
      return;
    }
  }
  appendRow(SHEET_CONFIG, [key, value]);
}

function logAction(user, action, detail) {
  appendRow(SHEET_LOGS, [new Date().toISOString(), user, action, detail]);
}
