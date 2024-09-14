import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

beforeAll(orchestrator.clearDatabase);

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const response1 = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );

        const response1Body = await response1.json();

        const numMigrationsRan1 = await orchestrator.numMigrationsRan();

        expect(response1.status).toBe(201);
        expect(Array.isArray(response1Body)).toBe(true);
        expect(response1Body.length).toBeGreaterThan(0);
        expect(numMigrationsRan1).toBeGreaterThan(0);
        expect(numMigrationsRan1).toEqual(response1Body.length);
      });

      test("For the second time", async () => {
        const response2 = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );

        const response2Body = await response2.json();

        const numMigrationsRan2 = await orchestrator.numMigrationsRan();

        expect(response2.status).toBe(200);
        expect(Array.isArray(response2Body)).toBe(true);
        expect(response2Body.length).toBe(0);
        expect(numMigrationsRan2).toBeGreaterThan(0);
      });
    });
  });
});
