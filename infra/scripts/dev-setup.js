const { spawn } = require("cross-spawn");

function runCommand(command, args, options = {}) {
  // eslint-disable-next-line no-undef
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: "inherit", ...options });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on("error", (error) => {
      reject(error);
    });
  });
}

async function startServices() {
  // Start services
  await runCommand("npm", ["run", "services:up"]);

  // Wait for the database to be ready
  await runCommand("npm", ["run", "services:wait:database"]);

  // Run migrations
  await runCommand("npm", ["run", "migrations:up"]);

  // Start the Next.js server
  const nextjs = runCommand("next", ["dev"]);

  // Handle cleanup on interrupt (Ctrl+C)
  process.on("SIGINT", async () => {
    console.log("\n\n🔴 Parando Serviços...");

    // Stop services
    await runCommand("npm", ["run", "services:stop"]);

    // Wait for the Next.js process to exit
    await nextjs;

    console.log("\n✅ Serviços parados!");
  });
}

startServices();
