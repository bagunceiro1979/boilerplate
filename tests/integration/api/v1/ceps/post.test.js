import orchestrator from "tests/orchestrator.js";
import database from "infra/database.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});
describe("POST /api/v1/cep", () => {
  describe("Anonymous user", () => {
    test("Valid and Contemplated ZIP code", async () => {
      const teste = await database.query(
        "UPDATE streets_where_we_deliver SET contemplated = true WHERE CEP = '32497-276';",
      );
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

    test("Under review ZIP code", async () => {
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
        message: "Não realizamos entregas no CEP informado.",
        action:
          "No momento realizamos apenas em alguns bairros do município de Brumadinho em MG.",
        status_code: 404,
      });
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
        message: "Não realizamos entregas no CEP informado.",
        action:
          "No momento realizamos apenas em alguns bairros do município de Brumadinho em MG.",
        status_code: 404,
      });
    });
  });
});
