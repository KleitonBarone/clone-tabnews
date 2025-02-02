import { createRouter } from "next-connect";
import database from "infra/database";
import migrationsRunner from "node-pg-migrate";
import { resolve } from "node:path";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptionsFactory = (dbClient, dryRun) => {
  return {
    dbClient: dbClient,
    dryRun: dryRun,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
};

async function getHandler(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = defaultMigrationOptionsFactory(
    dbClient,
    true,
  );
  let pendingMigrations;
  try {
    pendingMigrations = await migrationsRunner(defaultMigrationOptions);
  } finally {
    await dbClient.end();
  }
  return response.status(200).send(pendingMigrations);
}

async function postHandler(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = defaultMigrationOptionsFactory(
    dbClient,
    false,
  );
  let migratedMigrations;
  try {
    migratedMigrations = await migrationsRunner(defaultMigrationOptions);
  } finally {
    await dbClient.end();
  }

  if (migratedMigrations.length > 0) {
    return response.status(201).send(migratedMigrations);
  }

  return response.status(200).send(migratedMigrations);
}
