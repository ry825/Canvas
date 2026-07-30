import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const STARTUP_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 100;
const BASE_URL = "http://127.0.0.1:4173";
const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");

function waitForExit(childProcess) {
  return new Promise((resolve, reject) => {
    childProcess.once("error", reject);
    childProcess.once("exit", (code) => {
      resolve(code ?? 1);
    });
  });
}

async function waitForServer() {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) {
        return;
      }
    } catch {
      // The server is expected to reject connections while it starts.
    }

    await new Promise((resolve) => {
      setTimeout(resolve, POLL_INTERVAL_MS);
    });
  }

  throw new Error(`E2E server did not become ready within ${STARTUP_TIMEOUT_MS}ms.`);
}

const serverProcess = spawn(process.execPath, [path.join(SCRIPT_DIRECTORY, "serveE2e.mjs")], {
  cwd: REPOSITORY_ROOT,
  stdio: ["ignore", "inherit", "inherit"],
});

try {
  await waitForServer();

  const playwrightProcess = spawn(
    process.execPath,
    [
      path.join(REPOSITORY_ROOT, "node_modules/@playwright/test/cli.js"),
      "test",
      ...process.argv.slice(2),
    ],
    {
      cwd: REPOSITORY_ROOT,
      stdio: "inherit",
    },
  );
  process.exitCode = await waitForExit(playwrightProcess);
} finally {
  if (!serverProcess.killed) {
    serverProcess.kill();
  }
}
