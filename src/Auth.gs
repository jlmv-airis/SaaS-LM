var SESSION_DURATION = 30 * 60;

function login(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Usuario y contraseña requeridos' };
  }

  username = username.trim().toLowerCase();
  var adminPass = getConfig('admin_pass');

  // Admin login
  if (username === 'admin') {
    if (password !== adminPass) {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    var token = generateToken();
    var cache = CacheService.getScriptCache();
    cache.put('session_' + token, 'admin', SESSION_DURATION);
    logAction('admin', 'LOGIN', 'Inicio de sesión de administrador');
    return { success: true, token: token, role: 'admin', name: 'Admin' };
  }

  // Operator login
  var operators = getSheetData(SHEET_OPERATORS);
  for (var i = 0; i < operators.length; i++) {
    if (operators[i][1].toLowerCase() === username && operators[i][2] === password) {
      var token = generateToken();
      var cache = CacheService.getScriptCache();
      cache.put('session_' + token, 'operator:' + operators[i][1], SESSION_DURATION);
      logAction(operators[i][1], 'LOGIN', 'Inicio de sesión de operador');
      return { success: true, token: token, role: 'operator', name: operators[i][1], area: operators[i][3] || '' };
    }
  }

  return { success: false, error: 'Usuario o contraseña incorrectos' };
}

function validateSession(token) {
  if (!token) return false;
  var cache = CacheService.getScriptCache();
  var session = cache.get('session_' + token);
  return session !== null;
}

function logout(token) {
  var cache = CacheService.getScriptCache();
  var session = cache.get('session_' + token);
  var user = 'desconocido';
  if (session) {
    user = session.indexOf('operator:') === 0 ? session.replace('operator:', '') : session;
  }
  cache.remove('session_' + token);
  logAction(user, 'LOGOUT', 'Cierre de sesión');
  return { success: true };
}

function getSessionUser(token) {
  if (!validateSession(token)) return null;
  var cache = CacheService.getScriptCache();
  var session = cache.get('session_' + token);
  if (session === 'admin') return { role: 'admin', name: 'Admin' };
  if (session.indexOf('operator:') === 0) {
    var name = session.replace('operator:', '');
    return { role: 'operator', name: name };
  }
  return { role: 'unknown', name: session };
}

function generateToken() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var token = '';
  for (var i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token + '_' + Date.now();
}
