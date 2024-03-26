import databaseUtil from "tests/util/database.util";

beforeAll(databaseUtil.cleanDatabase);

test("POST to /api/v1/migrations should return 200", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  const response1Body = await response1.json();

  const numMigrationsRan1 = await databaseUtil.numMigrationsRan();

  expect(response1.status).toBe(201);
  expect(Array.isArray(response1Body)).toBe(true);
  expect(response1Body.length).toBeGreaterThan(0);
  expect(numMigrationsRan1).toBeGreaterThan(0);
  expect(numMigrationsRan1).toEqual(response1Body.length);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  const response2Body = await response2.json();

  const numMigrationsRan2 = await databaseUtil.numMigrationsRan();

  expect(response2.status).toBe(200);
  expect(Array.isArray(response2Body)).toBe(true);
  expect(response2Body.length).toBe(0);
  expect(numMigrationsRan2 - numMigrationsRan1).toEqual(response2Body.length);
});
