import retry from "async-retry";

import database from "infra/database";
import migrator from "models/migrator";

function waitForWebServer() {
  async function fetchStatusPage() {
    const result = await fetch("http://localhost:3000/api/v1/status");
    if (result.status !== 200) {
      throw new Error("Web server is not running");
    }
  }

  return retry(fetchStatusPage, {
    retries: 100,
    maxTimeout: 1000,
  });
}

async function waitForAllServices() {
  await waitForWebServer();
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function numMigrationsRan() {
  const queryResult = await database.query(
    "SELECT COUNT(*) FROM public.pgmigrations;",
  );
  return parseInt(queryResult.rows[0].count, 10);
}

const orchestrator = {
  waitForAllServices: waitForAllServices,
  clearDatabase: clearDatabase,
  numMigrationsRan: numMigrationsRan,
  runPendingMigrations: runPendingMigrations,
};
export default orchestrator;
