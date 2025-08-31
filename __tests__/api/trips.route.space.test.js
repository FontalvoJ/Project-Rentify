// __tests__/api/trips.route.space.test.js
import request from "supertest";
import app from "../../src/app.js";
import mongoose from "mongoose";
import { connectDB } from "../../src/database.js";
import { initializeDefaults } from "../../src/libs/initialSetup.js";

beforeAll(async () => {
  await connectDB();
  await initializeDefaults();
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
      // 1. Registrar cliente de prueba
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

      // 2. Usar token para obtener datos
      const response = await request(app)
        .get("/api/client/clientGetData")
        .set("Authorization", `Bearer ${token}`);

      // 3. Validar respuesta
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");

      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Información del cliente obtenida correctamente",
          client: expect.objectContaining({
            identification: clientData.identification,
            address: clientData.address,
            contact: clientData.contact,
          }),
          user: expect.objectContaining({
            name: clientData.name,
            email: clientData.email,
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
      // 1. Registrar cliente
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

      // 2. Datos de actualización
      const updatedData = {
        name: "Ana Actualizada",
        email: `ana.actualizada+${Date.now()}@example.com`,
        address: "Nueva dirección 789",
        contact: "3001112233",
        password: "NuevaClave123!",
      };

      // 3. Llamada al endpoint con token
      const response = await request(app)
        .put("/api/client/clientUpdate")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedData);

      // 4. Validaciones
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");

      expect(response.body).toEqual(
        expect.objectContaining({
          message: "Cuenta actualizada correctamente",
          client: expect.objectContaining({
            address: updatedData.address,
            contact: updatedData.contact,
          }),
          user: expect.objectContaining({
            name: updatedData.name,
            email: updatedData.email,
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
});
