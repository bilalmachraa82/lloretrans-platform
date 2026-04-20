/**
 * Reset completo: drizzle-kit push (aplica schema mais recente) + seed.
 * Idempotente — seguro correr várias vezes contra Neon.
 */
import { spawn } from "node:child_process";

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: true });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function main() {
  await run("npx", ["drizzle-kit", "push", "--force"]);
  await run("npx", ["tsx", "scripts/seed.ts"]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
