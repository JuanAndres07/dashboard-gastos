/**
 * Diccionario de traducción para los errores de Supabase Auth (GoTrue).
 */
const authErrorMap = {
  // Errores de inicio de sesión y credenciales
  "invalid_credentials": "El correo electrónico o la contraseña son incorrectos.",
  "invalid_grant": "Credenciales incorrectas o sesión expirada.",
  "user_not_found": "No se encontró ningún usuario con estas credenciales.",
  
  // Registro y cuentas
  "user_already_exists": "Este correo electrónico ya está registrado.",
  "email_not_confirmed": "Por favor, confirma tu correo electrónico antes de continuar.",
  "signup_disabled": "El registro de nuevos usuarios está deshabilitado.",
  "email_address_invalid": "La dirección de correo electrónico no tiene un formato válido.",
  
  // Contraseñas
  "password_too_short": "La contraseña debe tener al menos 6 caracteres.",
  "weak_password": "La contraseña es muy débil. Intenta con una más segura.",
  "same_password": "La nueva contraseña debe ser diferente a la actual.",
  
  // Límites y rate limits
  "over_email_send_rate_limit": "Has excedido el límite de envío de correos. Por favor, espera unos minutos antes de intentar de nuevo.",
  "over_request_rate_limit": "Demasiadas solicitudes en poco tiempo. Inténtalo más tarde.",
  
  // Sesión y token
  "session_not_found": "No se encontró una sesión activa.",
  "refresh_token_not_found": "La sesión ha expirado. Por favor, inicia sesión de nuevo.",
};

/**
 * Diccionario de traducción para los códigos de error comunes de base de datos de Postgres.
 */
const dbErrorMap = {
  "23505": "Este registro ya existe y no puede duplicarse.",
  "23503": "No se pudo realizar la operación porque depende de otro registro que no existe.",
  "23514": "Los datos proporcionados no cumplen con las condiciones requeridas.",
  "22P02": "El formato de uno de los campos es incorrecto.",
  "PGRST116": "No se encontraron resultados para la consulta.",
};

/**
 * Traduce un error de Supabase (ya sea de Auth o de Base de Datos) al español.
 * 
 * @param {Object|Error|string} error - El objeto de error de Supabase o el mensaje de error.
 * @returns {string} Mensaje de error amigable en español.
 */
export function translateSupabaseError(error) {
  if (!error) return "";

  // Si nos pasan un string (como error.message) directamente
  if (typeof error === "string") {
    const lowerMessage = error.toLowerCase();
    
    if (lowerMessage.includes("invalid login credentials") || lowerMessage.includes("invalid credentials")) {
      return authErrorMap.invalid_credentials;
    }
    if (lowerMessage.includes("already registered") || lowerMessage.includes("user already exists")) {
      return authErrorMap.user_already_exists;
    }
    if (lowerMessage.includes("email not confirmed")) {
      return authErrorMap.email_not_confirmed;
    }
    if (lowerMessage.includes("rate limit") || lowerMessage.includes("too many requests")) {
      return authErrorMap.over_email_send_rate_limit;
    }
    if (lowerMessage.includes("password should be at least 6 characters")) {
      return authErrorMap.password_too_short;
    }
    return error; // Devolver original si no coincide
  }

  const { code, status, message } = error;

  // 1. Buscar por código de error de Auth (e.g. 'invalid_credentials')
  if (code && authErrorMap[code]) {
    return authErrorMap[code];
  }

  // 2. Buscar por código de error de Postgres (e.g. '23505')
  if (code && dbErrorMap[code]) {
    return dbErrorMap[code];
  }

  // 3. Fallback de búsqueda rápida analizando partes del mensaje en inglés
  if (message) {
    const msgLower = message.toLowerCase();
    if (msgLower.includes("invalid login credentials") || msgLower.includes("invalid credentials")) {
      return authErrorMap.invalid_credentials;
    }
    if (msgLower.includes("already registered") || msgLower.includes("user already exists")) {
      return authErrorMap.user_already_exists;
    }
    if (msgLower.includes("email not confirmed")) {
      return authErrorMap.email_not_confirmed;
    }
    if (msgLower.includes("rate limit") || msgLower.includes("too many requests") || msgLower.includes("email rate limit")) {
      return authErrorMap.over_email_send_rate_limit;
    }
    if (msgLower.includes("password should be at least 6 characters")) {
      return authErrorMap.password_too_short;
    }
    if (msgLower.includes("user not found")) {
      return authErrorMap.user_not_found;
    }
    if (msgLower.includes("weak password")) {
      return authErrorMap.weak_password;
    }
    if (msgLower.includes("unique_active_subscription_per_user")) {
      return "Ya tienes una suscripción activa con ese nombre.";
    }
    
    return message;
  }

  // Fallback si no hay message ni code identificable
  return "Ocurrió un error inesperado.";
}
