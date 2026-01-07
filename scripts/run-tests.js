import { spawn } from 'node:child_process';

const incomingArgs = process.argv.slice(2);
const singleThreadFlags = new Set(['--runInBand', '-i']);

const normalizedArgs = [];
let requestSingleThread = false;

for (const arg of incomingArgs) {
  if (singleThreadFlags.has(arg)) {
    requestSingleThread = true;
    continue;
  }
  normalizedArgs.push(arg);
}

if (requestSingleThread) {
  normalizedArgs.push('--pool=threads', '--poolOptions.threads.singleThread=true');
}

const vitest = spawn('npx', ['vitest', ...normalizedArgs], {
  stdio: 'inherit',
  shell: false,
});

vitest.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
