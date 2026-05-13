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
