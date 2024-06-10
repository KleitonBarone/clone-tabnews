import databaseUtil from "tests/util/database.util";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await databaseUtil.cleanDatabase();
});

test("GET to /api/v1/migrations should return 200", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations");

  const response1Body = await response1.json();

  expect(response1.status).toBe(200);
  expect(Array.isArray(response1Body)).toBe(true);
  expect(response1Body.length).toBeGreaterThan(0);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations");

  const response2Body = await response2.json();

  expect(response2.status).toBe(200);
  expect(Array.isArray(response2Body)).toBe(true);
  expect(response2Body.length).toBeGreaterThan(0);
  expect(response2Body.length).toBe(response1Body.length);
});
