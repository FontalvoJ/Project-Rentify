import axios from "axios";

/* ===========================
   CONSTANTES
=========================== */
const STATES = {
  ASK_NAME: "ASK_NAME",
  ASK_REGISTERED: "ASK_REGISTERED",
  GUEST_MENU: "GUEST_MENU",
  USER_MENU: "USER_MENU",
  PROMOTIONS: "PROMOTIONS",
  SELECT_CAR: "SELECT_CAR",
};

const CONFIG = {
  MAX_NAME_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_FAILED_ATTEMPTS: 3,
};

const MESSAGES = {
  WELCOME: "👋 Bienvenido a Rentify 🚗\n¿Cuál es tu nombre?",
  RESET: "🔄 Conversación reiniciada",
  BACK_TO_MENU: "🔙 Volviendo al menú principal...",
  NAME_TOO_SHORT:
    "⚠️ El nombre es muy corto. Debe tener al menos 2 caracteres.",
  NAME_TOO_LONG: "⚠️ El nombre es muy largo. Máximo 50 caracteres.",
  INVALID_NAME: "⚠️ El nombre solo puede contener letras y espacios.",
  TOO_MANY_ATTEMPTS:
    '❌ Demasiados intentos fallidos.\n\n💡 Escribe "ayuda" para ver qué puedes hacer o "reset" para empezar de nuevo.',
};

/* ===========================
   ALMACENAMIENTO DE SESIONES
=========================== */
const sessions = {};

/* ===========================
   UTILIDADES
=========================== */

/**
 * Normaliza texto: elimina acentos, convierte a minúsculas y elimina espacios extra
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Valida que el nombre sea válido
 */
function isValidName(name) {
  const trimmed = name.trim();

  if (trimmed.length < CONFIG.MIN_NAME_LENGTH) {
    return { valid: false, error: MESSAGES.NAME_TOO_SHORT };
  }

  if (trimmed.length > CONFIG.MAX_NAME_LENGTH) {
    return { valid: false, error: MESSAGES.NAME_TOO_LONG };
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmed)) {
    return { valid: false, error: MESSAGES.INVALID_NAME };
  }

  return { valid: true };
}

/**
 * Capitaliza la primera letra de cada palabra
 */
function capitalizeName(name) {
  return name
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatCarName(car) {
  return `${car.brand} ${car.model} (${car.year})`;
}

function getRecommendation(car1, car2) {
  let message = "🔍 Recomendación:\n";

  if (car1.pricePerDay < car2.pricePerDay) {
    message += `💰 Más económico: ${formatCarName(car1)}\n`;
  } else if (car2.pricePerDay < car1.pricePerDay) {
    message += `💰 Más económico: ${formatCarName(car2)}\n`;
  }

  if (car1.power > car2.power) {
    message += `⚡ Más potente: ${formatCarName(car1)}\n`;
  } else if (car2.power > car1.power) {
    message += `⚡ Más potente: ${formatCarName(car2)}\n`;
  }

  if (car1.year > car2.year) {
    message += `🆕 Más nuevo: ${formatCarName(car1)}\n`;
  } else if (car2.year > car1.year) {
    message += `🆕 Más nuevo: ${formatCarName(car2)}\n`;
  }

  return message;
}

/* ===========================
   CONSTRUCTORES DE MENSAJES
=========================== */

function buildMenu(session) {
  if (session.isRegistered) {
    return `📋 MENÚ CLIENTE

Hola ${session.name}, ¿qué deseas hacer?

1️⃣ Reservar un auto  
2️⃣ Ver promociones  
3️⃣ Ayuda técnica  

Comandos útiles:
0️⃣ Volver  
❓ ayuda → obtener ayuda
🔄 menu → ir al menú principal  
🔁 reset → reiniciar chat`;
  }

  return `📋 MENÚ INVITADO

Hola ${session.name}, ¿qué deseas hacer?

1️⃣ Ver autos disponibles  
2️⃣ Ver promociones  
3️⃣ ¿Cómo crear una cuenta?  

Comandos útiles:
0️⃣ Volver  
❓ ayuda → obtener ayuda
🔄 menu → ir al menú principal  
🔁 reset → reiniciar chat`;
}

function buildPromotions() {
  return `🎁 PROMOCIONES RENTIFY

¡Aprovecha nuestros descuentos!

✨ Más de 12 días → 10% de descuento  
✨ Más de 20 días → 20% de descuento  

📌 Detalles:
   • Descuento automático al reservar
   • Válido para todos los vehículos
   • Disponible para clientes registrados

💡 ¡Entre más tiempo rentes, más ahorras! 🚗`;
}

function buildInvalidOption() {
  return `❗ Opción inválida

Por favor, escribe el número de la opción que deseas.

Puedes usar:
0️⃣ Volver al menú
❓ ayuda → ver opciones disponibles
🔄 menu → ir al menú principal
🔁 reset → reiniciar conversación

💬 ¿Necesitas ayuda? Escribe "agente"`;
}

function buildHelp(session) {
  let helpMessage = `❓ AYUDA RENTIFY

Comandos disponibles en cualquier momento:

🔄 menu → volver al menú principal
🔁 reset → reiniciar la conversación
0️⃣ 0 → regresar al menú
💬 agente → hablar con un humano

`;

  switch (session.state) {
    case STATES.ASK_NAME:
      helpMessage += `📍 Ahora: Te estoy pidiendo tu nombre.
      
Escribe tu nombre completo para continuar.
Ejemplo: Juan Pérez`;
      break;

    case STATES.ASK_REGISTERED:
      helpMessage += `📍 Ahora: Te pregunto si ya tienes cuenta.

Responde:
• "sí" si ya estás registrado
• "no" si aún no tienes cuenta`;
      break;

    case STATES.GUEST_MENU:
      helpMessage += `📍 Ahora: Estás en el menú de invitado.

Opciones disponibles:
1️⃣ Ver catálogo de autos
2️⃣ Ver promociones actuales
3️⃣ Aprender a crear cuenta`;
      break;

    case STATES.USER_MENU:
      helpMessage += `📍 Ahora: Estás en el menú de cliente.

Opciones disponibles:
1️⃣ Hacer una reserva
2️⃣ Ver promociones
3️⃣ Obtener ayuda técnica`;
      break;

    case STATES.PROMOTIONS:
      helpMessage += `📍 Ahora: Viendo promociones.

Escribe "0" para volver al menú principal.`;
      break;

    case STATES.SELECT_CAR:
      helpMessage += `📍 Ahora: Seleccionando un auto.

Escribe el número del auto que te interesa.
O escribe "comparar X Y" para comparar dos autos.`;
      break;
  }

  return helpMessage;
}

function buildComparison(car1, car2) {
  return `📊 COMPARACIÓN DE AUTOS

🚗 ${formatCarName(car1)}
   💰 $${car1.pricePerDay}/día
   ⚡ ${car1.power} hp
   📍 ${car1.location}

🚗 ${formatCarName(car2)}
   💰 $${car2.pricePerDay}/día
   ⚡ ${car2.power} hp
   📍 ${car2.location}

${getRecommendation(car1, car2)}

Escribe el número del auto para seleccionarlo
0️⃣ Volver al menú`;
}

/* ===========================
   GESTIÓN DE SESIONES
=========================== */
function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = {
      state: STATES.ASK_NAME,
      name: null,
      isRegistered: null,
      failedAttempts: 0,
      availableCars: [],
      selectedCar: null,
    };
  }
  return sessions[userId];
}

function resetSession(userId) {
  sessions[userId] = {
    state: STATES.ASK_NAME,
    name: null,
    isRegistered: null,
    failedAttempts: 0,
    availableCars: [],
    selectedCar: null,
  };
}

/* ===========================
   COMANDOS GLOBALES
=========================== */
function handleGlobalCommands(text, session, userId) {
  const normalized = normalizeText(text);

  // Reset
  if (normalized === "reset") {
    resetSession(userId);
    return {
      response: `${MESSAGES.RESET}\n\n${MESSAGES.WELCOME}`,
      override: true,
    };
  }

  // Menu
  if (normalized === "menu") {
    session.state = session.isRegistered ? STATES.USER_MENU : STATES.GUEST_MENU;
    session.failedAttempts = 0;
    return {
      response: buildMenu(session),
      override: true,
    };
  }

  // Back
  if (text === "0") {
    session.state = session.isRegistered ? STATES.USER_MENU : STATES.GUEST_MENU;
    session.failedAttempts = 0;
    return {
      response: `${MESSAGES.BACK_TO_MENU}\n\n${buildMenu(session)}`,
      override: true,
    };
  }

  // Ayuda
  if (normalized === "ayuda") {
    return {
      response: buildHelp(session),
      override: true,
    };
  }

  // Contactar agente
  if (normalized === "agente" || normalized === "humano") {
    return {
      response: `🤝 Contacto con soporte humano

Puedes comunicarte directamente con nuestro equipo:

📧 Correo: soporte@rentify.com  
📞 Teléfono: +57 300 123 4567  

🕒 Horario de atención:
Lunes a viernes de 8:00 a.m. a 6:00 p.m.

Mientras tanto, puedes:
🔄 Escribir "menu" para volver al menú
❓ Escribir "ayuda" para ver opciones`,
      override: true,
    };
  }

  return { override: false };
}

/* ===========================
   MANEJADOR PRINCIPAL
=========================== */
export async function handleMessage(userId, message, service) {
  const session = getSession(userId);
  const text = message.trim();

  // Validar entrada vacía
  if (!text) {
    return "⚠️ Por favor escribe algo para continuar.";
  }

  // Comandos globales
  const global = handleGlobalCommands(text, session, userId);
  if (global.override) return global.response;

  // Verificar intentos fallidos
  if (session.failedAttempts >= CONFIG.MAX_FAILED_ATTEMPTS) {
    return MESSAGES.TOO_MANY_ATTEMPTS;
  }

  const normalized = normalizeText(text);

  switch (session.state) {
    /* ===== ASK NAME ===== */
    case STATES.ASK_NAME: {
      const validation = isValidName(text);

      if (!validation.valid) {
        session.failedAttempts++;
        return validation.error;
      }

      session.name = capitalizeName(text);
      session.state = STATES.ASK_REGISTERED;
      session.failedAttempts = 0;

      return `👋 Hola ${session.name}

¿Estás registrado en Rentify?

Responde:
👉 sí  
👉 no`;
    }

    /* ===== ASK REGISTERED ===== */
    case STATES.ASK_REGISTERED: {
      if (normalized === "si") {
        session.isRegistered = true;
        session.state = STATES.USER_MENU;
        session.failedAttempts = 0;
        return `✅ Perfecto ${session.name}\n\n${buildMenu(session)}`;
      }

      if (normalized === "no") {
        session.isRegistered = false;
        session.state = STATES.GUEST_MENU;
        session.failedAttempts = 0;
        return `👀 Bienvenido ${session.name}\n\n${buildMenu(session)}`;
      }

      session.failedAttempts++;
      return `⚠️ Respuesta inválida

Escribe:
👉 sí (si estás registrado)
👉 no (si aún no tienes cuenta)

💡 Escribe "ayuda" si necesitas asistencia`;
    }

    /* ===== GUEST MENU ===== */
    case STATES.GUEST_MENU: {
      if (normalized === "1") {
        session.failedAttempts = 0;

        const availableCars = await service.getAvailableCars();

        if (!availableCars || availableCars.length === 0) {
          return `🚗 AUTOS DISPONIBLES

❌ Actualmente no hay vehículos disponibles.

💡 Intenta más tarde o revisa nuestras promociones

0️⃣ Volver al menú`;
        }

        // Guardar autos en sesión para usar en SELECT_CAR
        session.availableCars = availableCars;
        session.state = STATES.SELECT_CAR;

        const carList = availableCars
          .map(
            (car, index) =>
              `${index + 1}. ${formatCarName(car)} — $${car.pricePerDay}/día`,
          )
          .join("\n");

        return `🚗 AUTOS DISPONIBLES

Tenemos ${availableCars.length} vehículo(s) disponibles:

${carList}

🔐 Para reservar necesitas iniciar sesión

👉 https://rentify.com/login

💡 Si no tienes cuenta:
👉 https://rentify.com/register

📊 Compara dos autos: comparar 1 2
0️⃣ Volver al menú`;
      }

      if (normalized === "2") {
        session.state = STATES.PROMOTIONS;
        session.failedAttempts = 0;
        return buildPromotions();
      }

      if (normalized === "3") {
        session.failedAttempts = 0;
        return `📝 CREAR CUENTA

Sigue estos pasos:
🔹 Ve a la página de registro
🔹 Completa tus datos
🔹 Crea tu usuario y contraseña
🔹 Inicia sesión
🔹 ¡Listo! Ya puedes reservar 🚗

👉 https://api-backend-rentify.onrender.com/sign-up-users

✨ Ventajas de tener cuenta:
   • Reservas en línea
   • Historial de rentas
   • Promociones exclusivas

0️⃣ Volver al menú`;
      }

      session.failedAttempts++;
      return buildInvalidOption();
    }

    /* ===== USER MENU ===== */
    case STATES.USER_MENU: {
      if (normalized === "1") {
        session.failedAttempts = 0;
        return `🚗 RESERVAR AUTO

Pasos para tu reserva:
🔹 Inicia sesión en la plataforma
🔹 Ve al panel principal
🔹 Selecciona "Autos"
🔹 Elige tu vehículo
🔹 Selecciona fechas de renta
🔹 Confirma tu reserva

💡 Recuerda: rentas mayores a 12 días tienen descuento

0️⃣ Volver al menú`;
      }

      if (normalized === "2") {
        session.state = STATES.PROMOTIONS;
        session.failedAttempts = 0;
        return buildPromotions();
      }

      if (normalized === "3") {
        session.failedAttempts = 0;
        return `🛠️ AYUDA TÉCNICA

¿Tienes algún problema? Podemos ayudarte con:

🔹 Problemas con reservas
🔹 Errores de inicio de sesión
🔹 Registro de cuenta nueva
🔹 Errores del sistema
🔹 Visualización de autos
🔹 Pagos y facturación

💬 Escribe "agente" para hablar con soporte

0️⃣ Volver al menú`;
      }

      session.failedAttempts++;
      return buildInvalidOption();
    }

    /* ===== PROMOTIONS ===== */
    case STATES.PROMOTIONS: {
      session.failedAttempts = 0;
      return `${buildPromotions()}\n\n0️⃣ Volver al menú`;
    }

    /* ===== SELECT CAR ===== */
    case STATES.SELECT_CAR: {
      // 📊 COMPARACIÓN: "comparar 1 2"
      if (normalized.startsWith("comparar")) {
        const parts = normalized.split(" ");

        if (parts.length < 3) {
          return `❗ Uso incorrecto

Ejemplo:
👉 comparar 1 2`;
        }

        const index1 = parseInt(parts[1]);
        const index2 = parseInt(parts[2]);

        if (
          isNaN(index1) ||
          isNaN(index2) ||
          index1 < 1 ||
          index2 < 1 ||
          index1 > session.availableCars.length ||
          index2 > session.availableCars.length
        ) {
          return `❗ Números inválidos

Elige dos números válidos de la lista`;
        }

        const car1 = session.availableCars[index1 - 1];
        const car2 = session.availableCars[index2 - 1];

        return buildComparison(car1, car2);
      }

      // 🚗 SELECCIÓN DE AUTO
      const index = parseInt(normalized);

      if (isNaN(index) || index < 1 || index > session.availableCars.length) {
        session.failedAttempts++;
        return `❗ Opción inválida

Por favor escribe un número válido de la lista

📊 O compara autos:
👉 comparar 1 2

0️⃣ Volver al menú`;
      }

      const selectedCar = session.availableCars[index - 1];
      session.selectedCar = selectedCar;
      session.failedAttempts = 0;

      const reserveLink = `https://project-rentify.netlify.app/cars-to-reservation?carId=${selectedCar._id}`;

      return `🚗 AUTO SELECCIONADO

Has elegido: ${formatCarName(selectedCar)}

💰 $${selectedCar.pricePerDay}/día  
📍 Ubicación: ${selectedCar.location}

🔐 Para continuar con la reserva:

👉 ${reserveLink}

💡 Debes iniciar sesión para completar la reserva

0️⃣ Volver al menú`;
    }

    default:
      return '⚠️ Error del sistema 🤖\n\n💡 Escribe "reset" para reiniciar';
  }
}

/* ===========================
   SERVICIO DE CHATBOT
=========================== */
export class ChatbotService {
  constructor() {
    this.apiUrl = "http://localhost:3030/api/cars";
  }

  async getAvailableCars() {
    try {
      const response = await axios.get(`${this.apiUrl}/allCars`);
      const cars = response.data.data;
      return cars.filter((car) => car.available === true);
    } catch (error) {
      console.error("Error obteniendo autos:", error);
      return [];
    }
  }

  async processMessage(userId, message) {
    return await handleMessage(userId, message, this);
  }
}
