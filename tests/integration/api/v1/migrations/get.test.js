import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`);

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para realizar esta ação.",
        action: 'Verifique se o seu usuário possui a feature "read:migration"',
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("Retrieving pending migrations", async () => {
      const defaultUser = await orchestrator.createUserAndActivate();
      const defaultUserSession = await orchestrator.createSession(
        defaultUser.id,
      );

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${defaultUserSession.token}`,
        },
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para realizar esta ação.",
        action: 'Verifique se o seu usuário possui a feature "read:migration"',
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("Retrieving pending migrations", async () => {
      const privilegedUser = await orchestrator.createUserAndActivate();
      await orchestrator.addFeaturesToUser(privilegedUser, ["read:migration"]);
      const privilegedUserSession = await orchestrator.createSession(
        privilegedUser.id,
      );

      const response1 = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${privilegedUserSession.token}`,
        },
      });

      const response1Body = await response1.json();

      expect(response1.status).toBe(200);
      expect(Array.isArray(response1Body)).toBe(true);

      const response2 = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${privilegedUserSession.token}`,
        },
      });

      const response2Body = await response2.json();

      expect(response2.status).toBe(200);
      expect(Array.isArray(response2Body)).toBe(true);
      expect(response2Body.length).toBe(response1Body.length);
    });
  });
});
