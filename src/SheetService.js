var SHEET_CONFIG = 'Config';
var SHEET_OPERATORS = 'Operators';
var SHEET_MANAGERS = 'Managers';
var SHEET_PROJECTS = 'Projects';
var SHEET_LEGAL_STEPS = 'LegalSteps';
var SHEET_MAT_STEPS = 'MatSteps';
var SHEET_COMMENTS = 'Comments';
var SHEET_LOGS = 'Logs';
var SHEET_AREAS = 'Areas';
var SHEET_CUSTOM_FIELDS = 'CustomFields';
var SHEET_PROJECT_FIELD_VALUES = 'ProjectFieldValues';
var SHEET_CHECKLIST_TEMPLATES = 'ChecklistTemplates';
var SHEET_CLIENTS = 'Clients';
var SHEET_CLIENT_DOCS = 'ClientDocs';
var SHEET_CLIENT_OPERATIONS = 'ClientOperations';
var SHEET_BILLING_CONCEPTS = 'BillingConcepts';
var SHEET_ONBOARDING_LOG = 'OnboardingLog';

var SERVICES_CATALOG = [
  { name: 'Revisión anual de contratos', monthly: '35,000', yearTotal: '430,000', description: 'Revisión de contratos con proveedores y arrendamiento' },
  { name: 'Control de almacén', monthly: '14,000', yearTotal: '168,000', description: 'Consultoría en optimización de procesos' },
  { name: 'Mantenimiento y sanitización', monthly: '20,000', yearTotal: '290,000', description: 'Servicios integrales de mantenimiento de espacios' },
  { name: 'Mantenimiento a equipos de cómputo', monthly: '45,000', yearTotal: '552,000', description: 'Soporte técnico y mantenimiento de infraestructura TI' },
  { name: 'Estrategia de marketing y redes sociales', monthly: '45,000', yearTotal: '552,000', description: 'Gestión de redes sociales y contenido digital' },
  { name: 'Procesos administrativos', monthly: '35,000', yearTotal: '210,000', description: 'Optimización de procesos administrativos y RR.HH.' },
  { name: 'Estudio de mercado', monthly: '45,000', yearTotal: '90,000', description: 'Análisis de clientes y competidores' },
  { name: 'Administración de página web', monthly: '35,000', yearTotal: '420,000', description: 'Gestión y mantenimiento de sitio web' }
];

var ONBOARDING_DOC_TYPES = [
  { key: '01', name: 'Escritura constitutiva (con boleta RPP)' },
  { key: '02', name: 'Escrituras de cambios estatutarios' },
  { key: '03', name: 'Poder notarial del Representante Legal' },
  { key: '04', name: 'Identificación vigente del Representante Legal' },
  { key: '05', name: 'Constancia de Situación Fiscal (CSF) - actualizada \u22643 meses' },
  { key: '06', name: 'Cédula de Identificación Fiscal (CIF)' },
  { key: '07', name: 'Opinión de Cumplimiento (32-D) positiva' },
  { key: '08', name: 'Comprobante de domicilio (luz, agua o teléfono) \u22643 meses' }
];

function ensureSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets().map(function(s) { return s.getName(); });

  var required = [
    { name: SHEET_CONFIG, headers: ['key', 'value'] },
    { name: SHEET_OPERATORS, headers: ['id', 'name', 'password', 'area', 'createdAt'] },
    { name: SHEET_MANAGERS, headers: ['id', 'name', 'password', 'createdAt'] },
    { name: SHEET_PROJECTS, headers: ['id', 'operator', 'client', 'projectName', 'deadline', 'status', 'managers', 'createdAt'] },
    { name: SHEET_LEGAL_STEPS, headers: ['id', 'projectId', 'name', 'done'] },
    { name: SHEET_MAT_STEPS, headers: ['id', 'projectId', 'name', 'done'] },
    { name: SHEET_COMMENTS, headers: ['id', 'projectId', 'author', 'text', 'date', 'history'] },
    { name: SHEET_LOGS, headers: ['timestamp', 'user', 'action', 'detail'] },
    { name: SHEET_AREAS, headers: ['id', 'name', 'createdAt'] },
    { name: SHEET_CUSTOM_FIELDS, headers: ['id', 'fieldName', 'fieldType', 'fieldOptions', 'areaId', 'required', 'displayOrder', 'createdAt'] },
    { name: SHEET_PROJECT_FIELD_VALUES, headers: ['id', 'projectId', 'fieldId', 'value'] },
    { name: SHEET_CHECKLIST_TEMPLATES, headers: ['id', 'type', 'name', 'items', 'createdBy', 'createdAt'] },
    { name: SHEET_CLIENTS, headers: ['id', 'businessName', 'rfc', 'legalRep', 'legalRepId', 'email', 'phone', 'address', 'cp', 'status', 'onboardingStage', 'interviewDate', 'interviewNotes', 'interviewType', 'operationAnalysis', 'strategyNotes', 'createdAt', 'updatedAt', 'driveFolderUrl', 'catalogDriveUrl', 'billingConcentrateUrl'] },
    { name: SHEET_CLIENT_DOCS, headers: ['id', 'clientId', 'docKey', 'docName', 'status', 'fileUrl', 'notes', 'updatedAt'] },
    { name: SHEET_CLIENT_OPERATIONS, headers: ['id', 'clientId', 'operationName', 'description', 'hasBilling', 'billingGap', 'createdAt'] },
    { name: SHEET_BILLING_CONCEPTS, headers: ['id', 'clientId', 'operationId', 'conceptName', 'description', 'baseAmount', 'frequency', 'status', 'createdAt'] },
    { name: SHEET_ONBOARDING_LOG, headers: ['id', 'clientId', 'stage', 'action', 'notes', 'createdAt'] }
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
  if (!keys['billingConcentrateUrl']) {
    appendRow(SHEET_CONFIG, ['billingConcentrateUrl', '']);
  }
  if (!keys['catalogDriveUrl']) {
    appendRow(SHEET_CONFIG, ['catalogDriveUrl', '']);
  }
  if (!keys['app_initialized']) {
    appendRow(SHEET_CONFIG, ['app_initialized', 'true']);
    seedDefaultManagers();
    seedDefaultOperators();
    seedDefaultAreas();
  }
}

function seedDefaultOperators() {
  var existing = getSheetData(SHEET_OPERATORS);
  if (existing.length > 0) return;

  var defaults = [
    { name: 'Miriam', pass: '1111', area: 'Legal' },
    { name: 'Carlos', pass: '2222', area: 'Materialidad' },
    { name: 'Sofía', pass: '3333', area: 'Administración' }
  ];

  defaults.forEach(function(o) {
    appendRow(SHEET_OPERATORS, ['op_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), o.name, o.pass, o.area, new Date().toISOString()]);
  });
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
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    var rows = sheet.getDataRange().getValues();
    return rows.slice(1);
  } catch (e) {
    console.error('getSheetData(' + sheetName + ') error: ' + e.toString());
    return [];
  }
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

function seedDefaultAreas() {
  var existing = getSheetData(SHEET_AREAS);
  if (existing.length > 0) return;

  var defaults = ['Legal', 'Materialidad', 'Administración', 'Finanzas', 'Operaciones'];
  defaults.forEach(function(name) {
    appendRow(SHEET_AREAS, ['area_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), name, new Date().toISOString()]);
  });
}

function logAction(user, action, detail) {
  appendRow(SHEET_LOGS, [new Date().toISOString(), user, action, detail]);
}

