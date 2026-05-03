import request from "supertest";
import app from "../../src/app.js";
import mongoose from "mongoose";
import { connectDB } from "../../src/database.js";
import { initializeDefaults } from "../../src/libs/initialSetup.js";
import System from "../../src/models/Systems.js";
import CompanionType from "../../src/models/Companions.js";
import CarAvailability from "../../src/models/AutoAvail.js";
import ResState from "../../src/models/ResState.js";
import { MongoMemoryServer } from "mongodb-memory-server";

let adminToken;
let clientToken;
let system;
let companion;
let availabilityId;

let mongod;

afterAll(async () => {
  await mongoose.disconnect();
});

beforeAll(async () => {
  await connectDB();
  await initializeDefaults();

  let disponible = await CarAvailability.findOne({ status: "Disponible" });
  if (!disponible)
    disponible = await CarAvailability.create({ status: "Disponible" });
  availabilityId = disponible._id.toString();

  let reservado = await CarAvailability.findOne({ status: "Reservado" });
  if (!reservado) await CarAvailability.create({ status: "Reservado" });

  for (const status of ["Pendiente", "Activa", "Completada", "Cancelada"]) {
    const exists = await ResState.findOne({ status });
    if (!exists) await ResState.create({ status });
  }

  const adminData = {
    name: "AdminTest",
    email: `admintest+${Date.now()}@example.com`,
    password: "StrongPass123!",
  };
  const resAdmin = await request(app)
    .post("/api/auth/signUpAdmin")
    .send(adminData);
  expect(resAdmin.statusCode).toBe(201);
  adminToken = resAdmin.body.token;

  const clientData = {
    name: "ClientTest",
    email: `clienttest+${Date.now()}@example.com`,
    password: "123456",
    identification: "123456789",
    address: "Calle Test 123",
    contact: "3111111111",
  };
  const resClient = await request(app)
    .post("/api/auth/signUpClient")
    .send(clientData);
  expect(resClient.statusCode).toBe(201);
  clientToken = resClient.body.token;

  system = await System.create({ type: "Gasolina" });
  companion = await CompanionType.create({ amount: 4 });
});

afterAll(async () => {
  await mongoose.disconnect();
});

function buildCarPayload(overrides = {}) {
  return {
    brand: "Kia",
    model: "Picanto",
    year: 2024,
    color: "Green",
    pricePerDay: 50,
    location: "Medellín",
    power: 1500,
    imageUrl:
      "https://content.r9cdn.net/rimg/car-images/generic/01_mini_white.png",
    systemId: system._id.toString(),
    companionTypeId: companion._id.toString(),
    isAvailable: availabilityId,
    ...overrides,
  };
}

describe("Pruebas sobre API Rentify", () => {
  // ─── AUTH ──────────────────────────────────────────────────────────────────

  describe("POST /api/auth/signUpAdmin", () => {
    it("Register a new admin", async () => {
      const adminData = {
        name: "Admin Tester",
        email: `admin${Date.now()}@example.com`,
        password: "StrongPass123!",
      };

      const response = await request(app)
        .post("/api/auth/signUpAdmin")
        .send(adminData);

      expect(response.statusCode).toBe(201);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual(
        expect.objectContaining({
          token: expect.any(String),
          role: "admin",
          name: "Admin Tester",
        }),
      );
    });
  });

  describe("POST /api/auth/signUpClient", () => {
    it("Register a new client", async () => {
      const clientData = {
        name: "Mabel",
        email: `mabel+${Date.now()}@example.com`,
        password: "123456",
        identification: "1098765432",
        address: "Calle 123 #45-67",
        contact: "3104567890",
      };

      const response = await request(app)
        .post("/api/auth/signUpClient")
        .send(clientData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          token: expect.any(String),
          role: "client",
          name: "Mabel",
        }),
      );
    });
  });

  describe("POST /api/auth/signInUsers", () => {
    it("Should sign in an admin with valid credentials", async () => {
      const email = `adminsignin+${Date.now()}@example.com`;
      const password = "StrongPass123!";

      await request(app)
        .post("/api/auth/signUpAdmin")
        .send({ name: "AdminSignIn", email, password });

      const response = await request(app)
        .post("/api/auth/signInUsers")
        .send({ email, password });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String), role: "admin" }),
      );
    });

    it("Should sign in a client with valid credentials", async () => {
      const email = `clientsignin+${Date.now()}@example.com`;
      const password = "123456";

      await request(app).post("/api/auth/signUpClient").send({
        name: "ClientSignIn",
        email,
        password,
        identification: "9988776655",
        address: "Calle Login 1",
        contact: "3009999999",
      });

      const response = await request(app)
        .post("/api/auth/signInUsers")
        .send({ email, password });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String), role: "client" }),
      );
    });

    it("Should fail with wrong password", async () => {
      const email = `wrongpass+${Date.now()}@example.com`;
      await request(app)
        .post("/api/auth/signUpAdmin")
        .send({ name: "WrongPass", email, password: "Correct123!" });

      const response = await request(app)
        .post("/api/auth/signInUsers")
        .send({ email, password: "WrongPassword!" });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
      expect(response.statusCode).toBeLessThan(600);
    });

    it("Should fail with non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/signInUsers")
        .send({ email: "noexiste@example.com", password: "cualquiera123" });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
      expect(response.statusCode).toBeLessThan(600);
    });

    it("Should fail with missing fields", async () => {
      const response = await request(app)
        .post("/api/auth/signInUsers")
        .send({ email: "solo@email.com" });
      expect(response.statusCode).toBe(400);
    });
  });

  // ─── CLIENT ────────────────────────────────────────────────────────────────

  describe("GET /api/client/clientGetData", () => {
    it("Get client data with valid token", async () => {
      const clientData = {
        name: "Carlos",
        email: `carlos+${Date.now()}@example.com`,
        password: "123456",
        identification: "100200300",
        address: "Calle Falsa 123",
        contact: "3112345678",
      };

      const signUpResponse = await request(app)
        .post("/api/auth/signUpClient")
        .send(clientData);
      expect(signUpResponse.statusCode).toBe(201);
      const token = signUpResponse.body.token;

      const response = await request(app)
        .get("/api/client/clientGetData")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Información del cliente obtenida correctamente",
          data: expect.objectContaining({
            client: expect.objectContaining({
              identification: clientData.identification,
              address: clientData.address,
              contact: clientData.contact,
            }),
            user: expect.objectContaining({
              name: clientData.name,
              email: clientData.email,
            }),
          }),
        }),
      );
    });

    it("Should fail without token", async () => {
      const response = await request(app).get("/api/client/clientGetData");
      expect(response.statusCode).toBe(403);
    });
  });

  describe("PUT /api/client/clientUpdate", () => {
    it("Should update client and user data", async () => {
      const clientData = {
        name: "Ana",
        email: `ana+${Date.now()}@example.com`,
        password: "123456",
        identification: "11223344",
        address: "Calle Principal 45",
        contact: "3109998888",
      };

      const signUpResponse = await request(app)
        .post("/api/auth/signUpClient")
        .send(clientData);
      expect(signUpResponse.statusCode).toBe(201);
      const token = signUpResponse.body.token;

      const updatedData = {
        name: "Ana Actualizada",
        email: `ana.actualizada+${Date.now()}@example.com`,
        address: "Nueva dirección 789",
        contact: "3001112233",
        password: "NuevaClave123!",
      };

      const response = await request(app)
        .put("/api/client/clientUpdate")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedData);

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Cuenta actualizada correctamente",
          data: expect.objectContaining({
            client: expect.objectContaining({
              address: updatedData.address,
              contact: updatedData.contact,
            }),
            user: expect.objectContaining({
              name: updatedData.name,
              email: updatedData.email,
            }),
          }),
        }),
      );
    });

    it("Should fail without token", async () => {
      const response = await request(app)
        .put("/api/client/clientUpdate")
        .send({ name: "Intento sin token" });
      expect(response.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/client/clientDelete", () => {
    it("Should delete client account", async () => {
      const clientData = {
        name: "Pedro",
        email: `pedro+${Date.now()}@example.com`,
        password: "123456",
        identification: "55667788",
        address: "Calle Secundaria 22",
        contact: "3115556666",
      };

      const signUpResponse = await request(app)
        .post("/api/auth/signUpClient")
        .send(clientData);
      expect(signUpResponse.statusCode).toBe(201);
      const token = signUpResponse.body.token;

      const response = await request(app)
        .delete("/api/client/clientDelete")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Cuenta eliminada correctamente" }),
      );

      const checkResponse = await request(app)
        .get("/api/client/clientGetData")
        .set("Authorization", `Bearer ${token}`);
      expect(checkResponse.statusCode).toBe(404);
    });

    it("Should fail without token", async () => {
      const response = await request(app).delete("/api/client/clientDelete");
      expect(response.statusCode).toBe(403);
    });
  });

  // ─── CARS ──────────────────────────────────────────────────────────────────

  describe("GET /api/cars/allCars", () => {
    it("Should return all available cars without authentication", async () => {
      const response = await request(app).get("/api/cars/allCars");

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Autos obtenidos correctamente",
          data: expect.any(Array),
        }),
      );
    });
  });

  describe("POST /api/cars/createCar", () => {
    it("Should create a new car successfully", async () => {
      const response = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(buildCarPayload());

      expect(response.statusCode).toBe(201);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Auto creado exitosamente",
          data: expect.objectContaining({
            brand: "Kia",
            model: "Picanto",
            year: 2024,
            color: "Green",
            pricePerDay: 50,
            location: "Medellín",
            power: 1500,
          }),
        }),
      );
    });

    it("Should fail without token", async () => {
      const response = await request(app)
        .post("/api/cars/createCar")
        .send(buildCarPayload());
      expect(response.statusCode).toBe(403);
    });

    it("Should fail if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ model: "MissingBrand", year: 2023 });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Faltan campos obligatorios para crear el automóvil",
        }),
      );
    });

    it("Should fail if a client tries to create a car", async () => {
      const response = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${clientToken}`)
        .send(buildCarPayload({ brand: "Mazda", model: "CX-5" }));

      expect(response.statusCode).toBe(403);
    });
  });

  describe("GET /api/cars/listCarsAdminClient", () => {
    let localAdminToken;
    let localClientToken;
    let createdCarId;

    beforeAll(async () => {
      const adminSignUp = await request(app)
        .post("/api/auth/signUpAdmin")
        .send({
          name: "AdminGetTest",
          email: `adminget+${Date.now()}@example.com`,
          password: "StrongPass123!",
        });
      expect(adminSignUp.statusCode).toBe(201);
      localAdminToken = adminSignUp.body.token;

      const clientSignUp = await request(app)
        .post("/api/auth/signUpClient")
        .send({
          name: "ClientGetTest",
          email: `clientget+${Date.now()}@example.com`,
          password: "123456",
          identification: "123456789",
          address: "Calle Test 123",
          contact: "3111111111",
        });
      expect(clientSignUp.statusCode).toBe(201);
      localClientToken = clientSignUp.body.token;

      const createCar = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${localAdminToken}`)
        .send(
          buildCarPayload({
            brand: "Ford",
            model: "Fiesta",
            color: "Blue",
            pricePerDay: 60,
          }),
        );
      expect(createCar.statusCode).toBe(201);
      createdCarId = createCar.body.data._id;
    });

    it("Admin should get only their cars", async () => {
      const response = await request(app)
        .get("/api/cars/listCarsAdminClient")
        .set("Authorization", `Bearer ${localAdminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      const carIds = response.body.data.map((c) => c._id);
      expect(carIds).toContain(createdCarId);
    });

    it("Client should get only available cars", async () => {
      const response = await request(app)
        .get("/api/cars/listCarsAdminClient")
        .set("Authorization", `Bearer ${localClientToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((car) => {
        expect(car.isAvailable).toBeTruthy();
      });
    });

    it("Should fail without token", async () => {
      const response = await request(app).get("/api/cars/listCarsAdminClient");
      expect(response.statusCode).toBe(403);
    });
  });

  describe("PUT /api/cars/updateCar/:id", () => {
    let updateAdminToken;
    let createdCarId;

    beforeAll(async () => {
      const signUpResponse = await request(app)
        .post("/api/auth/signUpAdmin")
        .send({
          name: "AdminUpdateTest",
          email: `adminupdate+${Date.now()}@example.com`,
          password: "StrongPass123!",
        });
      expect(signUpResponse.statusCode).toBe(201);
      updateAdminToken = signUpResponse.body.token;

      const createCarResponse = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${updateAdminToken}`)
        .send(
          buildCarPayload({
            brand: "Renault",
            model: "Sandero",
            color: "Gray",
            pricePerDay: 40,
          }),
        );
      expect(createCarResponse.statusCode).toBe(201);
      createdCarId = createCarResponse.body.data._id;
    });

    it("Should update car successfully", async () => {
      const updatedData = { color: "Red", pricePerDay: 55, location: "Bogotá" };

      const response = await request(app)
        .put(`/api/cars/updateCar/${createdCarId}`)
        .set("Authorization", `Bearer ${updateAdminToken}`)
        .send(updatedData);

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Auto actualizado correctamente",
          data: expect.objectContaining({
            color: "Red",
            pricePerDay: 55,
            location: "Bogotá",
          }),
        }),
      );
    });

    it("Should fail if a client tries to update a car", async () => {
      const response = await request(app)
        .put(`/api/cars/updateCar/${createdCarId}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ color: "Yellow" });
      expect(response.statusCode).toBe(403);
    });

    it("Should fail with a non-existent car id", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .put(`/api/cars/updateCar/${fakeId}`)
        .set("Authorization", `Bearer ${updateAdminToken}`)
        .send({ color: "Blue" });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Auto no encontrado" }),
      );
    });

    it("Should fail without token", async () => {
      const response = await request(app)
        .put(`/api/cars/updateCar/${createdCarId}`)
        .send({ color: "Pink" });
      expect(response.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/cars/DeleteCar/:id", () => {
    let deleteAdminToken;
    let createdCarId;

    beforeAll(async () => {
      const signUpResponse = await request(app)
        .post("/api/auth/signUpAdmin")
        .send({
          name: "AdminDeleteTest",
          email: `admindelete+${Date.now()}@example.com`,
          password: "StrongPass123!",
        });
      expect(signUpResponse.statusCode).toBe(201);
      deleteAdminToken = signUpResponse.body.token;

      const createCarResponse = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${deleteAdminToken}`)
        .send(
          buildCarPayload({
            brand: "Toyota",
            model: "Corolla",
            color: "White",
            pricePerDay: 50,
          }),
        );
      expect(createCarResponse.statusCode).toBe(201);
      createdCarId = createCarResponse.body.data._id;
    });

    it("Should delete car successfully", async () => {
      const response = await request(app)
        .delete(`/api/cars/DeleteCar/${createdCarId}`)
        .set("Authorization", `Bearer ${deleteAdminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({ message: "Auto eliminado correctamente" }),
      );

      const getResponse = await request(app)
        .get("/api/cars/listCarsAdminClient")
        .set("Authorization", `Bearer ${deleteAdminToken}`);
      const carIds = getResponse.body.data.map((c) => c._id);
      expect(carIds).not.toContain(createdCarId);
    });

    it("Should fail without token", async () => {
      const response = await request(app).delete(
        `/api/cars/DeleteCar/${createdCarId}`,
      );
      expect(response.statusCode).toBe(403);
    });
  });

  // ─── RESERVATIONS ──────────────────────────────────────────────────────────

  describe("Reservations", () => {
    let reservationAdminToken;
    let reservationClientToken;
    let reservationCarId;
    let reservationId;

    beforeAll(async () => {
      const adminRes = await request(app)
        .post("/api/auth/signUpAdmin")
        .send({
          name: "AdminReservation",
          email: `adminreservation+${Date.now()}@example.com`,
          password: "StrongPass123!",
        });
      expect(adminRes.statusCode).toBe(201);
      reservationAdminToken = adminRes.body.token;

      const clientRes = await request(app)
        .post("/api/auth/signUpClient")
        .send({
          name: "ClientReservation",
          email: `clientreservation+${Date.now()}@example.com`,
          password: "123456",
          identification: "77788899",
          address: "Carrera 50 #30-10",
          contact: "3007654321",
        });
      expect(clientRes.statusCode).toBe(201);
      reservationClientToken = clientRes.body.token;

      // El auto debe tener isAvailable = ObjectId de "Disponible" para que
      // el service lo acepte al crear la reserva.
      const carRes = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${reservationAdminToken}`)
        .send(
          buildCarPayload({
            brand: "Chevrolet",
            model: "Spark",
            color: "Yellow",
            pricePerDay: 35,
            power: 1000,
          }),
        );
      expect(carRes.statusCode).toBe(201);
      reservationCarId = carRes.body.data._id;
    });

    describe("POST /api/reservations/createReservation", () => {
      it("Should create a reservation successfully", async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 5);

        const fmt = (d) => d.toISOString().split("T")[0];

        const response = await request(app)
          .post("/api/reservations/createReservation")
          .set("Authorization", `Bearer ${reservationClientToken}`)
          .send({
            carId: reservationCarId,
            startDate: fmt(tomorrow),
            endDate: fmt(dayAfter),
          });

        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "Reserva creada correctamente",
            data: expect.objectContaining({ carId: reservationCarId }),
          }),
        );

        reservationId = response.body.data._id;
      });

      it("Should fail without token", async () => {
        const response = await request(app)
          .post("/api/reservations/createReservation")
          .send({
            carId: reservationCarId,
            startDate: "2027-10-01",
            endDate: "2027-10-03",
          });
        expect(response.statusCode).toBe(403);
      });

      it("Should fail if required fields are missing", async () => {
        const response = await request(app)
          .post("/api/reservations/createReservation")
          .set("Authorization", `Bearer ${reservationClientToken}`)
          .send({ carId: reservationCarId });
        expect(response.statusCode).toBe(400);
      });

      it("Should fail if an admin tries to create a reservation", async () => {
        const response = await request(app)
          .post("/api/reservations/createReservation")
          .set("Authorization", `Bearer ${reservationAdminToken}`)
          .send({
            carId: reservationCarId,
            startDate: "2027-11-01",
            endDate: "2027-11-04",
          });
        expect(response.statusCode).toBe(403);
      });
    });

    describe("GET /api/reservations/listReservations", () => {
      it("Admin should get all reservations", async () => {
        const response = await request(app)
          .get("/api/reservations/listReservations")
          .set("Authorization", `Bearer ${reservationAdminToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it("Client should get only their own reservations", async () => {
        const response = await request(app)
          .get("/api/reservations/listReservations")
          .set("Authorization", `Bearer ${reservationClientToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it("Should fail without token", async () => {
        const response = await request(app).get(
          "/api/reservations/listReservations",
        );
        expect(response.statusCode).toBe(403);
      });
    });

    describe("PATCH /api/reservations/registerPayment/:id", () => {
      it("Admin should register payment for a reservation", async () => {
        const response = await request(app)
          .patch(`/api/reservations/registerPayment/${reservationId}`)
          .set("Authorization", `Bearer ${reservationAdminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({ message: "Pago registrado correctamente" }),
        );
      });

      it("Should fail if a client tries to register payment", async () => {
        const response = await request(app)
          .patch(`/api/reservations/registerPayment/${reservationId}`)
          .set("Authorization", `Bearer ${reservationClientToken}`);
        expect(response.statusCode).toBe(403);
      });

      it("Should fail without token", async () => {
        const response = await request(app).patch(
          `/api/reservations/registerPayment/${reservationId}`,
        );
        expect(response.statusCode).toBe(403);
      });
    });

    describe("PATCH /api/reservations/updateStatus/:id", () => {
      it("Admin should activate reservation after payment (Pendiente → Activa)", async () => {
        const response = await request(app)
          .patch(`/api/reservations/updateStatus/${reservationId}`)
          .set("Authorization", `Bearer ${reservationAdminToken}`)
          .send({ status: "Activa" });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "Estado de la reserva actualizado",
          }),
        );
      });

      it("Admin should complete reservation (Activa → Completada)", async () => {
        const response = await request(app)
          .patch(`/api/reservations/updateStatus/${reservationId}`)
          .set("Authorization", `Bearer ${reservationAdminToken}`)
          .send({ status: "Completada" });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "Estado de la reserva actualizado",
          }),
        );
      });

      it("Should fail if status is missing", async () => {
        const response = await request(app)
          .patch(`/api/reservations/updateStatus/${reservationId}`)
          .set("Authorization", `Bearer ${reservationAdminToken}`)
          .send({});
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(
          expect.objectContaining({ message: "El estado es requerido" }),
        );
      });

      it("Should fail if a client tries to update status", async () => {
        const response = await request(app)
          .patch(`/api/reservations/updateStatus/${reservationId}`)
          .set("Authorization", `Bearer ${reservationClientToken}`)
          .send({ status: "Cancelada" });
        expect(response.statusCode).toBe(403);
      });

      it("Should fail without token", async () => {
        const response = await request(app)
          .patch(`/api/reservations/updateStatus/${reservationId}`)
          .send({ status: "Activa" });
        expect(response.statusCode).toBe(403);
      });
    });

    describe("POST /api/reservations/createReview", () => {
      it("Client should create a review for a completed reservation", async () => {
        const reviewData = {
          reservationId,
          rating: 5,
          comment: "Excelente servicio, auto en perfectas condiciones",
        };

        const response = await request(app)
          .post("/api/reservations/createReview")
          .set("Authorization", `Bearer ${reservationClientToken}`)
          .send(reviewData);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({ message: "Reseña creada" }),
        );
      });

      it("Should fail if an admin tries to create a review", async () => {
        const response = await request(app)
          .post("/api/reservations/createReview")
          .set("Authorization", `Bearer ${reservationAdminToken}`)
          .send({ reservationId, rating: 4, comment: "Intento admin" });
        expect(response.statusCode).toBe(403);
      });

      it("Should fail without token", async () => {
        const response = await request(app)
          .post("/api/reservations/createReview")
          .send({ reservationId, rating: 3, comment: "Sin token" });
        expect(response.statusCode).toBe(403);
      });
    });

    describe("GET /api/reservations/reviews/:carId", () => {
      it("Should get reviews for a car with valid token", async () => {
        const response = await request(app)
          .get(`/api/reservations/reviews/${reservationCarId}`)
          .set("Authorization", `Bearer ${reservationClientToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it("Should also work with admin token", async () => {
        const response = await request(app)
          .get(`/api/reservations/reviews/${reservationCarId}`)
          .set("Authorization", `Bearer ${reservationAdminToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it("Should fail without token", async () => {
        const response = await request(app).get(
          `/api/reservations/reviews/${reservationCarId}`,
        );
        expect(response.statusCode).toBe(403);
      });
    });
  });
});
