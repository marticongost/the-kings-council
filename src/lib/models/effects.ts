import { keywords, type Keyword } from './keywords';
import { kingdomStatTypes, type KingdomStatType } from './kingdomstats';
import { resourceTypes, type ResourceType } from './resources';

export interface TextChunk {
	type: 'text';
	text: string;
}

export interface ResourceChunk {
	type: 'resource';
	resource: ResourceType;
	amount: number;
}

export interface ResourceLabelChunk {
	type: 'resource-label';
	resource: ResourceType;
}

export interface KingdomStatChunk {
	type: 'kingdom-stat';
	stat: KingdomStatType;
	amount: number;
}

export interface KingdomStatLabelChunk {
	type: 'kingdom-stat-label';
	stat: KingdomStatType;
}

export interface KeywordChunk {
	type: 'keyword';
	keyword: Keyword;
}

export const inputFormats = [
	'text',
	'list',
	'number',
	'check',
	'tally',
	'player',
	'players',
	'kingdom',
	'kingdom-member',
	'kingdom-members',
	...resourceTypes
] as const;

/** Default number of squares of a `tally` input. */
export const defaultTallyCount = 5;

export function isInputFormat(value: string): value is (typeof inputFormats)[number] {
	return inputFormats.includes(value as (typeof inputFormats)[number]);
}

export interface InputChunk {
	type: 'input';
	format: (typeof inputFormats)[number];
	/** Sizes of the groups of squares of a `tally` input. */
	counts?: Array<number>;
}

export interface InvalidChunk {
	type: 'invalid';
	message: string;
}

export type Chunk =
	| TextChunk
	| ResourceChunk
	| ResourceLabelChunk
	| KeywordChunk
	| KingdomStatChunk
	| KingdomStatLabelChunk
	| InputChunk
	| InvalidChunk;

export interface BuilderInput {
	params: Record<string, string>;
	args: Array<string>;
}

export type ChunkBuilder = (input: BuilderInput) => Chunk;

function resourceBuilder(resource: ResourceType): ChunkBuilder {
	return ({ params, args }: BuilderInput): Chunk => {
		const raw = params.amount ?? args[0] ?? '0';
		const amount = Number(raw);
		if (raw.trim() === '' || !Number.isFinite(amount)) {
			throw new Error(`Amount must be a number for resource "${resource}"`);
		}
		return { type: 'resource', resource, amount };
	};
}

function resourceLabelBuilder(resource: ResourceType): ChunkBuilder {
	return (): Chunk => {
		return { type: 'resource-label', resource };
	};
}

function kingdomStatBuilder(stat: KingdomStatType): ChunkBuilder {
	return ({ params, args }: BuilderInput): Chunk => {
		const raw = params.amount ?? args[0] ?? '0';
		const amount = Number(raw);
		if (raw.trim() === '' || !Number.isFinite(amount)) {
			throw new Error(`Amount must be a number for kingdom stat "${stat}"`);
		}
		return { type: 'kingdom-stat', stat, amount };
	};
}

function kingdomStatLabelBuilder(stat: KingdomStatType): ChunkBuilder {
	return (): Chunk => {
		return { type: 'kingdom-stat-label', stat };
	};
}

function keywordBuilder(keyword: Keyword): ChunkBuilder {
	return ({ params, args }: BuilderInput): Chunk => {
		if (args.length) {
			return { type: 'invalid', message: 'keywords take no arguments' };
		}
		if (Object.keys(params).length) {
			return { type: 'invalid', message: 'keywords take no named parameters' };
		}
		return { type: 'keyword', keyword };
	};
}

function buildInput({ params, args }: BuilderInput): Chunk {
	const format: string = (params.format || args[0]) ?? 'text';
	if (!isInputFormat(format)) {
		return {
			type: 'invalid',
			message: `Invalid input format; expected ${inputFormats.map((f) => `'${f}'`).join(', ')}, got '${format}' instead`
		};
	}

	if (format === 'tally') {
		const raw = params.count ?? args[1] ?? String(defaultTallyCount);
		const counts = raw.split(',').map((part) => Number(part.trim()));
		if (counts.some((count) => !Number.isInteger(count) || count < 1)) {
			return {
				type: 'invalid',
				message: `Tally counts must be positive integers, got '${raw}' instead`
			};
		}
		return { type: 'input', format, counts };
	}

	return { type: 'input', format };
}

const builders: Partial<Record<string, ChunkBuilder>> = {
	input: buildInput
};

for (const resourceType of resourceTypes) {
	builders[resourceType] = resourceBuilder(resourceType);
	builders[`${resourceType}-label`] = resourceLabelBuilder(resourceType);
}

for (const kingdomStat of kingdomStatTypes) {
	builders[kingdomStat] = kingdomStatBuilder(kingdomStat);
	builders[`${kingdomStat}-label`] = kingdomStatLabelBuilder(kingdomStat);
}

for (const keyword of Object.keys(keywords)) {
	builders[keyword] = keywordBuilder(keyword as Keyword);
}

function parseDirective(raw: string): Chunk {
	const directive = raw.slice(1, -1).trim();

	if (!directive) {
		return { type: 'invalid', message: 'Empty directive' };
	}

	const tokens = directive.split(/\s+/);
	const keyword = tokens[0];
	const params: Record<string, string> = {};
	const args: Array<string> = [];

	for (const token of tokens.slice(1)) {
		const colon = token.indexOf(':');
		if (colon > 0) {
			params[token.slice(0, colon)] = token.slice(colon + 1);
		} else {
			args.push(token);
		}
	}

	const builder = builders[keyword];
	if (!builder) {
		return { type: 'invalid', message: `Unknown keyword "${keyword}"` };
	}

	try {
		return builder({ params, args });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return { type: 'invalid', message };
	}
}

export function parse(text: string): Array<Chunk> {
	const chunks: Array<Chunk> = [];
	let index = 0;

	while (index < text.length) {
		const open = text.indexOf('{', index);

		if (open === -1) {
			const tail = text.slice(index);
			if (tail) {
				chunks.push({ type: 'text', text: tail });
			}
			break;
		}

		if (open > index) {
			chunks.push({ type: 'text', text: text.slice(index, open) });
		}

		const close = text.indexOf('}', open + 1);
		if (close === -1) {
			chunks.push({
				type: 'invalid',
				message: 'Missing closing brace'
			});
			break;
		}

		chunks.push(parseDirective(text.slice(open, close + 1)));
		index = close + 1;
	}

	return chunks;
}
