import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "public", "exercises");
const directories = readdirSync(root)
  .map((name) => join(root, name))
  .filter((directory) => statSync(directory).isDirectory());

const convert = (directory) => new Promise((resolve, reject) => {
  const input = join(directory, "audio.mp3");
  const output = join(directory, "audio.m4a");
  if (!existsSync(input)) return resolve();
  const temporary = `${output}.new.m4a`;
  const process = spawn("/usr/bin/afconvert", [
    input,
    temporary,
    "-f", "m4af",
    "-d", "aac",
    "-b", "48000",
  ], { stdio: "ignore" });
  process.on("exit", (code) => {
    if (code !== 0) return reject(new Error(`afconvert failed for ${directory}`));
    renameSync(temporary, output);
    rmSync(input);
    const htmlPath = join(directory, "index.html");
    writeFileSync(htmlPath, readFileSync(htmlPath, "utf8").replaceAll("audio.mp3", "audio.m4a"));
    resolve();
  });
});

let next = 0;
const workers = Array.from({ length: 5 }, async () => {
  while (next < directories.length) {
    const index = next++;
    await convert(directories[index]);
    process.stdout.write(".");
  }
});

await Promise.all(workers);
process.stdout.write(`\nOptimized ${directories.length} exercise audio files.\n`);
