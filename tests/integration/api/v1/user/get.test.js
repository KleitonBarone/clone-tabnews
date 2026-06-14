import webserver from "infra/webserver";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Anonymous user", () => {
    test("Without session", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        method: "GET",
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para realizar esta ação.",
        action: 'Verifique se o seu usuário possui a feature "read:session"',
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With valid session", async () => {
      const createUser = await orchestrator.createUserAndActivate({
        username: "UserWithValidSession",
      });

      const sessionObject = await orchestrator.createSession(createUser);

      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        method: "GET",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createUser.id,
        username: "UserWithValidSession",
        email: createUser.email,
        features: [
          "create:session",
          "read:session",
          "update:user",
          "read:status",
        ],
        created_at: createUser.created_at.toISOString(),
        updated_at: createUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewedSessionObject.expires_at > sessionObject.expires_at).toBe(
        true,
      );
      expect(renewedSessionObject.updated_at > sessionObject.updated_at).toBe(
        true,
      );

      // Set cookies assertions
      const parsedSetCookie = setCookieParser.parse(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      });
    });

    test("With halfway-expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS / 2),
      });

      const createdUser = await orchestrator.createUserAndActivate({
        username: "UserWithHalfwayExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser);

      jest.useRealTimers();

      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        headers: {
          cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithHalfwayExpiredSession",
        email: createdUser.email,
        features: [
          "create:session",
          "read:session",
          "update:user",
          "read:status",
        ],
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      // Set‑Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      });
    });

    test("With nonexistent token", async () => {
      const nonexistentToken =
        "90kb3a11c8079f73a3c010f0ac852822a9a2b8c5cb89f295322a0b283ad4324eb9fc3127f1be0c6fd6c1f11d6d43717c";

      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        method: "GET",
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(
          Date.now() - session.EXPIRATION_IN_MILLISECONDS - 60000, // 1 minute buffer
        ),
      });

      const createUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createUser);

      jest.useRealTimers();

      const response = await fetch(`${webserver.origin}/api/v1/user`, {
        method: "GET",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });
    });
  });
});
