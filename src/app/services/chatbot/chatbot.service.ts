import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CarService } from '../../services/cars/cars.service'

/* ===========================
   TIPOS E INTERFACES
=========================== */
interface Session {
  state: string;
  name: string | null;
  isRegistered: boolean | null;
  failedAttempts: number;
  availableCars: Car[];
  selectedCar: Car | null;
}

interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  pricePerDay: number | { $numberDecimal: string };
  power: number;
  location: string;
  imageUrl: string;
  isAvailable: {
    _id: string;
    status: string;
  };
}

/* ===========================
   CONSTANTES
=========================== */
const STATES = {
  ASK_NAME: 'ASK_NAME',
  ASK_REGISTERED: 'ASK_REGISTERED',
  GUEST_MENU: 'GUEST_MENU',
  USER_MENU: 'USER_MENU',
  PROMOTIONS: 'PROMOTIONS',
  SELECT_CAR: 'SELECT_CAR',
} as const;

const CONFIG = {
  MAX_NAME_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_FAILED_ATTEMPTS: 3,
};

const MESSAGES = {
  WELCOME: '👋 Bienvenido a Rentify 🚗\n¿Cuál es tu nombre?',
  RESET: '🔄 Conversación reiniciada',
  BACK_TO_MENU: '🔙 Volviendo al menú principal...',
  NAME_TOO_SHORT: '⚠️ El nombre es muy corto. Debe tener al menos 2 caracteres.',
  NAME_TOO_LONG: '⚠️ El nombre es muy largo. Máximo 50 caracteres.',
  INVALID_NAME: '⚠️ El nombre solo puede contener letras y espacios.',
  TOO_MANY_ATTEMPTS:
    '❌ Demasiados intentos fallidos.\n\n💡 Escribe "ayuda" para ver qué puedes hacer o "reset" para empezar de nuevo.',
};

// Valores que se consideran "disponible" — ajusta si tu BD usa otro string
const AVAILABLE_STATUSES = ['Disponible'];

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  /** Almacenamiento de sesiones en memoria */
  private sessions: Record<string, Session> = {};

  constructor(private carService: CarService) { }

  /* ===========================
     MÉTODO PÚBLICO PRINCIPAL
  =========================== */

  async processMessage(userId: string, message: string): Promise<string> {
    return this.handleMessage(userId, message);
  }

  /* ===========================
     GESTIÓN DE SESIONES
  =========================== */

  private getSession(userId: string): Session {
    if (!this.sessions[userId]) {
      this.sessions[userId] = {
        state: STATES.ASK_NAME,
        name: null,
        isRegistered: null,
        failedAttempts: 0,
        availableCars: [],
        selectedCar: null,
      };
    }
    return this.sessions[userId];
  }

  private resetSession(userId: string): void {
    this.sessions[userId] = {
      state: STATES.ASK_NAME,
      name: null,
      isRegistered: null,
      failedAttempts: 0,
      availableCars: [],
      selectedCar: null,
    };
  }

  /* ===========================
     MANEJADOR PRINCIPAL
  =========================== */

  private async handleMessage(userId: string, message: string): Promise<string> {
    const session = this.getSession(userId);
    const text = message.trim();

    if (!text) {
      return '⚠️ Por favor escribe algo para continuar.';
    }

    const globalResult = this.handleGlobalCommands(text, session, userId);
    if (globalResult) return globalResult;

    if (session.failedAttempts >= CONFIG.MAX_FAILED_ATTEMPTS) {
      return MESSAGES.TOO_MANY_ATTEMPTS;
    }

    const normalized = this.normalizeText(text);

    switch (session.state) {

      /* ===== ASK NAME ===== */
      case STATES.ASK_NAME: {
        const validation = this.isValidName(text);

        if (!validation.valid) {
          session.failedAttempts++;
          return validation.error!;
        }

        session.name = this.capitalizeName(text);
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
        if (normalized === 'si') {
          session.isRegistered = true;
          session.state = STATES.USER_MENU;
          session.failedAttempts = 0;
          return `✅ Perfecto ${session.name}\n\n${this.buildMenu(session)}`;
        }

        if (normalized === 'no') {
          session.isRegistered = false;
          session.state = STATES.GUEST_MENU;
          session.failedAttempts = 0;
          return `👀 Bienvenido ${session.name}\n\n${this.buildMenu(session)}`;
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
        if (normalized === '1') {
          session.failedAttempts = 0;

          const availableCars = await this.getAvailableCars();

          if (!availableCars || availableCars.length === 0) {
            return `🚗 AUTOS DISPONIBLES

❌ Actualmente no hay vehículos disponibles.

💡 Intenta más tarde o revisa nuestras promociones

0️⃣ Volver al menú`;
          }

          session.availableCars = availableCars;
          session.state = STATES.SELECT_CAR;

          const carList = availableCars
            .map((car, i) => `${i + 1}. ${this.formatCarName(car)} — ${this.formatPrice(car.pricePerDay)}/día`)
            .join('\n');

          return `🚗 AUTOS DISPONIBLES

Tenemos ${availableCars.length} vehículo(s) disponibles:

${carList}

🔐 Para reservar necesitas iniciar sesión
👉 https://project-rentify.netlify.app/sign-in

💡 Si no tienes cuenta:
👉 https://project-rentify.netlify.app/sign-up-users

📊 Compara dos autos escribiendo: comparar 1 2
0️⃣ Volver al menú`;
        }

        if (normalized === '2') {
          session.state = STATES.PROMOTIONS;
          session.failedAttempts = 0;
          return this.buildPromotions();
        }

        if (normalized === '3') {
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
        return this.buildInvalidOption();
      }

      /* ===== USER MENU ===== */
      case STATES.USER_MENU: {
        if (normalized === '1') {
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

        if (normalized === '2') {
          session.state = STATES.PROMOTIONS;
          session.failedAttempts = 0;
          return this.buildPromotions();
        }

        if (normalized === '3') {
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
        return this.buildInvalidOption();
      }

      /* ===== PROMOTIONS ===== */
      case STATES.PROMOTIONS: {
        session.failedAttempts = 0;
        return `${this.buildPromotions()}\n\n0️⃣ Volver al menú`;
      }

      /* ===== SELECT CAR ===== */
      case STATES.SELECT_CAR: {
        if (normalized.startsWith('comparar')) {
          const parts = normalized.split(' ');

          if (parts.length < 3) {
            return `❗ Uso incorrecto\n\nEjemplo:\n👉 comparar 1 2`;
          }

          const index1 = parseInt(parts[1]);
          const index2 = parseInt(parts[2]);

          if (
            isNaN(index1) || isNaN(index2) ||
            index1 < 1 || index2 < 1 ||
            index1 > session.availableCars.length ||
            index2 > session.availableCars.length
          ) {
            return `❗ Números inválidos\n\nElige dos números válidos de la lista`;
          }

          return this.buildComparison(
            session.availableCars[index1 - 1],
            session.availableCars[index2 - 1]
          );
        }

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

Has elegido: ${this.formatCarName(selectedCar)}

💰 ${this.formatPrice(selectedCar.pricePerDay)}/día  
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
     COMANDOS GLOBALES
  =========================== */

  private handleGlobalCommands(text: string, session: Session, userId: string): string | null {
    const normalized = this.normalizeText(text);

    if (normalized === 'reset') {
      this.resetSession(userId);
      return `${MESSAGES.RESET}\n\n${MESSAGES.WELCOME}`;
    }

    if (normalized === 'menu') {
      session.state = session.isRegistered ? STATES.USER_MENU : STATES.GUEST_MENU;
      session.failedAttempts = 0;
      return this.buildMenu(session);
    }

    if (text === '0') {
      session.state = session.isRegistered ? STATES.USER_MENU : STATES.GUEST_MENU;
      session.failedAttempts = 0;
      return `${MESSAGES.BACK_TO_MENU}\n\n${this.buildMenu(session)}`;
    }

    if (normalized === 'ayuda') {
      return this.buildHelp(session);
    }

    if (normalized === 'agente' || normalized === 'humano') {
      return `🤝 Contacto con soporte humano

Puedes comunicarte directamente con nuestro equipo:

📧 Correo: soporte@rentify.com  
📞 Teléfono: +57 300 123 4567  

🕒 Horario de atención:
Lunes a viernes de 8:00 a.m. a 6:00 p.m.

Mientras tanto, puedes:
🔄 Escribir "menu" para volver al menú
❓ Escribir "ayuda" para ver opciones`;
    }

    return null;
  }

  /* ===========================
     LLAMADA A LA API — reutiliza CarService
  =========================== */

  private async getAvailableCars(): Promise<Car[]> {
    try {
      const cars = await firstValueFrom(this.carService.getAllCarsForEveryone());

      //console.log('Total autos recibidos:', cars.length);
      //console.log('isAvailable del primer auto:', cars[0]?.isAvailable);

      return (cars as unknown as Car[]).filter(car =>
        car.isAvailable?.status === 'Disponible'
      );
    } catch (error) {
      console.error('Error obteniendo autos:', error);
      return [];
    }
  }

  /* ===========================
     UTILIDADES
  =========================== */

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private isValidName(name: string): { valid: boolean; error?: string } {
    const trimmed = name.trim();
    if (trimmed.length < CONFIG.MIN_NAME_LENGTH) return { valid: false, error: MESSAGES.NAME_TOO_SHORT };
    if (trimmed.length > CONFIG.MAX_NAME_LENGTH) return { valid: false, error: MESSAGES.NAME_TOO_LONG };
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmed)) return { valid: false, error: MESSAGES.INVALID_NAME };
    return { valid: true };
  }

  private capitalizeName(name: string): string {
    return name.trim().split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  private formatPrice(price: number | { $numberDecimal: string }): string {
    if (typeof price === "object" && price !== null && "$numberDecimal" in price) {
      return parseFloat(price["$numberDecimal"]).toLocaleString("es-CO");
    }
    return Number(price).toLocaleString("es-CO");
  }

  private formatCarName(car: Car): string {
    return `${car.brand} ${car.model} (${car.year})`;
  }

  private getRecommendation(car1: Car, car2: Car): string {
    let msg = '🔍 Recomendación:\n';
    if (parseFloat(String((car1.pricePerDay as any)?.$numberDecimal ?? car1.pricePerDay)) < parseFloat(String((car2.pricePerDay as any)?.$numberDecimal ?? car2.pricePerDay))) msg += `💰 Más económico: ${this.formatCarName(car1)}\n`;
    else if (parseFloat(String((car2.pricePerDay as any)?.$numberDecimal ?? car2.pricePerDay)) < parseFloat(String((car1.pricePerDay as any)?.$numberDecimal ?? car1.pricePerDay))) msg += `💰 Más económico: ${this.formatCarName(car2)}\n`;
    if (car1.power > car2.power) msg += `⚡ Más potente: ${this.formatCarName(car1)}\n`;
    else if (car2.power > car1.power) msg += `⚡ Más potente: ${this.formatCarName(car2)}\n`;
    if (car1.year > car2.year) msg += `🆕 Más nuevo: ${this.formatCarName(car1)}\n`;
    else if (car2.year > car1.year) msg += `🆕 Más nuevo: ${this.formatCarName(car2)}\n`;
    return msg;
  }

  /* ===========================
     CONSTRUCTORES DE MENSAJES
  =========================== */

  private buildMenu(session: Session): string {
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

  private buildPromotions(): string {
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

  private buildInvalidOption(): string {
    return `❗ Opción inválida

Por favor, escribe el número de la opción que deseas.

Puedes usar:
0️⃣ Volver al menú
❓ ayuda → ver opciones disponibles
🔄 menu → ir al menú principal
🔁 reset → reiniciar conversación

💬 ¿Necesitas ayuda? Escribe "agente"`;
  }

  private buildHelp(session: Session): string {
    let help = `❓ AYUDA RENTIFY

Comandos disponibles en cualquier momento:

🔄 menu → volver al menú principal
🔁 reset → reiniciar la conversación
0️⃣ 0 → regresar al menú
💬 agente → hablar con un humano

`;

    switch (session.state) {
      case STATES.ASK_NAME:
        help += `📍 Ahora: Te estoy pidiendo tu nombre.\n\nEscribe tu nombre completo.\nEjemplo: Juan Pérez`;
        break;
      case STATES.ASK_REGISTERED:
        help += `📍 Ahora: Te pregunto si ya tienes cuenta.\n\nResponde:\n• "sí" si ya estás registrado\n• "no" si aún no tienes cuenta`;
        break;
      case STATES.GUEST_MENU:
        help += `📍 Ahora: Estás en el menú de invitado.\n\nOpciones:\n1️⃣ Ver catálogo de autos\n2️⃣ Ver promociones\n3️⃣ Aprender a crear cuenta`;
        break;
      case STATES.USER_MENU:
        help += `📍 Ahora: Estás en el menú de cliente.\n\nOpciones:\n1️⃣ Hacer una reserva\n2️⃣ Ver promociones\n3️⃣ Obtener ayuda técnica`;
        break;
      case STATES.PROMOTIONS:
        help += `📍 Ahora: Viendo promociones.\n\nEscribe "0" para volver al menú.`;
        break;
      case STATES.SELECT_CAR:
        help += `📍 Ahora: Seleccionando un auto.\n\nEscribe el número del auto.\nO escribe "comparar X Y" para comparar dos.`;
        break;
    }

    return help;
  }

  private buildComparison(car1: Car, car2: Car): string {
    return `📊 COMPARACIÓN DE AUTOS

🚗 ${this.formatCarName(car1)}
   💰 ${this.formatPrice(car1.pricePerDay)}/día
   ⚡ ${car1.power} hp
   📍 ${car1.location}

🚗 ${this.formatCarName(car2)}
   💰 ${this.formatPrice(car2.pricePerDay)}/día
   ⚡ ${car2.power} hp
   📍 ${car2.location}

${this.getRecommendation(car1, car2)}
Escribe el número del auto para seleccionarlo
0️⃣ Volver al menú`;
  }
}