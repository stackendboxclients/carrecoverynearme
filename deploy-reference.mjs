import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
execFileSync('tar', ['-xzf', 'recovery-site.tar.gz', '-C', 'dist'], { stdio: 'inherit' });
