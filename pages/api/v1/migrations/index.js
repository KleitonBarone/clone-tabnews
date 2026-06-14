import controller from "infra/controller";
import authorization from "models/authorization";
import migrator from "models/migrator";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:migration"), getHandler);
router.post(controller.canRequest("create:migration"), postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userRequesting = request.context.user;
  const pendingMigrations = await migrator.listPendingMigrations();

  const secureOutputValues = authorization.filterOutput(
    userRequesting,
    "read:migration",
    pendingMigrations,
  );

  return response.status(200).send(secureOutputValues);
}

async function postHandler(request, response) {
  const userRequesting = request.context.user;
  const migratedMigrations = await migrator.runPendingMigrations();

  const secureOutputValues = authorization.filterOutput(
    userRequesting,
    "read:migration",
    migratedMigrations,
  );

  if (migratedMigrations.length > 0) {
    return response.status(201).send(secureOutputValues);
  }

  return response.status(200).send(secureOutputValues);
}
