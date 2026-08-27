import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller.js";

const router = createRouter();

router.get(getHanbler);

export default router.handler(controller.errorHandlers);

async function getHanbler(request, response) {
  const updateAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenConnetionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1",
    values: [databaseName],
  });
  const databaseOpenConnetionsValue =
    databaseOpenConnetionsResult.rows[0].count;
  response.status(200).json({
    updated_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpenConnetionsValue,
      },
    },
  });
}
