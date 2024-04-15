import database from "infra/database";
import migrationsRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
  if (request.method !== "GET" && request.method !== "POST") {
    return response.status(405).end();
  }
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const pendingMigrations = await migrationsRunner(defaultMigrationOptions);
    await dbClient.end();
    return response.status(200).send(pendingMigrations);
  }

  const migratedMigrations = await migrationsRunner({
    ...defaultMigrationOptions,
    dryRun: false,
  });
  await dbClient.end();
  if (migratedMigrations.length > 0) {
    return response.status(201).send(migratedMigrations);
  }

  return response.status(200).send(migratedMigrations);
}
