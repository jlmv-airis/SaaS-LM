function doGet() {
  ensureSheets();

  var logoBase64 = '';
  if (typeof LOGO_BASE64 !== 'undefined') {
    logoBase64 = LOGO_BASE64;
  }

  var tpl = HtmlService.createTemplateFromFile('Index');
  tpl.logoBase64 = logoBase64;

  var output = tpl.evaluate()
    .setTitle('SaaS LM - Legal y Materialidad')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');

  return output.setFaviconUrl('https://ssl.gstatic.com/docs/script/images/favicon.ico');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function refreshAllData(token) {
  try {
    if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var opSheet = ss.getSheetByName(SHEET_OPERATORS);
    var opData = opSheet.getDataRange().getValues();
    var operators = [];
    for (var i = 1; i < opData.length; i++) {
      if (!opData[i][1] || String(opData[i][1]).trim() === '') continue;
      operators.push({ id: String(opData[i][0]), name: String(opData[i][1]), area: String(opData[i][3]||''), createdAt: String(opData[i][4]||opData[i][3]||'') });
    }

    var prSheet = ss.getSheetByName(SHEET_PROJECTS);
    var prData = prSheet.getDataRange().getValues();
    var projects = [];
    for (var j = 1; j < prData.length; j++) {
      if (!prData[j][3] || String(prData[j][3]).trim() === '') continue;
      projects.push({
        id: String(prData[j][0]), operator: String(prData[j][1]||''), client: String(prData[j][2]||''),
        projectName: String(prData[j][3]), deadline: String(prData[j][4]||''),
        status: String(prData[j][5]||'Abierto'), managers: String(prData[j][6]||''),
        createdAt: String(prData[j][7]||'')
      });
    }

    var arSheet = ss.getSheetByName(SHEET_AREAS);
    var arData = arSheet.getDataRange().getValues();
    var areas = [];
    for (var k = 1; k < arData.length; k++) {
      if (!arData[k][1] || String(arData[k][1]).trim() === '') continue;
      areas.push({ id: String(arData[k][0]), name: String(arData[k][1]) });
    }

    // Managers
    var manSheet = ss.getSheetByName(SHEET_MANAGERS);
    var manData = manSheet.getDataRange().getValues();
    var managers = [];
    for (var m = 1; m < manData.length; m++) {
      if (!manData[m][1] || String(manData[m][1]).trim() === '') continue;
      managers.push({ id: String(manData[m][0]), name: String(manData[m][1]) });
    }

    // Build users list
    var users = [{ id: 'admin', name: 'Admin', role: 'admin', area: '' }];
    managers.forEach(function(m) { users.push({ id: m.id, name: m.name, role: 'manager', area: '' }); });
    operators.forEach(function(o) { users.push({ id: o.id, name: o.name, role: 'operator', area: o.area }); });

    // Clients data
    var clSheet = ss.getSheetByName(SHEET_CLIENTS);
    var clData = clSheet ? clSheet.getDataRange().getValues() : [];
    var clients = [];
    for (var c = 1; c < clData.length; c++) {
      if (!clData[c][1] || String(clData[c][1]).trim() === '') continue;
      clients.push({
        id: String(clData[c][0]), businessName: String(clData[c][1]), rfc: String(clData[c][2]||''),
        email: String(clData[c][5]||''), status: String(clData[c][9]||''),
        onboardingStage: String(clData[c][10]||''), createdAt: String(clData[c][16]||'')
      });
    }

    var configData = getSheetData(SHEET_CONFIG);
    var config = {};
    configData.forEach(function(cr) { config[cr[0]] = cr[1]; });

    return { success: true, users: users, operators: operators, projects: projects, areas: areas, managers: managers, clients: clients, config: config };
  } catch (e) {
    return { success: false, error: 'EXCEPCION: ' + e.toString() };
  }
}

function listAllUsers(token) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var users = [{ id: 'admin', name: 'Admin', role: 'admin', area: '' }];

  var manSheet = ss.getSheetByName(SHEET_MANAGERS);
  var manData = manSheet.getDataRange().getValues();
  for (var i = 1; i < manData.length; i++) {
    if (!manData[i][1] || String(manData[i][1]).trim() === '') continue;
    users.push({ id: String(manData[i][0]), name: String(manData[i][1]), role: 'manager', area: '' });
  }

  var opSheet = ss.getSheetByName(SHEET_OPERATORS);
  var opData = opSheet.getDataRange().getValues();
  for (var j = 1; j < opData.length; j++) {
    if (!opData[j][1] || String(opData[j][1]).trim() === '') continue;
    users.push({ id: String(opData[j][0]), name: String(opData[j][1]), role: 'operator', area: String(opData[j][3] || '') });
  }

  return { success: true, users: users };
}
