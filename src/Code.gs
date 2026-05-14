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
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var ss = SpreadsheetApp.openById('1dtb0On_bIo9CAMWjprffKY4UZ4M0nKM5CaaHsmVENbs');

  // Read operators
  var opSheet = ss.getSheetByName(SHEET_OPERATORS);
  var opRows = opSheet ? opSheet.getDataRange().getValues().slice(1) : [];
  var operators = [];
  for (var i = 0; i < opRows.length; i++) {
    if (!opRows[i][1] || opRows[i][1].trim() === '') continue;
    operators.push({ id: opRows[i][0], name: opRows[i][1], area: opRows[i][3] || '', createdAt: opRows[i][4] || opRows[i][3] });
  }

  // Read projects
  var prSheet = ss.getSheetByName(SHEET_PROJECTS);
  var prRows = prSheet ? prSheet.getDataRange().getValues().slice(1) : [];
  var projects = [];
  for (var j = 0; j < prRows.length; j++) {
    if (!prRows[j][3] || prRows[j][3].trim() === '') continue;
    projects.push({
      id: prRows[j][0], operator: prRows[j][1], client: prRows[j][2],
      projectName: prRows[j][3], deadline: prRows[j][4] || '',
      status: prRows[j][5] || 'Abierto', managers: prRows[j][6] || '',
      createdAt: prRows[j][7] || ''
    });
  }

  // Read areas
  var arSheet = ss.getSheetByName(SHEET_AREAS);
  var arRows = arSheet ? arSheet.getDataRange().getValues().slice(1) : [];
  var areas = [];
  for (var k = 0; k < arRows.length; k++) {
    if (!arRows[k][1] || arRows[k][1].trim() === '') continue;
    areas.push({ id: arRows[k][0], name: arRows[k][1] });
  }

  return { success: true, operators: operators, projects: projects, areas: areas };
}
