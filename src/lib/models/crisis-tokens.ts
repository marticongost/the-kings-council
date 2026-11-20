import { Counter, ReadonlyCounter } from '../counter.ts';
import { minTurn } from './turns';

const crisisTokensData = {
	danger1: 'Perill 1',
	danger2: 'Perill 2',
	danger3: 'Perill 3',
	retribution: 'Retribució',
	challenge: 'Fortuna'
} as const;

export type CrisisTokenId = keyof typeof crisisTokensData;

export type VariableCrisisTokenId = keyof Omit<
	typeof crisisTokensData,
	'danger1' | 'danger2' | 'danger3' | 'retribution'
>;

export type VariableCrisisToken = CrisisToken & { readonly id: VariableCrisisTokenId };

export class CrisisToken {
	readonly id: CrisisTokenId;
	readonly title: string;

	constructor(id: CrisisTokenId, title: string) {
		this.id = id;
		this.title = title;
	}

	isVariable(): this is VariableCrisisToken {
		return this.id === 'challenge';
	}

	/** Whether the token's danger is told by its artwork, which shows one splash per point. */
	isDanger(): boolean {
		return this.id.startsWith('danger');
	}
}

const crisisTokens = {} as Record<CrisisTokenId, CrisisToken>;

for (const [id, title] of Object.entries(crisisTokensData) as [[CrisisTokenId, string]]) {
	crisisTokens[id] = new CrisisToken(id, title);
}

export function getCrisisTokens(): Array<CrisisToken> {
	return Object.values(crisisTokens);
}

export function getCrisisToken(id: CrisisTokenId): CrisisToken {
	return crisisTokens[id];
}

export function isCrisisTokenId(value: string): value is CrisisTokenId {
	return value in crisisTokens;
}

function makeBag(counts: Partial<Record<CrisisTokenId, number>>): ReadonlyCounter<CrisisToken> {
	const counter = new Counter<CrisisToken>();
	for (const [id, count] of Object.entries(counts)) {
		counter.add(getCrisisToken(id as CrisisTokenId), count);
	}
	return counter.readonly();
}

export const initialCrisisBag: ReadonlyCounter<CrisisToken> = makeBag({
	danger1: 5,
	danger2: 1,
	retribution: 3,
	challenge: 3
});

export interface CrisisBagChanges {
	additions: ReadonlyCounter<CrisisToken>;
	removals: ReadonlyCounter<CrisisToken>;
}

export const perTurnCrisisBagChanges: Record<number, CrisisBagChanges> = {
	2: {
		additions: makeBag({ danger2: 1 }),
		removals: makeBag({ danger1: 1 })
	},
	3: {
		additions: makeBag({ danger2: 1 }),
		removals: makeBag({ danger1: 1 })
	},
	4: {
		additions: makeBag({ danger2: 1 }),
		removals: makeBag({ danger1: 1 })
	},
	5: {
		additions: makeBag({ danger3: 1 }),
		removals: makeBag({ danger2: 1 })
	},
	6: {
		additions: makeBag({ danger3: 1 }),
		removals: makeBag({ danger2: 1 })
	},
	7: {
		additions: makeBag({ danger3: 1 }),
		removals: makeBag({ danger1: 1 })
	},
	8: {
		additions: makeBag({ danger3: 2 }),
		removals: makeBag({})
	}
};

/** How many tokens of each kind a kingdom's bag holds. */
export type CrisisBag = Partial<Record<CrisisTokenId, number>>;

/** A fresh bag, as every kingdom has before the first turn. */
export function initialCrisisBagCounts(): CrisisBag {
	const counts: CrisisBag = {};
	for (const [token, count] of initialCrisisBag.entries()) {
		counts[token.id] = count;
	}
	return counts;
}

/** The number of tokens a bag holds. */
export function crisisBagSize(bag: CrisisBag): number {
	let total = 0;
	for (const count of Object.values(bag)) total += count ?? 0;
	return total;
}

function addToBag(bag: CrisisBag, id: CrisisTokenId, amount: number): void {
	const count = (bag[id] ?? 0) + amount;
	if (count > 0) bag[id] = count;
	else delete bag[id];
}

/** Applies (or, with a negative direction, reverts) the changes that a turn brings to a bag. */
function applyCrisisBagChanges(bag: CrisisBag, turn: number, direction: 1 | -1): void {
	const changes = perTurnCrisisBagChanges[turn];
	if (!changes) return;

	for (const [token, count] of changes.additions.entries()) {
		addToBag(bag, token.id, direction * count);
	}
	for (const [token, count] of changes.removals.entries()) {
		addToBag(bag, token.id, -direction * count);
	}
}

/**
 * Applies the changes of every turn between two turns, in order, so that a bag follows the
 * turn it belongs to. Going back reverts the changes of the turns being left behind.
 */
export function changeCrisisBagTurn(bag: CrisisBag, fromTurn: number, toTurn: number): void {
	if (toTurn > fromTurn) {
		for (let turn = fromTurn + 1; turn <= toTurn; turn += 1) applyCrisisBagChanges(bag, turn, 1);
	} else {
		for (let turn = fromTurn; turn > toTurn; turn -= 1) applyCrisisBagChanges(bag, turn, -1);
	}
}

/** A bag as it stands on a given turn, before any crisis has drawn from it. */
export function crisisBagForTurn(turn: number): CrisisBag {
	const bag = initialCrisisBagCounts();
	changeCrisisBagTurn(bag, minTurn, turn);
	return bag;
}

/** Picks a token at random, weighted by how many of each kind the bag holds. */
function randomCrisisToken(bag: CrisisBag, random: () => number): CrisisToken | undefined {
	const entries = Object.entries(bag).filter(
		(entry): entry is [CrisisTokenId, number] => (entry[1] ?? 0) > 0
	);
	if (entries.length === 0) return undefined;

	let target = random() * crisisBagSize(bag);
	for (const [id, count] of entries) {
		if (target < count) return getCrisisToken(id);
		target -= count;
	}
	// Floating point drift can leave the target past the last entry.
	return getCrisisToken(entries[entries.length - 1][0]);
}

/**
 * Draws `count` tokens at random from the bag, taking them out of it, and returns them in
 * the order they were drawn. Draws fewer when the bag holds fewer tokens.
 */
export function drawFromCrisisBag(
	bag: CrisisBag,
	count: number,
	random: () => number = Math.random
): Array<CrisisToken> {
	const drawn: Array<CrisisToken> = [];
	for (let draw = 0; draw < count; draw += 1) {
		const token = randomCrisisToken(bag, random);
		if (!token) break;
		addToBag(bag, token.id, -1);
		drawn.push(token);
	}
	return drawn;
}

/** Puts tokens back into the bag. */
export function returnToCrisisBag(bag: CrisisBag, tokens: ReadonlyArray<CrisisTokenId>): void {
	for (const id of tokens) addToBag(bag, id, 1);
}
