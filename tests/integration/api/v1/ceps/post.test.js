import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});
describe("POST /api/v1/cep", () => {
  describe("Anonymous user", () => {
    test("Valid ZIP code", async () => {
      const response = await fetch("http://localhost:3000/api/v1/cep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cep: "32497-276",
        }),
      });
      expect(response.status).toBe(200);
    });

    test("Invalid ZIP code", async () => {
      const response = await fetch("http://localhost:3000/api/v1/cep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cep: "32497-000",
        }),
      });
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message:
          "O Cep informado ainda não contemplado com nosso serviço de entrega.",
        action: "Obrigado pela atenção!",
        status_code: 404,
      });
    });
  });
});
