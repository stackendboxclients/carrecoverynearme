import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { cp, unlink, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

export async function buildRecoveryHero({ callHref, whatsappHref }) {
  const serverPath = 'dist/recovery-hero-server.cjs';
  const settings = {
    bundle: true,
    jsx: 'automatic',
    minify: true,
    define: { 'process.env.NODE_ENV': '"production"' },
  };

  const [client] = await Promise.all([
    build({ ...settings, entryPoints: ['recovery-hero-client.ts'], write: false, format: 'esm' }),
    build({
      ...settings,
      stdin: {
        contents: 'export { RecoveryHero, RecoveryMap } from "./recovery-hero";',
        resolveDir: process.cwd(),
      },
      outfile: serverPath,
      platform: 'node',
      packages: 'external',
    }),
    cp('recovery-hero-flatbed.webp', 'dist/flatbed.webp'),
  ]);
  const motion = client.outputFiles[0].contents;
  const version = createHash('sha256').update(motion).digest('hex').slice(0, 12);
  const motionSrc = `/assets/recovery-hero.${version}.js`;
  await writeFile('dist' + motionSrc, motion);

  const require = createRequire(import.meta.url);
  const { createElement } = require('react');
  const { renderToString } = require('react-dom/server');
  const { RecoveryHero, RecoveryMap } = require('./' + serverPath);
  const markup = renderToString(createElement(RecoveryHero, {
    bookingHref: '#request-recovery',
    callHref,
    whatsappHref,
  }));
  const mapMarkup = renderToString(createElement(RecoveryMap));
  await unlink(serverPath);

  for (const font of ['instrument-sans', 'space-grotesk']) {
    await cp(
      'node_modules/@fontsource-variable/' + font + '/files/' + font + '-latin-wght-normal.woff2',
      'dist/assets/hero-' + font + '.woff2',
    );
  }
  return { markup: '<div id="recovery-hero-root">' + markup + '</div>', mapMarkup, motionSrc };
}
