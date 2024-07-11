import database from "infra/database";

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function numMigrationsRan() {
  const queryResult = await database.query(
    "SELECT COUNT(*) FROM public.pgmigrations;",
  );
  return parseInt(queryResult.rows[0].count, 10);
}

const databaseUtil = {
  cleanDatabase: cleanDatabase,
  numMigrationsRan: numMigrationsRan,
};

export default databaseUtil;
