// Hand-in program for the Aurelia national statistics site.
// Copies app/ and screenshots/ from this repository into the output
// directory (MAKEFUN_OUTPUT_DIR, default /output), writes dossier.json
// with buildDossier from vendor/makefun-frontend.ts, then runs a
// self-checking gate over everything it wrote. Node 22, stdlib only.
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO = resolve(import.meta.dirname);
const OUT = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

function fail(message) {
  throw new Error('main.ts gate failed: ' + message);
}

function listFiles(dir, base) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const rel = base ? base + '/' + name : name;
    const st = lstatSync(p);
    if (st.isDirectory()) out.push(...listFiles(p, rel));
    else out.push(rel);
  }
  return out.sort();
}

function main() {
  const appSrc = join(REPO, 'app');
  const shotsSrc = join(REPO, 'screenshots');
  if (!existsSync(appSrc) || !lstatSync(appSrc).isDirectory()) fail('app/ missing in repository');
  if (!existsSync(shotsSrc) || !lstatSync(shotsSrc).isDirectory()) fail('screenshots/ missing in repository');

  mkdirSync(OUT, { recursive: true });
  cpSync(appSrc, join(OUT, 'app'), { recursive: true });
  cpSync(shotsSrc, join(OUT, 'screenshots'), { recursive: true });

  const dossier = buildDossier(OUT, DOSSIER_CAPS);
  writeFileSync(join(OUT, 'dossier.json'), dossier);

  // ---- self-checking gate ----
  const outApp = join(OUT, 'app');
  const outShots = join(OUT, 'screenshots');
  const dossierPath = join(OUT, 'dossier.json');

  if (!existsSync(join(outApp, 'index.html'))) fail('app/index.html missing from output');
  for (const rel of listFiles(appSrc, '')) {
    if (!existsSync(join(outApp, rel))) fail('app file missing from output: ' + rel);
  }
  for (const rel of listFiles(shotsSrc, '')) {
    if (!existsSync(join(outShots, rel))) fail('screenshot missing from output: ' + rel);
  }
  if (!existsSync(dossierPath)) fail('dossier.json missing from output');
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(dossierPath, 'utf8'));
  } catch (e) {
    fail('dossier.json does not parse as JSON: ' + (e instanceof Error ? e.message : String(e)));
  }
  if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length === 0) {
    fail('dossier.json parsed but is empty');
  }
  const shotFiles = readdirSync(outShots).filter(f => !f.startsWith('.'));
  if (shotFiles.length < 3 || shotFiles.length > 4) {
    fail('expected 3 screenshots, found ' + shotFiles.length);
  }
  // Extra gate checks: screenshot and dossier size caps, and no symlinks
  // anywhere in the output tree (the gate refuses special files).
  for (const f of shotFiles) {
    const sz = statSync(join(outShots, f)).size;
    if (sz > 262144) fail('screenshot over 256 KiB: ' + f + ' (' + sz + ' bytes)');
  }
  if (statSync(dossierPath).size > 1572864) {
    fail('dossier.json over 1.5 MiB: ' + statSync(dossierPath).size + ' bytes');
  }
  const allOut = listFiles(OUT, '');
  for (const rel of allOut) {
    if (lstatSync(join(OUT, rel)).isSymbolicLink()) fail('symlink in output: ' + rel);
  }
  console.log('main.ts OK: wrote ' + OUT + ' (' + shotFiles.length + ' screenshots, dossier ' +
    statSync(dossierPath).size + ' bytes)');
}

main();
