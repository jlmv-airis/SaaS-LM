var SESSION_DURATION = 30 * 60;

function login(password) {
  var adminPass = getConfig('admin_pass');
  if (password !== adminPass) {
    return { success: false, error: 'Contraseña incorrecta' };
  }

  var token = generateToken();
  var cache = CacheService.getScriptCache();
  cache.put('session_' + token, 'admin', SESSION_DURATION);

  logAction('admin', 'LOGIN', 'Inicio de sesión exitoso');

  return { success: true, token: token, role: 'admin' };
}

function validateSession(token) {
  if (!token) return false;
  var cache = CacheService.getScriptCache();
  var session = cache.get('session_' + token);
  return session !== null;
}

function logout(token) {
  var cache = CacheService.getScriptCache();
  cache.remove('session_' + token);
  logAction('admin', 'LOGOUT', 'Cierre de sesión');
  return { success: true };
}

function getSessionUser(token) {
  if (!validateSession(token)) return null;
  return { role: 'admin', name: 'Admin' };
}

function generateToken() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var token = '';
  for (var i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token + '_' + Date.now();
}
