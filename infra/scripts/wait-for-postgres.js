const { exec } = require("node:child_process");

function checkPostgresStatus(currentRetry = 1) {
  exec(
    "docker exec clone-tabnews-postgres-dev pg_isready --host localhost",
    (_, stdout) => {
      const isPostgresDown = !stdout.includes("accepting connections");

      if (process.stdout.isTTY) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
      }

      if (isPostgresDown) {
        process.stdout.write(
          `🔴 Aguardando Postgres aceitar conexões. Tentativa número ${currentRetry}...`,
        );
        setTimeout(() => {
          checkPostgresStatus(++currentRetry);
        }, 1000);
        return;
      }

      console.log("✅ Postgres está aceitando conexões!");
      return;
    },
  );
}

checkPostgresStatus();
