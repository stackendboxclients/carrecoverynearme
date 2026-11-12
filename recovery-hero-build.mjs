import { createRequire } from 'node:module';
import { readFile, writeFile, cp, unlink } from 'node:fs/promises';
import { build } from 'esbuild';

export async function buildRecoveryHero() {
  const serverPath = 'dist/recovery-hero-server.cjs';
  const settings = {
    bundle: true,
    jsx: 'automatic',
    minify: true,
    define: { 'process.env.NODE_ENV': '"production"' },
  };

  await Promise.all([
    build({ ...settings, entryPoints: ['recovery-hero-client.ts'], outfile: 'dist/assets/recovery-hero.js', format: 'esm' }),
    build({
      ...settings,
      stdin: {
        contents: 'export { RecoveryHero } from "./recovery-hero";',
        resolveDir: process.cwd(),
      },
      outfile: serverPath,
      platform: 'node',
      packages: 'external',
    }),
    cp('recovery-hero-flatbed.webp', 'dist/flatbed.webp'),
  ]);

  const require = createRequire(import.meta.url);
  const { createElement } = require('react');
  const { renderToString } = require('react-dom/server');
  const { RecoveryHero } = require('./' + serverPath);
  const markup = renderToString(createElement(RecoveryHero, {
    bookingHref: '/book/',
    servicesHref: '/services/',
  }));
  await unlink(serverPath);

  const css = await readFile('recovery-hero.css', 'utf8');
  await writeFile('dist/assets/recovery-hero.css', css);
  for (const font of ['instrument-sans', 'space-grotesk']) {
    await cp(
      'node_modules/@fontsource-variable/' + font + '/files/' + font + '-latin-wght-normal.woff2',
      'dist/assets/hero-' + font + '.woff2',
    );
  }
  return '<div id="recovery-hero-root">' + markup + '</div>';
}
