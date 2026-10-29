import { cardsCatalog } from '#lib/data/catalog';
import { CardCapability } from '#lib/models/cardcapabilities';
import { cardTypes, type Card, type CardType } from '#lib/models/cards';
import { kingdomStatTypes, type KingdomStatType } from '#lib/models/kingdomstats';
import { SvelteSet } from 'svelte/reactivity';
import {
	emptyKingdomStats,
	kingdomStatMax,
	kingdomStatMin,
	kingdomStatNeutral,
	playerResourceTypes,
	zoneKey,
	type CardRef,
	type KingdomState,
	type PlayerResourceType,
	type PlayerResources,
	type PlayerState,
	type SimulatorSnapshot,
	type Zone
} from './types';

export const simulatorStorageKey = 'the-kings-council:simulator:v1';

const snapshotVersion = 1;

let uidCounter = 0;

function makeUid(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	uidCounter += 1;
	return `sim-${Date.now().toString(36)}-${uidCounter}`;
}

function emptyCardTypeRecord<T>(factory: (type: CardType) => T): Record<CardType, T> {
	const record = {} as Record<CardType, T>;
	for (const type of cardTypes) {
		record[type] = factory(type);
	}
	return record;
}

function emptyResources(): PlayerResources {
	const resources = {} as PlayerResources;
	for (const type of playerResourceTypes) {
		resources[type] = 0;
	}
	return resources;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, Math.round(value)));
}

function asObject(value: unknown): Record<string, unknown> | null {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;
}

function asNumber(value: unknown, fallback: number): number {
	const parsed = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function shuffle<T>(items: Array<T>): void {
	for (let index = items.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[items[index], items[swapIndex]] = [items[swapIndex], items[index]];
	}
}

function normalizeRefs(value: unknown, expectedType?: CardType): Array<CardRef> {
	if (!Array.isArray(value)) return [];

	const refs: Array<CardRef> = [];
	for (const cardId of value) {
		if (typeof cardId !== 'string') continue;
		const card = cardsCatalog.byId(cardId);
		if (!card || (expectedType && card.type !== expectedType)) continue;
		refs.push({ uid: makeUid(), cardId: card.id });
	}
	return refs;
}

function normalizeStats(value: unknown): KingdomState['stats'] {
	const record = asObject(value);
	const stats = emptyKingdomStats();
	for (const type of kingdomStatTypes) {
		stats[type] = clamp(
			asNumber(record?.[type], kingdomStatNeutral),
			kingdomStatMin,
			kingdomStatMax
		);
	}
	return stats;
}

function normalizeResources(value: unknown): PlayerResources {
	const record = asObject(value);
	const resources = emptyResources();
	for (const type of playerResourceTypes) {
		resources[type] = Math.max(0, Math.round(asNumber(record?.[type], 0)));
	}
	return resources;
}

function uniqueId(candidate: unknown, used: Set<string>): string {
	if (typeof candidate === 'string' && candidate && !used.has(candidate)) {
		used.add(candidate);
		return candidate;
	}
	const id = makeUid();
	used.add(id);
	return id;
}

/** Names handed out to new players, in order, before falling back to numbered names. */
const defaultPlayerNames: ReadonlyArray<string> = [
	'Oriol',
	'Jordi',
	'Marc',
	'Dària',
	'Jan',
	'Marina',
	'Gerard',
	'Martí',
	'Sara',
	'Piqui',
	'Marta',
	'Joan',
	'Vero',
	'Kampde',
	'Rebeca',
	'Nil',
	'Ali'
];

function nextPlayerName(players: ReadonlyArray<PlayerState>): string {
	const used = new Set(players.map((player) => player.name));
	const available = defaultPlayerNames.find((name) => !used.has(name));
	if (available) return available;

	let index = 1;
	while (used.has(`Jugador ${index}`)) {
		index += 1;
	}
	return `Jugador ${index}`;
}

/** Every player owns one capability card of each common action. */
const commonCapabilities: ReadonlyArray<CardCapability> = cardsCatalog
	.all()
	.filter((card) => card.type === 'common')
	.flatMap((card) =>
		card.capabilities.map((capability, index) => new CardCapability(card, capability, index))
	);

/**
 * State of the playtesting sandbox. Card instances only live in memory; snapshots
 * persist card ids, and references are rebuilt (with fresh uids) when loading.
 */
export class SimulatorState {
	ready = $state(false);
	players = $state<Array<PlayerState>>([]);
	kingdoms = $state<Array<KingdomState>>([]);
	laws = $state<Array<CardRef>>([]);
	market = $state<Array<CardRef>>([]);
	decks = $state<Record<CardType, Array<CardRef>>>(emptyCardTypeRecord(() => []));
	discards = $state<Record<CardType, Array<CardRef>>>(emptyCardTypeRecord(() => []));

	load(): void {
		this.reset();

		const raw =
			typeof localStorage === 'undefined' ? null : localStorage.getItem(simulatorStorageKey);
		if (raw) {
			try {
				this.restore(JSON.parse(raw) as unknown);
			} catch {
				this.reset();
			}
		}

		this.ready = true;
	}

	persist(): void {
		if (!this.ready || typeof localStorage === 'undefined') return;
		localStorage.setItem(simulatorStorageKey, JSON.stringify(this.toSnapshot()));
	}

	clear(): void {
		this.reset();
		this.persist();
	}

	reset(): void {
		this.players = [];
		this.kingdoms = [];
		this.laws = [];
		this.market = [];
		this.decks = this.createFullDecks();
		this.discards = emptyCardTypeRecord(() => []);
	}

	// Players

	addPlayer(): void {
		this.players.push({
			id: makeUid(),
			name: nextPlayerName(this.players),
			kingdomId: null,
			resources: emptyResources(),
			hand: []
		});
	}

	removePlayer(playerId: string): void {
		const index = this.players.findIndex((player) => player.id === playerId);
		if (index < 0) return;

		const [player] = this.players.splice(index, 1);
		for (const ref of player.hand) {
			const card = this.cardOf(ref);
			if (card) this.discards[card.type].push(ref);
		}
	}

	renamePlayer(playerId: string, name: string): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (player) player.name = name;
	}

	assignKingdom(playerId: string, kingdomId: string | null): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;
		player.kingdomId =
			kingdomId && this.kingdoms.some((kingdom) => kingdom.id === kingdomId) ? kingdomId : null;
	}

	setResource(playerId: string, resource: PlayerResourceType, value: number): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player || !Number.isFinite(value)) return;
		player.resources[resource] = Math.max(0, Math.round(value));
	}

	membersOf(kingdomId: string): Array<PlayerState> {
		return this.players.filter((player) => player.kingdomId === kingdomId);
	}

	// Kingdoms

	addKingdom(): void {
		this.kingdoms.push({
			id: makeUid(),
			name: `Regne ${this.kingdoms.length + 1}`,
			stats: emptyKingdomStats()
		});
	}

	removeKingdom(kingdomId: string): void {
		const index = this.kingdoms.findIndex((kingdom) => kingdom.id === kingdomId);
		if (index < 0) return;

		this.kingdoms.splice(index, 1);
		for (const player of this.players) {
			if (player.kingdomId === kingdomId) player.kingdomId = null;
		}
	}

	renameKingdom(kingdomId: string, name: string): void {
		const kingdom = this.kingdoms.find((candidate) => candidate.id === kingdomId);
		if (kingdom) kingdom.name = name;
	}

	setStat(kingdomId: string, stat: KingdomStatType, value: number): void {
		const kingdom = this.kingdoms.find((candidate) => candidate.id === kingdomId);
		if (!kingdom || !Number.isFinite(value)) return;
		kingdom.stats[stat] = clamp(value, kingdomStatMin, kingdomStatMax);
	}

	// Cards

	cardOf(ref: CardRef): Card | undefined {
		return cardsCatalog.byId(ref.cardId);
	}

	capabilitiesOf(player: PlayerState): Array<CardCapability> {
		const capabilities: Array<CardCapability> = [...commonCapabilities];
		for (const ref of player.hand) {
			const card = this.cardOf(ref);
			if (!card) continue;
			card.capabilities.forEach((capability, index) => {
				capabilities.push(new CardCapability(card, capability, index));
			});
		}
		return capabilities;
	}

	/**
	 * Moves a card between zones. Dragging a deck moves its top card; invalid
	 * source/target combinations are ignored.
	 */
	moveCard(source: Zone, target: Zone, uid?: string): void {
		if (zoneKey(source) === zoneKey(target)) return;

		const sourceCards = this.cardsIn(source);
		const targetCards = this.cardsIn(target);
		if (!sourceCards || !targetCards || sourceCards.length === 0) return;

		const index =
			source.kind === 'deck'
				? sourceCards.length - 1
				: sourceCards.findIndex((ref) => ref.uid === uid);
		if (index < 0) return;

		const ref = sourceCards[index];
		const card = this.cardOf(ref);
		if (!card || !this.canPlace(card, target)) return;

		sourceCards.splice(index, 1);
		targetCards.push(ref);
	}

	// Persistence internals

	private cardsIn(zone: Zone): Array<CardRef> | null {
		switch (zone.kind) {
			case 'hand':
				return this.players.find((player) => player.id === zone.playerId)?.hand ?? null;
			case 'laws':
				return this.laws;
			case 'market':
				return this.market;
			case 'deck':
				return this.decks[zone.cardType];
			case 'discard':
				return this.discards[zone.cardType];
		}
	}

	private canPlace(card: Card, target: Zone): boolean {
		switch (target.kind) {
			case 'hand':
				return true;
			case 'laws':
				return card.type === 'law';
			case 'market':
				return card.type === 'asset';
			case 'deck':
			case 'discard':
				return card.type === target.cardType;
		}
	}

	private createFullDecks(): Record<CardType, Array<CardRef>> {
		const decks = emptyCardTypeRecord(() => [] as Array<CardRef>);
		for (const card of cardsCatalog.all()) {
			// Common action cards are reference cards: players get their capabilities instead.
			if (card.type === 'common') continue;
			decks[card.type].push({ uid: makeUid(), cardId: card.id });
		}
		for (const type of cardTypes) {
			shuffle(decks[type]);
		}
		return decks;
	}

	private toSnapshot(): SimulatorSnapshot {
		const cardIds = (refs: Array<CardRef>) => refs.map((ref) => ref.cardId);

		return {
			version: snapshotVersion,
			players: this.players.map((player) => ({
				id: player.id,
				name: player.name,
				kingdomId: player.kingdomId,
				resources: { ...player.resources },
				hand: cardIds(player.hand)
			})),
			kingdoms: this.kingdoms.map((kingdom) => ({
				id: kingdom.id,
				name: kingdom.name,
				stats: { ...kingdom.stats }
			})),
			laws: cardIds(this.laws),
			market: cardIds(this.market),
			decks: emptyCardTypeRecord((type) => cardIds(this.decks[type])),
			discards: emptyCardTypeRecord((type) => cardIds(this.discards[type]))
		};
	}

	private restore(value: unknown): void {
		const snapshot = asObject(value);
		if (!snapshot || snapshot.version !== snapshotVersion) return;

		const usedKingdomIds = new SvelteSet<string>();
		const kingdoms: Array<KingdomState> = [];
		if (Array.isArray(snapshot.kingdoms)) {
			for (const raw of snapshot.kingdoms) {
				const record = asObject(raw);
				if (!record) continue;
				kingdoms.push({
					id: uniqueId(record.id, usedKingdomIds),
					name: typeof record.name === 'string' ? record.name : `Regne ${kingdoms.length + 1}`,
					stats: normalizeStats(record.stats)
				});
			}
		}
		this.kingdoms = kingdoms;

		const usedPlayerIds = new SvelteSet<string>();
		const players: Array<PlayerState> = [];
		if (Array.isArray(snapshot.players)) {
			for (const raw of snapshot.players) {
				const record = asObject(raw);
				if (!record) continue;
				const kingdomId =
					typeof record.kingdomId === 'string' && usedKingdomIds.has(record.kingdomId)
						? record.kingdomId
						: null;
				players.push({
					id: uniqueId(record.id, usedPlayerIds),
					name:
						typeof record.name === 'string' && record.name ? record.name : nextPlayerName(players),
					kingdomId,
					resources: normalizeResources(record.resources),
					hand: normalizeRefs(record.hand)
				});
			}
		}
		this.players = players;

		this.laws = normalizeRefs(snapshot.laws, 'law');
		this.market = normalizeRefs(snapshot.market, 'asset');

		const rawDecks = asObject(snapshot.decks);
		const rawDiscards = asObject(snapshot.discards);
		this.decks = emptyCardTypeRecord((type) => normalizeRefs(rawDecks?.[type], type));
		this.discards = emptyCardTypeRecord((type) => normalizeRefs(rawDiscards?.[type], type));
	}
}
