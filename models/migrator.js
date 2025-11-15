import { resolve } from "node:path";
import database from "infra/database";
import migrationsRunner from "node-pg-migrate";

const defaultMigrationOptionsFactory = ({ dbClient, dryRun }) => {
  return {
    dbClient: dbClient,
    dryRun: dryRun,
    dir: resolve("infra", "migrations"),
    direction: "up",
    log: () => {},
    migrationsTable: "pgmigrations",
  };
};

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = defaultMigrationOptionsFactory({
      dbClient,
      dryRun: true,
    });

    return await migrationsRunner(defaultMigrationOptions);
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = defaultMigrationOptionsFactory({
      dbClient,
      dryRun: false,
    });

    return await migrationsRunner(defaultMigrationOptions);
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
