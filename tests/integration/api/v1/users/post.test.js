import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import users from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Bruno",
          email: "bruno@email.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "Bruno",
        email: "bruno@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await users.findOneByUsername("Bruno");
      const correctPasswordMatch = await password.compare(
        "senha123" + process.env.PEPPER,
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "SenhaErrada" + process.env.PEPPER,
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicate 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicado1",
          email: "duplicado@email.com",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201);
      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicado2",
          email: "Duplicado@email.com",
          password: "senha123",
        }),
      });

      const response2Body = await response2.json();
      expect(response2.status).toBe(400);
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O Email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicate 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username1",
          email: "username1@email.com",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username1",
          email: "username2@email.com",
          password: "senha123",
        }),
      });

      const response2Body = await response2.json();
      expect(response2.status).toBe(400);
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O apelido informado já está sendo utilizado.",
        action: "Utilize outro apelido para realizar esta operação.",
        status_code: 400,
      });
    });
  });
});
