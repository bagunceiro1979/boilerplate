import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";

const defaultMigrationsOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function lintPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
    });
    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
      dryRun: false,
    });
    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  lintPendingMigrations,
  runPendingMigrations,
};

export default migrator;
