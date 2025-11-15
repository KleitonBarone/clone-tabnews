import controller from "infra/controller";
import database from "infra/database";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(_request, response) {
  const updatedAt = new Date().toISOString();
  const postgresVersion = await database.query("SHOW server_version;");
  const maxDatabaseConnections = await database.query("SHOW max_connections;");
  const databaseName = process.env.POSTGRES_DB;
  const currentDatabaseConnections = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  return response.status(200).send({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: postgresVersion.rows[0].server_version,
        max_connections: parseInt(
          maxDatabaseConnections.rows[0].max_connections,
          10,
        ),
        opened_connections: currentDatabaseConnections.rows[0].count,
      },
    },
  });
}
