import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: '"Clone Tabnews" <contato@clone-tabnews.com>',
      to: "test@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    });

    await email.send({
      from: '"Clone Tabnews" <contato@clone-tabnews.com>',
      to: "test@example.com",
      subject: "Last email sent",
      text: "This is the last email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@clone-tabnews.com>");
    expect(lastEmail.recipients[0]).toBe("<test@example.com>");
    expect(lastEmail.subject).toBe("Last email sent");
    expect(lastEmail.text).toBe("This is the last email.\n");
  });
});
