function doGet() {
  ensureSheets();

  var output = HtmlService.createHtmlOutputFromFile('Index')
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

    return { success: true, operators: operators, projects: projects, areas: areas };
  } catch (e) {
    return { success: false, error: 'EXCEPCION: ' + e.toString() };
  }
}
