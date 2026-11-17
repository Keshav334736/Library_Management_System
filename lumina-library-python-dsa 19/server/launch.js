// One-click launcher: installs dependencies if needed, starts the backend
// (which also serves the frontend) and opens the website in the browser.
const { spawn, spawnSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
// Read PORT from .env if present (the server does the same), default 4000
try {
  const envFile = path.join(root, '.env');
  if (fs.existsSync(envFile)) {
    fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m || line.trim().startsWith('#')) return;
      if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    });
  }
} catch (_) {}
const PORT = process.env.PORT || 4000;
const URL = `http://localhost:${PORT}/`;
const isWin = process.platform === 'win32';

process.chdir(root);

// 1. Install dependencies on first run (sqlite3 needs a build for this OS/Node)
if (!fs.existsSync(path.join(root, 'node_modules', 'express')) ||
    !fs.existsSync(path.join(root, 'node_modules', 'sqlite3'))) {
  console.log('\n[Lumina] First run: installing dependencies (needs internet, ~1 minute)...\n');
  const r = spawnSync(isWin ? 'npm.cmd' : 'npm', ['install', '--no-audit', '--no-fund'], { stdio: 'inherit', shell: isWin });
  if (r.status !== 0) {
    console.error('\n[Lumina] npm install failed. Check your internet connection and try again.');
    process.exit(1);
  }
}

// 2. Start the backend (serves API + frontend on one port)
console.log('\n[Lumina] Starting server...\n');
const server = spawn(process.execPath, [path.join(__dirname, 'server-complete.js')], { stdio: 'inherit', env: process.env });
server.on('exit', (code) => process.exit(code || 0));
['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => { server.kill(); process.exit(0); }));

// 3. Open the browser once the server answers
function openBrowser() {
  const cmd = isWin ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = isWin ? ['/c', 'start', '', URL] : [URL];
  try { spawn(cmd, args, { stdio: 'ignore', detached: true }).unref(); } catch (_) {}
}

let tries = 0;
const timer = setInterval(() => {
  tries++;
  http.get(`${URL}api/health`, (res) => {
    res.resume();
    if (res.statusCode === 200) {
      clearInterval(timer);
      console.log(`\n[Lumina] Website is ready: ${URL}   (close this window to stop it)\n`);
      openBrowser();
    }
  }).on('error', () => {});
  if (tries > 60) clearInterval(timer);
}, 500);
