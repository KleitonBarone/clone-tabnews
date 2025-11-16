import webserver from "infra/webserver";
import activation from "models/activation";
import user from "models/user";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration flow (all successful)", () => {
  let createUserResponseBody = {};
  let activationToken = null;
  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "RegistrationFlow@example.com",
          password: "senha123",
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: "RegistrationFlow@example.com",
      features: ["read:activation_token"],
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    const activationIdInEmail = orchestrator.extractUUID(lastEmail.text);

    expect(activationIdInEmail).toBeTruthy();
    activationToken = await activation.findOneValidById(activationIdInEmail);

    expect(activationToken.user_id).toBe(createUserResponseBody.id);
    expect(activationToken.used_at).toBeNull();

    expect(lastEmail.text).toContain(
      `${webserver.origin}/cadastro/ativar/${activationToken.id}`,
    );
    expect(lastEmail.sender).toBe("<contato@exemplo.com>");
    expect(lastEmail.recipients).toEqual(["<RegistrationFlow@example.com>"]);
    expect(lastEmail.subject).toBe("Ative seu cadastro no TabNews!");
    expect(lastEmail.text).toContain("RegistrationFlow");
  });

  test("Activate account", async () => {
    const activateResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationToken.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    expect(activateResponse.status).toBe(200);

    const activateResponseBody = await activateResponse.json();

    expect(activateResponseBody.used_at).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("RegistrationFlow");

    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("Login", async () => {});

  test("Get user information", async () => {});
});
