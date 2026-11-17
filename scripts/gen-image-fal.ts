import { fal } from '@fal-ai/client';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './gen-image-fal.config.ts';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CARDS_DATA_DIR = path.resolve(SCRIPT_DIR, '../src/lib/data');
const IMAGES_DIR = path.resolve(SCRIPT_DIR, '../src/lib/assets/img/cards');
const STATE_FILE = path.join(SCRIPT_DIR, '.image-gen-fal-state.json');

/** The card types that are dealt from the fate deck and therefore get artwork. */
const IMAGE_TYPES = ['events', 'crisis'] as const;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface Task {
	description: string;
	amendments: string[];
	status: 'pending' | 'running' | 'done' | 'failed';
	createdAt: string;
	updatedAt: string;
	error?: string;
}

interface State {
	tasks: Record<string, Task>;
}

function loadState(): State {
	if (!fs.existsSync(STATE_FILE)) return { tasks: {} };
	return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) as State;
}

function saveState(state: State): void {
	fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectIds(dir: string, ids: Set<string>): void {
	if (!fs.existsSync(dir)) return;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			collectIds(fullPath, ids);
		} else if (entry.isFile() && entry.name.endsWith('.ts')) {
			ids.add(entry.name.slice(0, -3));
		}
	}
}

function getEntityIds(): Set<string> {
	const ids = new Set<string>();
	for (const type of IMAGE_TYPES) {
		collectIds(path.join(CARDS_DATA_DIR, type), ids);
	}
	return ids;
}

function cardImagePath(entityId: string): string {
	return path.join(IMAGES_DIR, `${entityId}.jpg`);
}

function imageExists(entityId: string): boolean {
	return fs.existsSync(cardImagePath(entityId));
}

/** ImageMagick ships as `magick` from v7 and as `convert` from v6 and the v7 compat package. */
const IMAGEMAGICK_BINARIES = ['magick', 'convert'] as const;

/**
 * Card artwork is imported by extension (`import.meta.glob('.../*.jpg')` in
 * src/lib/assets/img/index.ts), so endpoints that answer with WebP or PNG must
 * be transcoded before saving.
 */
function toJpeg(buffer: Buffer, entityId: string): Buffer {
	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return buffer;

	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'card-art-'));
	const input = path.join(tmpDir, 'source');
	const output = path.join(tmpDir, `${entityId}.jpg`);
	let lastError: unknown;
	try {
		fs.writeFileSync(input, buffer);
		for (const binary of IMAGEMAGICK_BINARIES) {
			try {
				execFileSync(binary, [input, '-quality', '92', output], { stdio: 'pipe' });
				return fs.readFileSync(output);
			} catch (err) {
				lastError = err;
			}
		}
		throw new Error(
			`fal.ai returned a non-JPEG image and ImageMagick could not convert it: ${
				lastError instanceof Error ? lastError.message : String(lastError)
			}`
		);
	} finally {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

async function generate(entityId: string, state: State): Promise<void> {
	const task = state.tasks[entityId];

	task.status = 'running';
	task.updatedAt = new Date().toISOString();
	saveState(state);

	console.log(`Generating image for '${entityId}' using fal.ai...`);

	try {
		if (!config.apiKey) {
			throw new Error('FAL_KEY environment variable is not set.');
		}

		// Build the full prompt: system prompt + card ID + description + amendments
		const promptParts = [
			`${config.systemPrompt}\n\nCard ID: ${entityId}`,
			task.description,
			...task.amendments
		];
		const prompt = promptParts.join('\n\n');

		const result = await fal.subscribe(config.model, {
			input: {
				prompt,
				image_size: config.imageSize
			},
			logs: true,
			onQueueUpdate: (update) => {
				if (update.status === 'IN_PROGRESS') {
					update.logs.map((log) => log.message).forEach(console.log);
				}
			}
		});

		// fal.ai image endpoints return a data.images array with { url, content_type, ... }
		const images = result.data?.images as { url: string }[] | undefined;
		if (!images || images.length === 0) {
			throw new Error('No image returned from fal.ai API.');
		}

		// Download the image
		const imageUrl = images[0].url;
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
		}
		const imageBuffer = toJpeg(Buffer.from(await response.arrayBuffer()), entityId);
		fs.mkdirSync(IMAGES_DIR, { recursive: true });
		fs.writeFileSync(cardImagePath(entityId), imageBuffer);

		task.status = 'done';
		task.updatedAt = new Date().toISOString();
		delete task.error;
		saveState(state);

		console.log(`Image saved: ${cardImagePath(entityId)}`);
		console.log(`Request ID: ${result.requestId}`);
	} catch (err) {
		task.status = 'failed';
		task.updatedAt = new Date().toISOString();
		task.error = err instanceof Error ? err.message : String(err);
		saveState(state);

		reportError(verbose ? err : `Generation failed for '${entityId}': ${task.error}`);
		process.exit(1);
	}
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdMissing(): void {
	const entityIds = getEntityIds();
	const missing = [...entityIds].filter((id) => !imageExists(id)).sort();

	if (missing.length === 0) {
		console.log('All cards have images.');
	} else {
		console.log(`${missing.length} card(s) missing images:\n`);
		for (const id of missing) {
			console.log(`  ${id}`);
		}
	}
}

async function cmdDescribe(args: string[]): Promise<void> {
	const redo = args.includes('--redo');
	const positional = args.filter((a) => a !== '--redo');

	if (positional.length < 2) {
		console.error('Usage: describe <card-id> <description> [--redo]');
		process.exit(1);
	}

	const [entityId, ...descParts] = positional;
	const description = descParts.join(' ');

	if (!getEntityIds().has(entityId)) {
		console.error(`Error: Card '${entityId}' not found in catalog.`);
		process.exit(1);
	}

	const state = loadState();

	if (imageExists(entityId) && !redo) {
		console.error(`Error: Image already exists for '${entityId}'. Use --redo to overwrite.`);
		process.exit(1);
	}

	if (state.tasks[entityId] && !redo) {
		console.error(`Error: Task already exists for '${entityId}'. Use --redo to replace it.`);
		process.exit(1);
	}

	const now = new Date().toISOString();
	state.tasks[entityId] = {
		description,
		amendments: [],
		status: 'pending',
		createdAt: now,
		updatedAt: now
	};
	saveState(state);

	await generate(entityId, state);
}

async function cmdAmend(args: string[]): Promise<void> {
	if (args.length < 2) {
		console.error('Usage: amend <card-id> <amendment>');
		process.exit(1);
	}

	const [entityId, ...amendParts] = args;
	const amendment = amendParts.join(' ');

	if (!getEntityIds().has(entityId)) {
		console.error(`Error: Card '${entityId}' not found in catalog.`);
		process.exit(1);
	}

	const state = loadState();

	if (!state.tasks[entityId]) {
		console.error(`Error: No prior task for '${entityId}'. Use 'describe' first.`);
		process.exit(1);
	}

	state.tasks[entityId].amendments.push(amendment);
	state.tasks[entityId].status = 'pending';
	state.tasks[entityId].updatedAt = new Date().toISOString();
	delete state.tasks[entityId].error;
	saveState(state);

	await generate(entityId, state);
}

function cmdStatus(): void {
	const state = loadState();
	const tasks = Object.entries(state.tasks);

	if (tasks.length === 0) {
		console.log('No generation tasks.');
		return;
	}

	const BAR_WIDTH = 20;
	const nameWidth = Math.max(...tasks.map(([id]) => id.length), 10) + 2;
	const counts = { done: 0, running: 0, pending: 0, failed: 0 };

	for (const [id, task] of tasks.sort(([a], [b]) => a.localeCompare(b))) {
		counts[task.status]++;

		let filled = 0;
		let statusLabel = '';
		let extra = '';

		switch (task.status) {
			case 'done':
				filled = BAR_WIDTH;
				statusLabel = 'DONE';
				extra = `(${new Date(task.updatedAt).toLocaleString()})`;
				break;
			case 'running':
				filled = Math.floor(BAR_WIDTH / 2);
				statusLabel = 'RUNNING';
				break;
			case 'pending':
				filled = 0;
				statusLabel = 'PENDING';
				break;
			case 'failed':
				filled = 0;
				statusLabel = 'FAILED';
				extra = task.error ?? '';
				break;
		}

		const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
		const name = id.padEnd(nameWidth);
		const status = statusLabel.padEnd(8);

		console.log(`${name} [${bar}] ${status} ${extra}`);
	}

	console.log();
	console.log(
		[
			`${counts.done} done`,
			`${counts.running} running`,
			`${counts.pending} pending`,
			`${counts.failed} failed`
		].join(' · ')
	);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const allArgs = process.argv.slice(2);
const verbose = allArgs.includes('-v') || allArgs.includes('--verbose');
const cliArgs = allArgs.filter((a) => a !== '-v' && a !== '--verbose');

function reportError(err: unknown): void {
	if (verbose) {
		console.error(err);
	} else {
		const message = err instanceof Error ? err.message : String(err);
		console.error(`Error: ${message}`);
	}
}

async function main(): Promise<void> {
	const [command, ...args] = cliArgs;

	switch (command) {
		case 'missing':
			cmdMissing();
			break;
		case 'describe':
			await cmdDescribe(args);
			break;
		case 'amend':
			await cmdAmend(args);
			break;
		case 'status':
			cmdStatus();
			break;
		default:
			console.error(`Unknown command: ${command ?? '(none)'}`);
			console.error('Available commands: missing, describe, amend, status');
			process.exit(1);
	}
}

main();
