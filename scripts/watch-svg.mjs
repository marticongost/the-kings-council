import { spawn } from 'node:child_process';
import chokidar from 'chokidar';

const watcher = chokidar.watch('src/lib/assets/svg/**/*.svg', {
	ignoreInitial: true
});

function optimize(path) {
	const child = spawn('node', ['scripts/optimize-svg.mjs', path], { stdio: 'inherit' });
	child.on('error', (error) => console.error(error));
}

watcher.on('add', optimize);
watcher.on('change', optimize);

process.on('SIGINT', () => {
	void watcher.close().then(() => process.exit(0));
});
