import { cardsCatalog } from '#lib/data/catalog';
import { CardCapability } from '#lib/models/cardcapabilities';
import { cardTypes, type Card, type CardType } from '#lib/models/cards';
import { kingdomStatTypes, type KingdomStatType } from '#lib/models/kingdomstats';
import { officeTypes } from '#lib/models/offices';
import { SvelteSet } from 'svelte/reactivity';
import {
	emptyKingdomStats,
	isOfficeZone,
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

/** Names handed out to new kingdoms, in order, before falling back to numbered names. */
const defaultKingdomNames: ReadonlyArray<string> = [
	'Rostrad',
	'Velaria',
	'Zarmul',
	'Bergen',
	'Garlan',
	'Thul',
	'Moldara',
	'Elkengrad',
	'Dunhal',
	'Kelethor'
];

function nextKingdomName(kingdoms: ReadonlyArray<KingdomState>): string {
	const used = new Set(kingdoms.map((kingdom) => kingdom.name));
	const available = defaultKingdomNames.find((name) => !used.has(name));
	if (available) return available;

	let index = 1;
	while (used.has(`Regne ${index}`)) {
		index += 1;
	}
	return `Regne ${index}`;
}

/** Every player owns one capability card of each common action. */
const commonCapabilities: ReadonlyArray<CardCapability> = cardsCatalog
	.all()
	.filter((card) => card.type === 'common')
	.flatMap((card) =>
		card.capabilities.map((capability, index) => new CardCapability(card, capability, index))
	);

/** One office card of each available office, in a stable order. */
function createOfficeRefs(): Array<CardRef> {
	const refs: Array<CardRef> = [];
	for (const type of officeTypes) {
		const card = cardsCatalog.byId(type);
		if (card?.type === 'office') refs.push({ uid: makeUid(), cardId: card.id });
	}
	return refs;
}

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
			hand: [],
			offices: []
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
		this.returnOffices(player);
	}

	assignKingdom(playerId: string, kingdomId: string | null): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;

		const nextKingdomId =
			kingdomId && this.kingdoms.some((kingdom) => kingdom.id === kingdomId) ? kingdomId : null;
		if (player.kingdomId === nextKingdomId) return;

		// Offices are kingdom-bound, so they stay behind when a player changes kingdom.
		this.returnOffices(player);
		player.kingdomId = nextKingdomId;
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
			name: nextKingdomName(this.kingdoms),
			stats: emptyKingdomStats(),
			offices: createOfficeRefs()
		});
	}

	removeKingdom(kingdomId: string): void {
		const index = this.kingdoms.findIndex((kingdom) => kingdom.id === kingdomId);
		if (index < 0) return;

		this.kingdoms.splice(index, 1);
		for (const player of this.players) {
			if (player.kingdomId !== kingdomId) continue;
			player.kingdomId = null;
			player.offices = [];
		}
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
		for (const ref of [...player.offices, ...player.hand]) {
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
		if (isOfficeZone(source) || isOfficeZone(target)) {
			this.moveOffice(source, target, uid);
			return;
		}

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

	// Offices

	/**
	 * Moves an office between a kingdom and its players. Offices never leave the
	 * kingdom they belong to: dropping one onto a player of another kingdom assigns
	 * that kingdom's copy of the office instead.
	 */
	private moveOffice(source: Zone, target: Zone, uid?: string): void {
		if (!isOfficeZone(source) || !isOfficeZone(target)) return;

		const sourceOffices = this.officesIn(source);
		if (!sourceOffices) return;

		const index = sourceOffices.findIndex((ref) => ref.uid === uid);
		if (index < 0) return;
		const ref = sourceOffices[index];

		if (target.kind === 'kingdom-offices') {
			if (source.kind !== 'player-offices') return;

			// Assigned offices always return to the kingdom of their holder.
			const kingdomOffices =
				this.kingdoms.find((kingdom) => kingdom.id === this.officeKingdomId(source))?.offices ??
				null;
			if (!kingdomOffices) return;

			sourceOffices.splice(index, 1);
			kingdomOffices.push(ref);
			return;
		}

		const player = this.players.find((candidate) => candidate.id === target.playerId);
		if (!player) return;

		// Dropping an office on a kingdomless player makes them join its kingdom.
		if (!player.kingdomId) {
			const kingdomId = this.officeKingdomId(source);
			if (!kingdomId) return;
			player.kingdomId = kingdomId;
		}

		const kingdomId = player.kingdomId;
		if (!kingdomId) return;

		// Reassigning within a kingdom moves the office itself, not another copy.
		if (source.kind === 'player-offices' && this.officeKingdomId(source) === kingdomId) {
			sourceOffices.splice(index, 1);
			player.offices.push(ref);
			return;
		}

		if (player.offices.some((office) => office.cardId === ref.cardId)) return;

		const match = this.findOffice(kingdomId, ref.cardId);
		if (match) {
			match.offices.splice(match.index, 1);
			player.offices.push(match.ref);
			return;
		}

		// Fallback for an office missing from the player's kingdom.
		sourceOffices.splice(index, 1);
		player.offices.push(ref);
	}

	/** Finds a kingdom's copy of an office, whether in its reserve or held by a member. */
	private findOffice(
		kingdomId: string,
		cardId: string
	): { offices: Array<CardRef>; index: number; ref: CardRef } | null {
		const kingdom = this.kingdoms.find((candidate) => candidate.id === kingdomId);
		if (!kingdom) return null;

		const pools = [
			kingdom.offices,
			...this.players
				.filter((player) => player.kingdomId === kingdomId)
				.map((player) => player.offices)
		];
		for (const offices of pools) {
			const index = offices.findIndex((office) => office.cardId === cardId);
			if (index >= 0) return { offices, index, ref: offices[index] };
		}
		return null;
	}

	private officesIn(zone: Zone): Array<CardRef> | null {
		switch (zone.kind) {
			case 'kingdom-offices':
				return this.kingdoms.find((kingdom) => kingdom.id === zone.kingdomId)?.offices ?? null;
			case 'player-offices':
				return this.players.find((player) => player.id === zone.playerId)?.offices ?? null;
			default:
				return null;
		}
	}

	private officeKingdomId(zone: Zone): string | null {
		switch (zone.kind) {
			case 'kingdom-offices':
				return zone.kingdomId;
			case 'player-offices':
				return this.players.find((player) => player.id === zone.playerId)?.kingdomId ?? null;
			default:
				return null;
		}
	}

	/** Returns a player's offices to its kingdom, if it still exists. */
	private returnOffices(player: PlayerState): void {
		if (player.offices.length === 0) return;
		const kingdom = this.kingdoms.find((candidate) => candidate.id === player.kingdomId);
		if (kingdom) kingdom.offices.push(...player.offices);
		player.offices = [];
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
			default:
				return this.officesIn(zone);
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
			case 'kingdom-offices':
			case 'player-offices':
				return card.type === 'office';
		}
	}

	private createFullDecks(): Record<CardType, Array<CardRef>> {
		const decks = emptyCardTypeRecord(() => [] as Array<CardRef>);
		for (const card of cardsCatalog.all()) {
			// Common action cards are reference cards and offices belong to kingdoms,
			// so neither type is drawn from a deck.
			if (card.type === 'common' || card.type === 'office') continue;
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
				hand: cardIds(player.hand),
				offices: cardIds(player.offices)
			})),
			kingdoms: this.kingdoms.map((kingdom) => ({
				id: kingdom.id,
				name: kingdom.name,
				stats: { ...kingdom.stats },
				offices: cardIds(kingdom.offices)
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
					name:
						typeof record.name === 'string' && record.name
							? record.name
							: nextKingdomName(kingdoms),
					stats: normalizeStats(record.stats),
					// Snapshots from before offices existed start with a full set.
					offices: Array.isArray(record.offices)
						? normalizeRefs(record.offices, 'office')
						: createOfficeRefs()
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
					hand: normalizeRefs(record.hand),
					offices: kingdomId === null ? [] : normalizeRefs(record.offices, 'office')
				});
			}
		}
		this.players = players;

		this.laws = normalizeRefs(snapshot.laws, 'law');
		this.market = normalizeRefs(snapshot.market, 'asset');

		const rawDecks = asObject(snapshot.decks);
		const rawDiscards = asObject(snapshot.discards);
		// Offices are no longer dealt from a deck; ignore any office deck in old snapshots.
		this.decks = emptyCardTypeRecord((type) =>
			type === 'office' ? [] : normalizeRefs(rawDecks?.[type], type)
		);
		this.discards = emptyCardTypeRecord((type) => normalizeRefs(rawDiscards?.[type], type));
	}
}
