import databaseUtil from "tests/util/database.util";

beforeAll(databaseUtil.cleanDatabase);

test("POST to /api/v1/migrations should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  const responseBody = await response.json();

  const numMigrationsRan = await databaseUtil.numMigrationsRan();

  expect(response.status).toBe(200);
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
  expect(numMigrationsRan).toBeGreaterThan(0);
  expect(numMigrationsRan).toEqual(responseBody.length);
});
