import retry from "async-retry";

function waitForWebServer() {
  async function fetchStatusPage() {
    await fetch("http://localhost:3000/api/v1/status");
  }

  return retry(fetchStatusPage, {
    retries: 100,
    maxTimeout: 1000,
  });
}

async function waitForAllServices() {
  await waitForWebServer();
}

export default {
  waitForAllServices: waitForAllServices,
};
