import { cardsCatalog } from '#lib/data/catalog';
import type { CapabilityType } from '#lib/models/capabilities';
import { CardCapability } from '#lib/models/cardcapabilities';
import { type Card, type CardType } from '#lib/models/cards';
import { kingdomStatTypes, type KingdomStatType } from '#lib/models/kingdomstats';
import { officeTypes } from '#lib/models/offices';
import { SvelteSet } from 'svelte/reactivity';
import { deckIdForType, isOfficeTypeKey, officeCardId, type ConcreteTypeKey } from './keyboardnav';
import {
	deckCardType,
	deckIdOf,
	deckIds,
	emptyKingdomStats,
	isOfficeZone,
	kingdomStatMax,
	kingdomStatMin,
	kingdomStatNeutral,
	playerResourceTypes,
	planListOf,
	zoneKey,
	type CardRef,
	type DeckId,
	type KingdomState,
	type PlanListId,
	type PlayerPlan,
	type PlayerPlanView,
	type PlayerResourceType,
	type PlayerResources,
	type PlayerState,
	type PlannableCapability,
	type SimulatorSnapshot,
	type Zone
} from './types';

export const simulatorStorageKey = 'the-kings-council:simulator:v1';

const snapshotVersion = 5;

/** Oldest snapshot version that can still be migrated to the current schema. */
const oldestSnapshotVersion = 1;

let uidCounter = 0;

function makeUid(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	uidCounter += 1;
	return `sim-${Date.now().toString(36)}-${uidCounter}`;
}

function emptyDeckRecord<T>(factory: (deckId: DeckId) => T): Record<DeckId, T> {
	const record = {} as Record<DeckId, T>;
	for (const deckId of deckIds) {
		record[deckId] = factory(deckId);
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

/** New players start with three tokens of each resource type except favour. */
const startingResourceCount = 3;

function startingResources(): PlayerResources {
	const resources = emptyResources();
	for (const type of playerResourceTypes) {
		resources[type] = type === 'favour' ? 0 : startingResourceCount;
	}
	return resources;
}

/** Tactic cards a new player is dealt. */
const startingTacticCount = 3;

/** Capabilities that players can plan: the ones that are played or kept in hand. */
const plannableCapabilityTypes = new Set(['action', 'secret', 'indication']);

function emptyPlan(): PlayerPlan {
	return { actions: [], secrets: [], confirmed: false, inputs: {} };
}

/** Removes repeated entries, keeping the first occurrence of each. */
function uniqueStrings(values: unknown): Array<string> {
	if (!Array.isArray(values)) return [];
	const unique: Array<string> = [];
	for (const value of values) {
		if (typeof value === 'string' && !unique.includes(value)) unique.push(value);
	}
	return unique;
}

function normalizeInputs(value: unknown): Record<string, string> {
	const record = asObject(value);
	const inputs: Record<string, string> = {};
	if (!record) return inputs;
	for (const [key, raw] of Object.entries(record)) {
		if (typeof raw === 'string') inputs[key] = raw;
	}
	return inputs;
}

function normalizePlan(value: unknown): PlayerPlan {
	const record = asObject(value);
	// Plans used to split every capability between an available and a planned list, so the
	// keys of that list seed both new lists, each keeping the capabilities of its type.
	const legacy = uniqueStrings(record?.planned);
	const list = (key: PlanListId) =>
		record?.[key] === undefined ? [...legacy] : uniqueStrings(record[key]);
	return {
		actions: list('actions'),
		secrets: list('secrets'),
		confirmed: record?.confirmed === true,
		inputs: normalizeInputs(record?.inputs)
	};
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

function normalizeRefs(
	value: unknown,
	expectedType?: CardType,
	accepts?: (card: Card) => boolean
): Array<CardRef> {
	if (!Array.isArray(value)) return [];

	const refs: Array<CardRef> = [];
	for (const cardId of value) {
		if (typeof cardId !== 'string') continue;
		const card = cardsCatalog.byId(cardId);
		if (!card || (expectedType && card.type !== expectedType) || (accepts && !accepts(card))) {
			continue;
		}
		refs.push({ uid: makeUid(), cardId: card.id });
	}
	return refs;
}

/** Builds one pile per deck, migrating the single asset pile of old snapshots. */
function normalizeDeckRefs(value: unknown): Record<DeckId, Array<CardRef>> {
	const record = asObject(value);
	const decks = emptyDeckRecord(() => [] as Array<CardRef>);

	for (const deckId of deckIds) {
		decks[deckId] = normalizeRefs(
			record?.[deckId],
			deckCardType(deckId),
			(card) => deckIdOf(card) === deckId
		);
	}

	// Snapshot version 1 kept visible and hidden assets in the same pile.
	const hasSplitAssetPiles =
		Array.isArray(record?.['visible-asset']) || Array.isArray(record?.['hidden-asset']);
	if (!hasSplitAssetPiles && Array.isArray(record?.asset)) {
		for (const ref of normalizeRefs(record.asset, 'asset')) {
			const card = cardsCatalog.byId(ref.cardId);
			if (card) decks[deckIdOf(card)].push(ref);
		}
	}

	// Snapshot versions before 3 kept collective and personal goals in the same pile.
	const hasSplitGoalPiles =
		Array.isArray(record?.['collective-goal']) || Array.isArray(record?.['personal-goal']);
	if (!hasSplitGoalPiles && Array.isArray(record?.goal)) {
		for (const ref of normalizeRefs(record.goal, 'goal')) {
			const card = cardsCatalog.byId(ref.cardId);
			if (card) decks[deckIdOf(card)].push(ref);
		}
	}

	return decks;
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
	decks = $state<Record<DeckId, Array<CardRef>>>(emptyDeckRecord(() => []));
	discards = $state<Record<DeckId, Array<CardRef>>>(emptyDeckRecord(() => []));
	/** Every player, in turn order. Everyone is listed, dimmed until they confirm their plan. */
	turnOrder = $state<Array<string>>([]);

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
		this.discards = emptyDeckRecord(() => []);
		this.turnOrder = [];
	}

	// Players

	/**
	 * Adds a player joining a kingdom optionally, dealt the starting resources and
	 * one house, several tactic and one objective of each kind, drawn from their decks.
	 */
	addPlayer(kingdomId: string | null = null): string {
		const resolvedKingdomId =
			kingdomId && this.kingdoms.some((kingdom) => kingdom.id === kingdomId) ? kingdomId : null;
		const id = makeUid();
		this.players.push({
			id,
			name: nextPlayerName(this.players),
			kingdomId: resolvedKingdomId,
			resources: startingResources(),
			hand: [
				...this.drawFromDeck('house', 1),
				...this.drawFromDeck('tactic', startingTacticCount),
				...this.drawFromDeck('collective-goal', 1),
				...this.drawFromDeck('personal-goal', 1)
			],
			offices: [],
			plan: emptyPlan()
		});
		// Every player takes part in the turn order, dimmed until they confirm their plan.
		this.turnOrder.push(id);
		return id;
	}

	/**
	 * Draws up to `count` cards off a deck, reshuffling its discards first when the
	 * deck runs out so removed players' cards come back into play.
	 */
	private drawFromDeck(deckId: DeckId, count: number): Array<CardRef> {
		const drawn: Array<CardRef> = [];
		for (let index = 0; index < count; index += 1) {
			if (this.decks[deckId].length === 0) {
				const discards = this.discards[deckId];
				if (discards.length === 0) break;
				this.decks[deckId].push(...discards.splice(0));
				shuffle(this.decks[deckId]);
			}

			const ref = this.decks[deckId].pop();
			if (ref) drawn.push(ref);
		}
		return drawn;
	}

	removePlayer(playerId: string): void {
		const index = this.players.findIndex((player) => player.id === playerId);
		if (index < 0) return;

		const [player] = this.players.splice(index, 1);
		for (const ref of player.hand) {
			const card = this.cardOf(ref);
			if (card) this.discards[deckIdOf(card)].push(ref);
		}
		this.returnOffices(player);
		this.turnOrder = this.turnOrder.filter((id) => id !== playerId);
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

	/** Changes one resource, or every resource when `resource` is null. */
	adjustResources(playerId: string, resource: PlayerResourceType | null, delta: number): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;
		const types = resource ? [resource] : playerResourceTypes;
		for (const type of types) this.setResource(playerId, type, player.resources[type] + delta);
	}

	/** Sets one resource, or every resource when `resource` is null. */
	setResources(playerId: string, resource: PlayerResourceType | null, value: number): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;
		const types = resource ? [resource] : playerResourceTypes;
		for (const type of types) this.setResource(playerId, type, value);
	}

	membersOf(kingdomId: string): Array<PlayerState> {
		return this.players.filter((player) => player.kingdomId === kingdomId);
	}

	/** Players that belong to no kingdom, shown as the independents group. */
	independentPlayers(): Array<PlayerState> {
		return this.players.filter((player) => player.kingdomId === null);
	}

	/** The house card the player was dealt, which identifies their house while it is in hand. */
	houseCardOf(player: PlayerState): Card | undefined {
		for (const ref of player.hand) {
			const card = this.cardOf(ref);
			if (card?.type === 'house') return card;
		}

		return undefined;
	}

	// Kingdoms

	addKingdom(): string {
		const id = makeUid();
		this.kingdoms.push({
			id,
			name: nextKingdomName(this.kingdoms),
			stats: emptyKingdomStats(),
			cards: createOfficeRefs()
		});
		return id;
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

	/** Changes one stat, or every stat when `stat` is null. */
	adjustStats(kingdomId: string, stat: KingdomStatType | null, delta: number): void {
		const kingdom = this.kingdoms.find((candidate) => candidate.id === kingdomId);
		if (!kingdom) return;
		const types = stat ? [stat] : kingdomStatTypes;
		for (const type of types) this.setStat(kingdomId, type, kingdom.stats[type] + delta);
	}

	/** Sets one stat, or every stat when `stat` is null. */
	setStats(kingdomId: string, stat: KingdomStatType | null, value: number): void {
		const kingdom = this.kingdoms.find((candidate) => candidate.id === kingdomId);
		if (!kingdom) return;
		const types = stat ? [stat] : kingdomStatTypes;
		for (const type of types) this.setStat(kingdomId, type, value);
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
	 * Capabilities that can be planned, derived from the cards the player holds and from the
	 * common cards, which every player has. Cards with several identical copies get one key
	 * per copy, so each copy can be planned separately.
	 */
	plannableCapabilities(player: PlayerState): Array<PlannableCapability> {
		const capabilities: Array<PlannableCapability> = commonCapabilities.flatMap((cardCapability) =>
			plannableCapabilityTypes.has(cardCapability.capability.type)
				? [{ key: `common:${cardCapability.id}`, cardCapability }]
				: []
		);
		const occurrences: Record<string, number> = {};

		for (const ref of [...player.hand, ...player.offices]) {
			const card = this.cardOf(ref);
			if (!card) continue;

			const occurrence = occurrences[card.id] ?? 0;
			occurrences[card.id] = occurrence + 1;

			card.capabilities.forEach((capability, index) => {
				if (!plannableCapabilityTypes.has(capability.type)) return;
				capabilities.push({
					key: `${card.id}#${occurrence}:${index}`,
					cardCapability: new CardCapability(card, capability, index)
				});
			});
		}

		return capabilities;
	}

	/** The player's plan, completing the persisted order with capabilities gained since. */
	planOf(player: PlayerState): PlayerPlanView {
		const capabilities = this.plannableCapabilities(player);
		// Keys of capabilities the player no longer has, or that moved to another list, are dropped.
		const plannedList = (keys: Array<string>, type: CapabilityType) =>
			uniqueStrings(keys).flatMap((key) => {
				const capability = capabilities.find((candidate) => candidate.key === key);
				return capability && capability.cardCapability.capability.type === type ? [capability] : [];
			});

		return {
			indications: capabilities.filter(
				(capability) => capability.cardCapability.capability.type === 'indication'
			),
			actions: plannedList(player.plan.actions, 'action'),
			secrets: plannedList(player.plan.secrets, 'secret'),
			confirmed: player.plan.confirmed
		};
	}

	/** Fills the persisted plan with the capabilities of the player's current cards. */
	private normalizePlan(player: PlayerState): void {
		const plan = this.planOf(player);
		player.plan.actions = plan.actions.map((capability) => capability.key);
		player.plan.secrets = plan.secrets.map((capability) => capability.key);
	}

	/** The value typed into an `{input …}` field of a player's plan. */
	planInput(playerId: string, key: string): string {
		const player = this.players.find((candidate) => candidate.id === playerId);
		return player?.plan.inputs[key] ?? '';
	}

	/** Stores the value typed into an `{input …}` field of a player's plan. */
	setPlanInput(playerId: string, key: string, value: string): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;

		if (value) player.plan.inputs[key] = value;
		else delete player.plan.inputs[key];
	}

	/** Appends a capability to the plan list of its type, ignoring the ones that cannot be planned. */
	addToPlan(playerId: string, key: string): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;

		this.normalizePlan(player);
		const capability = this.plannableCapabilities(player).find(
			(candidate) => candidate.key === key
		);
		const list = capability && planListOf(capability.cardCapability.capability.type);
		if (!list || player.plan[list].includes(key)) return;

		player.plan[list].push(key);
	}

	/** Removes a capability from the plan. */
	removeFromPlan(playerId: string, key: string): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;

		this.normalizePlan(player);
		const without = (keys: Array<string>) => keys.filter((candidate) => candidate !== key);
		player.plan.actions = without(player.plan.actions);
		player.plan.secrets = without(player.plan.secrets);
	}

	/** Moves a planned capability to another position within its list. */
	moveInPlan(playerId: string, key: string, index: number): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;

		this.normalizePlan(player);
		const list = player.plan.actions.includes(key)
			? player.plan.actions
			: player.plan.secrets.includes(key)
				? player.plan.secrets
				: null;
		const from = list?.indexOf(key) ?? -1;
		if (!list || from < 0) return;

		list.splice(from, 1);
		// Within the same list, the index is taken before the capability was removed.
		const insertAt = from < index ? index - 1 : index;
		list.splice(Math.min(Math.max(insertAt, 0), list.length), 0, key);
	}

	/** Empties the planned capabilities of one type, including the values typed into them. */
	clearPlanList(playerId: string, list: PlanListId): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;

		const removed = player.plan[list];
		for (const key of removed) {
			const prefix = `${key}:`;
			for (const inputKey of Object.keys(player.plan.inputs)) {
				if (inputKey.startsWith(prefix)) delete player.plan.inputs[inputKey];
			}
		}
		player.plan[list] = [];
	}

	/** Empties the plan of a player and unconfirms it. */
	resetPlan(playerId: string): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;

		player.plan.actions = [];
		player.plan.secrets = [];
		player.plan.confirmed = false;
		player.plan.inputs = {};
	}

	/** Confirms a plan, moving the player up with the ones that already confirmed. */
	confirmPlan(playerId: string): void {
		const player = this.players.find((candidate) => candidate.id === playerId);
		if (!player) return;

		this.normalizePlan(player);
		player.plan.confirmed = true;

		const others = this.turnOrder.filter((id) => id !== playerId);
		let insertAt = 0;
		others.forEach((id, index) => {
			const confirmed = this.players.find((candidate) => candidate.id === id)?.plan.confirmed;
			if (confirmed) insertAt = index + 1;
		});
		this.turnOrder = [...others.slice(0, insertAt), playerId, ...others.slice(insertAt)];
	}

	/** Returns every capability of every player to their available list and unconfirms them. */
	resetTurnOrder(): void {
		for (const player of this.players) this.resetPlan(player.id);
	}

	/** Moves a player to another position in the turn order. */
	moveInTurnOrder(playerId: string, index: number): void {
		const from = this.turnOrder.indexOf(playerId);
		if (from < 0) return;

		// The index is taken in the list before the player is removed.
		const [id] = this.turnOrder.splice(from, 1);
		const insertAt = from < index ? index - 1 : index;
		this.turnOrder.splice(Math.min(Math.max(insertAt, 0), this.turnOrder.length), 0, id);
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

	/** Finds a card instance and the zone that currently holds it. */
	findCard(uid: string): { zone: Zone; ref: CardRef } | null {
		const laws = this.laws.find((ref) => ref.uid === uid);
		if (laws) return { zone: { kind: 'laws' }, ref: laws };

		const market = this.market.find((ref) => ref.uid === uid);
		if (market) return { zone: { kind: 'market' }, ref: market };

		for (const deckId of deckIds) {
			const ref = this.decks[deckId].find((candidate) => candidate.uid === uid);
			if (ref) return { zone: { kind: 'deck', deckId }, ref };

			const discarded = this.discards[deckId].find((candidate) => candidate.uid === uid);
			if (discarded) return { zone: { kind: 'discard', deckId }, ref: discarded };
		}

		for (const kingdom of this.kingdoms) {
			const ref = kingdom.cards.find((candidate) => candidate.uid === uid);
			if (ref) {
				const card = this.cardOf(ref);
				return {
					zone:
						card?.type === 'office'
							? { kind: 'kingdom-offices', kingdomId: kingdom.id }
							: { kind: 'kingdom-cards', kingdomId: kingdom.id },
					ref
				};
			}
		}

		for (const player of this.players) {
			const office = player.offices.find((candidate) => candidate.uid === uid);
			if (office) return { zone: { kind: 'player-offices', playerId: player.id }, ref: office };

			const hand = player.hand.find((candidate) => candidate.uid === uid);
			if (hand) return { zone: { kind: 'hand', playerId: player.id }, ref: hand };
		}

		return null;
	}

	/** Moves cards to their deck's discard pile. */
	discardCards(uids: Iterable<string>): void {
		for (const uid of uids) {
			const found = this.findCard(uid);
			if (!found) continue;
			const card = this.cardOf(found.ref);
			if (!card) continue;
			this.moveCard(found.zone, { kind: 'discard', deckId: deckIdOf(card) }, uid);
		}
	}

	/** Returns cards to the top of their deck. */
	returnCardsToDecks(uids: Iterable<string>): void {
		for (const uid of uids) {
			const found = this.findCard(uid);
			if (!found) continue;
			const card = this.cardOf(found.ref);
			if (!card) continue;
			this.moveCard(found.zone, { kind: 'deck', deckId: deckIdOf(card) }, uid);
		}
	}

	/**
	 * Acquires cards for players and kingdoms. Non-office cards are drawn from their deck,
	 * while offices move the kingdom's single copy to the target.
	 */
	acquireCards(
		targets: { playerIds: Iterable<string>; kingdomIds: Iterable<string> },
		amount: number,
		type: ConcreteTypeKey
	): void {
		const count = Math.max(0, Math.floor(amount));
		if (count === 0) return;

		for (const playerId of targets.playerIds) {
			const player = this.players.find((candidate) => candidate.id === playerId);
			if (!player) continue;
			for (let index = 0; index < count; index += 1) this.acquireForPlayer(player, type);
		}

		for (const kingdomId of targets.kingdomIds) {
			const kingdom = this.kingdoms.find((candidate) => candidate.id === kingdomId);
			if (!kingdom) continue;
			for (let index = 0; index < count; index += 1) this.acquireForKingdom(kingdom, type);
		}
	}

	private acquireForPlayer(player: PlayerState, type: ConcreteTypeKey): void {
		if (isOfficeTypeKey(type)) {
			if (!player.kingdomId) return;
			const cardId = officeCardId(type);
			if (player.offices.some((office) => office.cardId === cardId)) return;

			const match = this.findOffice(player.kingdomId, cardId);
			if (!match) return;
			match.offices.splice(match.index, 1);
			player.offices.push(match.ref);
			return;
		}

		const deckId = deckIdForType(type);
		if (!deckId) return;
		const [ref] = this.drawFromDeck(deckId, 1);
		if (ref) player.hand.push(ref);
	}

	private acquireForKingdom(kingdom: KingdomState, type: ConcreteTypeKey): void {
		if (isOfficeTypeKey(type)) {
			const cardId = officeCardId(type);
			if (kingdom.cards.some((office) => office.cardId === cardId)) return;

			const match = this.findOffice(kingdom.id, cardId);
			if (!match) return;
			match.offices.splice(match.index, 1);
			kingdom.cards.push(match.ref);
			return;
		}

		const deckId = deckIdForType(type);
		if (!deckId) return;
		const [ref] = this.drawFromDeck(deckId, 1);
		if (ref) kingdom.cards.push(ref);
	}

	/**
	 * Prepares a market row as the rules describe: one asset per player, half
	 * drawn from the visible assets (rounded up) and half from the hidden ones
	 * (rounded down). Cards already on the market are discarded, as they are at
	 * the start of a turn.
	 */
	refillMarket(): void {
		const rowSize = this.players.length;
		const visibleCount = Math.ceil(rowSize / 2);

		for (const ref of this.market) {
			const card = this.cardOf(ref);
			if (card) this.discards[deckIdOf(card)].push(ref);
		}
		this.market = [];

		this.dealToMarket('visible-asset', visibleCount);
		this.dealToMarket('hidden-asset', rowSize - visibleCount);
	}

	/** Deals up to `count` cards from a deck onto the market. */
	private dealToMarket(deckId: DeckId, count: number): void {
		const deck = this.decks[deckId];
		for (let dealt = 0; dealt < count && deck.length > 0; dealt += 1) {
			const ref = deck.pop();
			if (ref) this.market.push(ref);
		}
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
				this.kingdoms.find((kingdom) => kingdom.id === this.officeKingdomId(source))?.cards ?? null;
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
			kingdom.cards,
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
				return this.kingdoms.find((kingdom) => kingdom.id === zone.kingdomId)?.cards ?? null;
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
		if (kingdom) kingdom.cards.push(...player.offices);
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
				return this.decks[zone.deckId];
			case 'discard':
				return this.discards[zone.deckId];
			case 'kingdom-cards':
				return this.kingdoms.find((kingdom) => kingdom.id === zone.kingdomId)?.cards ?? null;
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
				return deckIdOf(card) === target.deckId;
			case 'kingdom-cards':
				return true;
			case 'kingdom-offices':
			case 'player-offices':
				return card.type === 'office';
		}
	}

	private createFullDecks(): Record<DeckId, Array<CardRef>> {
		const decks = emptyDeckRecord(() => [] as Array<CardRef>);
		for (const card of cardsCatalog.all()) {
			// Common action cards are reference cards and offices belong to kingdoms,
			// so neither type is drawn from a deck.
			if (card.type === 'common' || card.type === 'office') continue;
			for (let copy = 0; copy < card.copies; copy += 1) {
				decks[deckIdOf(card)].push({ uid: makeUid(), cardId: card.id });
			}
		}
		for (const deckId of deckIds) {
			shuffle(decks[deckId]);
		}
		return decks;
	}

	private toSnapshot(): SimulatorSnapshot {
		const cardIds = (refs: Array<CardRef>) => refs.map((ref) => ref.cardId);

		return {
			version: snapshotVersion,
			players: this.players.map((player) => {
				const plan = this.planOf(player);
				return {
					id: player.id,
					name: player.name,
					kingdomId: player.kingdomId,
					resources: { ...player.resources },
					hand: cardIds(player.hand),
					offices: cardIds(player.offices),
					plan: {
						actions: plan.actions.map((capability) => capability.key),
						secrets: plan.secrets.map((capability) => capability.key),
						confirmed: plan.confirmed,
						inputs: { ...player.plan.inputs }
					}
				};
			}),
			kingdoms: this.kingdoms.map((kingdom) => ({
				id: kingdom.id,
				name: kingdom.name,
				stats: { ...kingdom.stats },
				cards: cardIds(kingdom.cards)
			})),
			laws: cardIds(this.laws),
			market: cardIds(this.market),
			decks: emptyDeckRecord((deckId) => cardIds(this.decks[deckId])),
			discards: emptyDeckRecord((deckId) => cardIds(this.discards[deckId])),
			turnOrder: [...this.turnOrder]
		};
	}

	private restore(value: unknown): void {
		const snapshot = asObject(value);
		const version = asNumber(snapshot?.version, 0);
		if (!snapshot || version < oldestSnapshotVersion || version > snapshotVersion) return;

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
					// New snapshots store a general card list; older ones only kept the
					// kingdom's unassigned offices, and the earliest had no offices at all.
					cards: Array.isArray(record.cards)
						? normalizeRefs(record.cards)
						: Array.isArray(record.offices)
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
					offices: kingdomId === null ? [] : normalizeRefs(record.offices, 'office'),
					plan: normalizePlan(record.plan)
				});
			}
		}
		this.players = players;

		const playerIds = new SvelteSet(players.map((player) => player.id));
		const turnOrder = Array.isArray(snapshot.turnOrder) ? snapshot.turnOrder : [];
		this.turnOrder = uniqueStrings(turnOrder).filter((id) => playerIds.has(id));
		// The list holds every player, so those missing from older snapshots join it at the end.
		for (const player of players) {
			if (!this.turnOrder.includes(player.id)) this.turnOrder.push(player.id);
		}

		this.laws = normalizeRefs(snapshot.laws, 'law');
		this.market = normalizeRefs(snapshot.market, 'asset');

		this.decks = normalizeDeckRefs(snapshot.decks);
		this.discards = normalizeDeckRefs(snapshot.discards);
	}
}
