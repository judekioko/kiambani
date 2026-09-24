import path from "node:path";
import fs from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const databaseDir = path.join(__dirname, "..", ".pgdata");
const port = 5432;
const user = "postgres";
const password = "jj7B91vCrSK12D2C";

const pg = new EmbeddedPostgres({
  databaseDir,
  port,
  user,
  password,
  persistent: true,
});

async function main() {
  const alreadyInitialised = fs.existsSync(path.join(databaseDir, "PG_VERSION"));
  if (!alreadyInitialised) {
    console.log("Initialising Postgres data directory...");
    await pg.initialise();
  }

  console.log("Starting Postgres...");
  await pg.start();

  try {
    await pg.createDatabase("kiambani");
    console.log('Created database "kiambani"');
  } catch {
    console.log('Database "kiambani" already exists');
  }

  console.log(`Postgres is ready on postgresql://${user}:${password}@localhost:${port}/kiambani`);
  console.log("Press Ctrl+C to stop.");

  const shutdown = async () => {
    console.log("Stopping Postgres...");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
