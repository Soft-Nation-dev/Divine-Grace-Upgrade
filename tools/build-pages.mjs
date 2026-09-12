import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'site');

const fileEntries = [
  'index.html',
  'divinegrace.html',
  'config-api.js',
  'CNAME',
];

const dirEntries = [
  'Administrator',
  'Connect with us',
  'css folder',
  'forgot Password',
  'home',
  'homepage',
  'images',
  'lstsregistrationpage',
  'Messages',
  'prayerequest',
  'Records',
  'registerlogin',
  'scripts',
];

const exists = async (targetPath) => {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
};

const copyEntry = async (entry) => {
  const src = path.join(rootDir, entry);
  const dest = path.join(outDir, entry);

  if (!(await exists(src))) {
    console.warn(`[build-pages] Skipping missing path: ${entry}`);
    return;
  }

  await cp(src, dest, { recursive: true });
};

const main = async () => {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  for (const entry of [...fileEntries, ...dirEntries]) {
    await copyEntry(entry);
  }

  console.log('[build-pages] Built site/ folder for GitHub Pages deployment.');
};

main().catch((err) => {
  console.error('[build-pages] Failed:', err);
  process.exit(1);
});
