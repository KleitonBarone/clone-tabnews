import { describe } from "node:test";
import webserver from "infra/webserver";
import password from "models/password";
import user from "models/user";
import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique `username`", async () => {
      await orchestrator.createUser({
        username: "uniqueUser1",
      });

      const response = await fetch(
        `${webserver.origin}/api/v1/users/uniqueUser1`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: 'Verifique se o seu usuário possui a feature "update:user"',
        message: "Você não possui permissão para realizar esta ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With nonexisting `username`", async () => {
      const createdUser = await orchestrator.createUserAndActivate();
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/UsuarioInexistente`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "UsuarioInexistente",
            email: "usuario.inexistente@example.com",
            password: "senha123",
          }),
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated `username`", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      const user2 = await orchestrator.createUserAndActivate({
        username: "user2",
      });
      const user2Session = await orchestrator.createSession(user2.id);

      const response = await fetch(`${webserver.origin}/api/v1/users/user2`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${user2Session.token}`,
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With `userB` targeting `userA`", async () => {
      await orchestrator.createUser({
        username: "userA",
      });

      const userB = await orchestrator.createUserAndActivate({
        username: "userB",
      });
      const userBSession = await orchestrator.createSession(userB.id);

      const response = await fetch(`${webserver.origin}/api/v1/users/userA`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${userBSession.token}`,
        },
        body: JSON.stringify({
          username: "userC",
        }),
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action:
          "Verifique se você possui a feature necessária para atualizar outro usuário.",
        message: "Você não possui permissão para atualizar outro usuário.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });

    test("With duplicated `email`", async () => {
      await orchestrator.createUserAndActivate({
        email: "email1@example.com",
      });

      const createdUser2 = await orchestrator.createUserAndActivate({
        email: "email2@example.com",
      });
      const user2Session = await orchestrator.createSession(createdUser2.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${user2Session.token}`,
          },
          body: JSON.stringify({
            email: "email1@example.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique `username`", async () => {
      const createdUser1 = await orchestrator.createUserAndActivate({
        username: "uniqueUser2",
      });

      const user1Session = await orchestrator.createSession(createdUser1.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/uniqueUser2`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${user1Session.token}`,
          },
          body: JSON.stringify({
            username: "uniqueUser3",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser3",
        features: [
          "create:session",
          "read:session",
          "update:user",
          "read:status",
        ],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique `email`", async () => {
      const createdUser1 = await orchestrator.createUserAndActivate({
        email: "uniqueEmail1@example.com",
      });

      const user1Session = await orchestrator.createSession(createdUser1.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${user1Session.token}`,
          },
          body: JSON.stringify({
            email: "uniqueEmail2@example.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser1.username,
        features: [
          "create:session",
          "read:session",
          "update:user",
          "read:status",
        ],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(
        createdUser1.username,
      );

      expect(userInDatabase.email).toBe("uniqueEmail2@example.com");
    });

    test("With new `password`", async () => {
      const createdUser1 = await orchestrator.createUserAndActivate({
        password: "newPassword1",
      });

      const user1Session = await orchestrator.createSession(createdUser1.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${user1Session.token}`,
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser1.username,
        features: [
          "create:session",
          "read:session",
          "update:user",
          "read:status",
        ],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      const userInDatabase = await user.findOneByUsername(
        createdUser1.username,
      );
      const correctPasswordCompare = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );
      const incorrectPasswordCompare = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );

      expect(correctPasswordCompare).toBe(true);
      expect(incorrectPasswordCompare).toBe(false);
    });
  });

  describe("Privileged user", () => {
    test("With `update:user:others` targeting `defaultUser`", async () => {
      const defaultUser = await orchestrator.createUser();

      const privilegedUser = await orchestrator.createUserAndActivate();
      await orchestrator.addFeaturesToUser(privilegedUser, [
        "update:user:others",
      ]);
      const privilegedUserSession = await orchestrator.createSession(
        privilegedUser.id,
      );

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${defaultUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${privilegedUserSession.token}`,
          },
          body: JSON.stringify({
            username: "defaultUserChangedByPrivileged",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: defaultUser.id,
        username: "defaultUserChangedByPrivileged",
        features: defaultUser.features,
        created_at: defaultUser.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
});
