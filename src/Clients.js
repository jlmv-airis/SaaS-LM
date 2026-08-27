function createClient(token, data) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };
  if (!data.businessName || data.businessName.trim() === '') return { success: false, error: 'La razón social es obligatoria' };

  var clientId = 'cli_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

  appendRow(SHEET_CLIENTS, [
    clientId,
    (data.businessName || '').trim(),
    (data.rfc || '').trim(),
    (data.legalRep || '').trim(),
    (data.legalRepId || '').trim(),
    (data.email || '').trim(),
    (data.phone || '').trim(),
    (data.address || '').trim(),
    (data.cp || '').trim(),
    'Activo',
    '1_datos_generales',
    '',
    '',
    '',
    '',
    '',
    new Date().toISOString(),
    new Date().toISOString(),
    data.driveFolderUrl || '',
    data.catalogDriveUrl || '',
    data.billingConcentrateUrl || ''
  ]);

  ONBOARDING_DOC_TYPES.forEach(function(doc) {
    appendRow(SHEET_CLIENT_DOCS, [
      'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      clientId,
      doc.key,
      doc.name,
      'Pendiente',
      '',
      '',
      new Date().toISOString()
    ]);
  });

  var session = getSessionUser(token);
  logOnboardingAction(token, clientId, '1_datos_generales', 'CLIENTE_CREADO', 'Cliente creado por ' + (session ? session.name : 'desconocido'));

  return { success: true, clientId: clientId };
}

function listClients(token) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_CLIENTS);
  var clients = [];
  data.forEach(function(row) {
    if (!row[1] || String(row[1]).trim() === '') return;
    clients.push({
      id: row[0],
      businessName: row[1],
      rfc: row[2],
      legalRep: row[3],
      legalRepId: row[4],
      email: row[5],
      phone: row[6],
      address: row[7],
      cp: row[8],
      status: row[9],
      onboardingStage: row[10],
      interviewDate: row[11],
      interviewNotes: row[12],
      interviewType: row[13],
      operationAnalysis: row[14],
      strategyNotes: row[15],
      createdAt: row[16],
      updatedAt: row[17],
      driveFolderUrl: row[18] || '',
      catalogDriveUrl: row[19] || '',
      billingConcentrateUrl: row[20] || ''
    });
  });

  return { success: true, clients: clients };
}

function updateClient(token, id, data) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_CLIENTS, 0, id);
  if (idx === -1) return { success: false, error: 'Cliente no encontrado' };

  var rows = getSheetData(SHEET_CLIENTS);
  var row = rows[idx];

  if (data.businessName !== undefined) row[1] = data.businessName;
  if (data.rfc !== undefined) row[2] = data.rfc;
  if (data.legalRep !== undefined) row[3] = data.legalRep;
  if (data.legalRepId !== undefined) row[4] = data.legalRepId;
  if (data.email !== undefined) row[5] = data.email;
  if (data.phone !== undefined) row[6] = data.phone;
  if (data.address !== undefined) row[7] = data.address;
  if (data.cp !== undefined) row[8] = data.cp;
  if (data.status !== undefined) row[9] = data.status;
  if (data.onboardingStage !== undefined) row[10] = data.onboardingStage;
  if (data.interviewDate !== undefined) row[11] = data.interviewDate;
  if (data.interviewNotes !== undefined) row[12] = data.interviewNotes;
  if (data.interviewType !== undefined) row[13] = data.interviewType;
  if (data.operationAnalysis !== undefined) row[14] = data.operationAnalysis;
  if (data.strategyNotes !== undefined) row[15] = data.strategyNotes;
  if (data.driveFolderUrl !== undefined) row[18] = data.driveFolderUrl;
  if (data.catalogDriveUrl !== undefined) row[19] = data.catalogDriveUrl;
  if (data.billingConcentrateUrl !== undefined) row[20] = data.billingConcentrateUrl;
  row[17] = new Date().toISOString();

  updateRow(SHEET_CLIENTS, idx, row);
  return { success: true };
}

function deleteClient(token, id) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_CLIENTS, 0, id);
  if (idx === -1) return { success: false, error: 'Cliente no encontrado' };

  deleteRow(SHEET_CLIENTS, idx);

  // Delete related data
  var opsData = getSheetData(SHEET_CLIENT_OPERATIONS);
  for (var i = opsData.length - 1; i >= 0; i--) {
    if (opsData[i][1] === id) deleteRow(SHEET_CLIENT_OPERATIONS, i);
  }

  var docsData = getSheetData(SHEET_CLIENT_DOCS);
  for (var j = docsData.length - 1; j >= 0; j--) {
    if (docsData[j][1] === id) deleteRow(SHEET_CLIENT_DOCS, j);
  }

  var bcData = getSheetData(SHEET_BILLING_CONCEPTS);
  for (var k = bcData.length - 1; k >= 0; k--) {
    if (bcData[k][1] === id) deleteRow(SHEET_BILLING_CONCEPTS, k);
  }

  return { success: true };
}

/* ====== DOCUMENTOS ====== */

function saveClientDocStatus(token, clientId, docKey, status, fileUrl, notes) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_CLIENT_DOCS);
  var idx = -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i][1] === clientId && data[i][2] === docKey) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return { success: false, error: 'Documento no encontrado' };

  data[idx][4] = status || data[idx][4];
  if (fileUrl !== undefined) data[idx][5] = fileUrl;
  if (notes !== undefined) data[idx][6] = notes;
  data[idx][7] = new Date().toISOString();

  updateRow(SHEET_CLIENT_DOCS, idx, data[idx]);
  return { success: true };
}

function listClientDocs(token, clientId) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_CLIENT_DOCS);
  var docs = [];
  data.forEach(function(row) {
    if (row[1] !== clientId) return;
    docs.push({
      id: row[0],
      clientId: row[1],
      docKey: row[2],
      docName: row[3],
      status: row[4],
      fileUrl: row[5],
      notes: row[6],
      updatedAt: row[7]
    });
  });

  return { success: true, docs: docs };
}

/* ====== OPERACIONES ====== */

function saveClientOperation(token, data) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };
  if (!data.clientId) return { success: false, error: 'Cliente requerido' };
  if (!data.operationName || data.operationName.trim() === '') return { success: false, error: 'Nombre de operación requerido' };

  var opId = 'op_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  appendRow(SHEET_CLIENT_OPERATIONS, [
    opId,
    data.clientId,
    data.operationName.trim(),
    data.description || '',
    data.hasBilling ? 'SI' : 'NO',
    'NO',
    new Date().toISOString()
  ]);

  return { success: true, operationId: opId };
}

function listClientOperations(token, clientId) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_CLIENT_OPERATIONS);
  var operations = [];
  data.forEach(function(row) {
    if (row[1] !== clientId) return;
    operations.push({
      id: row[0],
      clientId: row[1],
      operationName: row[2],
      description: row[3],
      hasBilling: row[4],
      billingGap: row[5],
      createdAt: row[6]
    });
  });

  return { success: true, operations: operations };
}

function deleteClientOperation(token, id) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_CLIENT_OPERATIONS, 0, id);
  if (idx === -1) return { success: false, error: 'Operación no encontrada' };

  deleteRow(SHEET_CLIENT_OPERATIONS, idx);
  return { success: true };
}

/* ====== CONCEPTOS DE FACTURACIÓN ====== */

function saveBillingConcept(token, data) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };
  if (!data.clientId) return { success: false, error: 'Cliente requerido' };
  if (!data.conceptName || data.conceptName.trim() === '') return { success: false, error: 'Nombre del concepto requerido' };

  var bcId = 'bc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  appendRow(SHEET_BILLING_CONCEPTS, [
    bcId,
    data.clientId,
    data.operationId || '',
    data.conceptName.trim(),
    data.description || '',
    data.baseAmount || '',
    data.frequency || '',
    'Activo',
    new Date().toISOString()
  ]);

  // Update billing gap on the operation
  if (data.operationId) {
    var opsData = getSheetData(SHEET_CLIENT_OPERATIONS);
    for (var i = 0; i < opsData.length; i++) {
      if (opsData[i][0] === data.operationId) {
        opsData[i][5] = 'NO';
        updateRow(SHEET_CLIENT_OPERATIONS, i, opsData[i]);
        break;
      }
    }
  }

  return { success: true, billingConceptId: bcId };
}

function listBillingConcepts(token, clientId) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var data = getSheetData(SHEET_BILLING_CONCEPTS);
  var concepts = [];
  data.forEach(function(row) {
    if (row[1] !== clientId) return;
    concepts.push({
      id: row[0],
      clientId: row[1],
      operationId: row[2],
      conceptName: row[3],
      description: row[4],
      baseAmount: row[5],
      frequency: row[6],
      status: row[7],
      createdAt: row[8]
    });
  });

  return { success: true, concepts: concepts };
}

function deleteBillingConcept(token, id) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_BILLING_CONCEPTS, 0, id);
  if (idx === -1) return { success: false, error: 'Concepto no encontrado' };

  deleteRow(SHEET_BILLING_CONCEPTS, idx);
  return { success: true };
}

/* ====== ONBOARDING HELPERS ====== */

function updateOnboardingStage(token, clientId, stage) {
  return updateClient(token, clientId, { onboardingStage: stage });
}

function logOnboardingAction(token, clientId, stage, action, notes) {
  if (token && !validateSession(token)) return;

  appendRow(SHEET_ONBOARDING_LOG, [
    'onb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    clientId,
    stage,
    action,
    notes || '',
    new Date().toISOString()
  ]);
}

function listAllClientsData(token) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var clients = getSheetData(SHEET_CLIENTS);
  var docs = getSheetData(SHEET_CLIENT_DOCS);
  var ops = getSheetData(SHEET_CLIENT_OPERATIONS);
  var bcs = getSheetData(SHEET_BILLING_CONCEPTS);

  var clientList = [];
  clients.forEach(function(row) {
    if (!row[1] || String(row[1]).trim() === '') return;
    clientList.push({
      id: row[0],
      businessName: row[1],
      rfc: row[2],
      email: row[5],
      status: row[9],
      onboardingStage: row[10],
      createdAt: row[16],
      driveFolderUrl: row[18] || '',
      catalogDriveUrl: row[19] || '',
      billingConcentrateUrl: row[20] || ''
    });
  });

  var docList = [];
  docs.forEach(function(row) {
    docList.push({ clientId: row[1], docKey: row[2], docName: row[3], status: row[4] });
  });

  var opList = [];
  ops.forEach(function(row) {
    opList.push({ id: row[0], clientId: row[1], operationName: row[2], hasBilling: row[4], billingGap: row[5] });
  });

  var bcList = [];
  bcs.forEach(function(row) {
    bcList.push({ id: row[0], clientId: row[1], operationId: row[2], conceptName: row[3], status: row[7] });
  });

  return {
    success: true,
    clients: clientList,
    clientDocs: docList,
    clientOperations: opList,
    billingConcepts: bcList
  };
}

function updateInterviewData(token, clientId, data) {
  if (!validateSession(token)) return { success: false, error: 'Sesión expirada' };

  var idx = findRowIndex(SHEET_CLIENTS, 0, clientId);
  if (idx === -1) return { success: false, error: 'Cliente no encontrado' };

  var rows = getSheetData(SHEET_CLIENTS);
  var row = rows[idx];

  if (data.interviewDate !== undefined) row[11] = data.interviewDate;
  if (data.interviewNotes !== undefined) row[12] = data.interviewNotes;
  if (data.interviewType !== undefined) row[13] = data.interviewType;
  if (data.operationAnalysis !== undefined) row[14] = data.operationAnalysis;
  if (data.strategyNotes !== undefined) row[15] = data.strategyNotes;
  if (data.onboardingStage !== undefined) row[10] = data.onboardingStage;
  row[17] = new Date().toISOString();

  updateRow(SHEET_CLIENTS, idx, row);

  var session = getSessionUser(token);
  logOnboardingAction(token, clientId, data.onboardingStage || row[10], 'UPDATE_INTERVIEW', 'Entrevista actualizada por ' + (session ? session.name : 'desconocido'));

  return { success: true };
}

