import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";
import session from "models/session";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

function waitForWebServer() {
  async function fetchStatusPage() {
    const result = await fetch("http://localhost:3000/api/v1/status");
    if (result.status !== 200) {
      throw new Error("Web server is not running");
    }
  }

  return retry(fetchStatusPage, {
    retries: 100,
    maxTimeout: 1000,
  });
}

function waitForEmailServer() {
  async function fetchEmailPage() {
    const result = await fetch(`${emailHttpUrl}`);
    if (result.status !== 200) {
      throw new Error("Email server is not running");
    }
  }

  return retry(fetchEmailPage, {
    retries: 100,
    maxTimeout: 1000,
  });
}

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject = {}) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "senha123",
  });
}

async function numMigrationsRan() {
  const queryResult = await database.query(
    "SELECT COUNT(*) FROM public.pgmigrations;",
  );
  return parseInt(queryResult.rows[0].count, 10);
}

async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailsResponse = await fetch(`${emailHttpUrl}/messages`);
  const emails = await emailsResponse.json();
  const lastEmail = emails[emails.length - 1];
  const lastEmailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmail.id}.plain`,
  );
  const lastEmailText = await lastEmailTextResponse.text();
  return {
    ...lastEmail,
    text: lastEmailText,
  };
}

const orchestrator = {
  waitForAllServices: waitForAllServices,
  clearDatabase: clearDatabase,
  deleteAllEmails: deleteAllEmails,
  getLastEmail: getLastEmail,
  numMigrationsRan: numMigrationsRan,
  runPendingMigrations: runPendingMigrations,
  createUser: createUser,
  createSession: createSession,
};
export default orchestrator;
