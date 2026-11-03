import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const directories = ['apis', 'config', 'controllers', 'models', 'routes', 'scripts', 'tests'];

function* sourceFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const location = join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* sourceFiles(location);
    } else if (entry.isFile() && /\.(c|m)?js$/.test(entry.name)) {
      yield location;
    }
  }
}

for (const file of ['index.js', 'swagger.js', ...directories.flatMap(dir => [...sourceFiles(dir)])]) {
  const check = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (check.status !== 0) process.exit(check.status || 1);
}
