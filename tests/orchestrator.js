import retry from "async-retry";

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

async function waitForAllServices() {
  await waitForWebServer();
}

export default {
  waitForAllServices: waitForAllServices,
};
