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
});
