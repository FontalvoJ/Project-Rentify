import request from "supertest";
import app from "../../src/app.js";
import mongoose from "mongoose";
import { connectDB } from "../../src/database.js";
import { initializeDefaults } from "../../src/libs/initialSetup.js";
import System from "../../src/models/Systems.js";
import CompanionType from "../../src/models/Companions.js";

let adminToken;
let clientToken;
let system;
let companion;

beforeAll(async () => {
  await connectDB();
  await initializeDefaults();

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

  // Crear documentos referenciales para autos
  system = await System.create({ type: "Gasolina" });
  companion = await CompanionType.create({ amount: 4 });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Pruebas sobre API Rentify", () => {
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
        })
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

      expect(response.body).toEqual(
        expect.objectContaining({
          token: expect.any(String),
          role: "client",
          name: "Mabel",
        })
      );
    });
  });

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
        })
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
        })
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
        expect.objectContaining({
          message: "Cuenta eliminada correctamente",
        })
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

  describe("POST /api/cars/createCar", () => {
    it("Should create a new car successfully", async () => {
      const carData = {
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
      };

      const response = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(carData);

      expect(response.statusCode).toBe(201);
      expect(response.headers["content-type"]).toContain("application/json");

      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Car creado exitosamente",
          data: expect.objectContaining({
            brand: carData.brand,
            model: carData.model,
            year: carData.year,
            color: carData.color,
            pricePerDay: carData.pricePerDay,
            location: carData.location,
            power: carData.power,
            imageUrl: carData.imageUrl,
          }),
        })
      );
    });

    it("Should fail without token", async () => {
      const response = await request(app).post("/api/cars/createCar").send({
        brand: "Toyota",
        model: "Corolla",
        year: 2023,
        color: "White",
        pricePerDay: 45,
        location: "Bogotá",
        power: 1300,
        imageUrl: "https://example.com/car.png",
        systemId: system._id.toString(),
        companionTypeId: companion._id.toString(),
      });

      expect(response.statusCode).toBe(403);
    });

    it("Should fail if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          model: "MissingBrand",
          year: 2023,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Faltan campos de automóvil obligatorios",
        })
      );
    });
  });

  describe("GET /api/cars/listCarsAdminClient", () => {
    let localAdminToken;
    let localClientToken;
    let createdCarId;

    beforeAll(async () => {
      const adminData = {
        name: "AdminGetTest",
        email: `adminget+${Date.now()}@example.com`,
        password: "StrongPass123!",
      };

      const adminSignUp = await request(app)
        .post("/api/auth/signUpAdmin")
        .send(adminData);

      expect(adminSignUp.statusCode).toBe(201);
      localAdminToken = adminSignUp.body.token;

      const clientData = {
        name: "ClientGetTest",
        email: `clientget+${Date.now()}@example.com`,
        password: "123456",
        identification: "123456789",
        address: "Calle Test 123",
        contact: "3111111111",
      };

      const clientSignUp = await request(app)
        .post("/api/auth/signUpClient")
        .send(clientData);

      expect(clientSignUp.statusCode).toBe(201);
      localClientToken = clientSignUp.body.token;

      const carData = {
        brand: "Ford",
        model: "Fiesta",
        year: 2024,
        color: "Blue",
        pricePerDay: 60,
        location: "Bogotá",
        power: 1400,
        imageUrl: "https://example.com/car.png",
        systemId: system._id.toString(),
        companionTypeId: companion._id.toString(),
      };

      const createCar = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${localAdminToken}`)
        .send(carData);

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
        expect(car.isAvailable).toBe(true);
      });
    });

    it("Should fail without token", async () => {
      const response = await request(app).get("/api/cars/listCarsAdminClient");

      expect(response.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/cars/DeleteCar/:id", () => {
    let deleteAdminToken;
    let createdCarId;

    beforeAll(async () => {
      const adminData = {
        name: "AdminDeleteTest",
        email: `admindelete+${Date.now()}@example.com`,
        password: "StrongPass123!",
      };

      const signUpResponse = await request(app)
        .post("/api/auth/signUpAdmin")
        .send(adminData);

      expect(signUpResponse.statusCode).toBe(201);
      deleteAdminToken = signUpResponse.body.token;

      const carData = {
        brand: "Toyota",
        model: "Corolla",
        year: 2024,
        color: "White",
        pricePerDay: 50,
        location: "Medellín",
        power: 1200,
        imageUrl: "https://example.com/car.png",
        systemId: system._id.toString(),
        companionTypeId: companion._id.toString(),
      };

      const createCarResponse = await request(app)
        .post("/api/cars/createCar")
        .set("Authorization", `Bearer ${deleteAdminToken}`)
        .send(carData);

      expect(createCarResponse.statusCode).toBe(201);
      createdCarId = createCarResponse.body.data._id;
    });

    it("Should delete car successfully", async () => {
      const response = await request(app)
        .delete(`/api/cars/DeleteCar/${createdCarId}`)
        .set("Authorization", `Bearer ${deleteAdminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Auto eliminado correctamente",
        })
      );

      const getResponse = await request(app)
        .get("/api/cars/listCarsAdminClient")
        .set("Authorization", `Bearer ${deleteAdminToken}`);

      const carIds = getResponse.body.data.map((c) => c._id);
      expect(carIds).not.toContain(createdCarId);
    });

    it("Should fail without token", async () => {
      const response = await request(app).delete(
        `/api/cars/DeleteCar/${createdCarId}`
      );
      expect(response.statusCode).toBe(403);
    });
  });
});
