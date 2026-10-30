import { getOfficeName, type OfficeType } from '#lib/models/offices';
import type { Card, CardType } from '#lib/models/cards';
import type { SimulatorState } from './simulatorstate.svelte';
import {
	compareCards,
	deckIdsInPlay,
	independentKingdomId,
	type CardRef,
	type DeckId,
	type KingdomState,
	type PlayerState,
	type Zone
} from './types';

export { independentKingdomId };

/** A kingdom panel, with the independents group standing in for a kingdom without one. */
export interface KingdomGroup {
	id: string;
	kingdom: KingdomState | null;
	players: Array<PlayerState>;
}

export function kingdomGroups(simulator: SimulatorState): Array<KingdomGroup> {
	return [
		{ id: independentKingdomId, kingdom: null, players: simulator.independentPlayers() },
		...simulator.kingdoms.map((kingdom) => ({
			id: kingdom.id,
			kingdom,
			players: simulator.membersOf(kingdom.id)
		}))
	];
}

export function kingdomIdsInOrder(simulator: SimulatorState): Array<string> {
	return [independentKingdomId, ...simulator.kingdoms.map((kingdom) => kingdom.id)];
}

export function groupIdOfPlayer(player: PlayerState): string {
	return player.kingdomId ?? independentKingdomId;
}

export function groupIdsOfPlayers(players: Iterable<PlayerState>): Set<string> {
	return new Set([...players].map(groupIdOfPlayer));
}

export function playersInGroups(
	simulator: SimulatorState,
	groupIds: ReadonlySet<string>
): Array<PlayerState> {
	return kingdomGroups(simulator)
		.filter((group) => groupIds.has(group.id))
		.flatMap((group) => group.players);
}

/** Players in the order they are rendered: independents first, then each kingdom. */
export function orderedPlayers(
	simulator: SimulatorState,
	groupIds?: ReadonlySet<string>
): Array<PlayerState> {
	return kingdomGroups(simulator)
		.filter((group) => !groupIds || groupIds.has(group.id))
		.flatMap((group) => group.players);
}

export interface CardEntry {
	uid: string;
	card: Card;
	zone: Zone;
	/** Kingdom group the card belongs to, directly or through its owning player. */
	groupId: string | null;
	playerId: string | null;
	/** Owning kingdom for cards in a kingdom's card list, or the player's kingdom. */
	kingdomId: string | null;
}

function sortedCards(
	simulator: SimulatorState,
	refs: ReadonlyArray<CardRef>
): Array<{ ref: CardRef; card: Card }> {
	const entries: Array<{ ref: CardRef; card: Card }> = [];
	for (const ref of refs) {
		const card = simulator.cardOf(ref);
		if (card) entries.push({ ref, card });
	}
	return entries.sort((a, b) => compareCards(a.card, b.card));
}

/**
 * Every card pill currently rendered, in visual order: laws and market, the independents,
 * each kingdom (its cards, then its players), and finally the visible discard tops.
 */
export function orderedCards(simulator: SimulatorState): Array<CardEntry> {
	const entries: Array<CardEntry> = [];

	for (const ref of simulator.laws) {
		const card = simulator.cardOf(ref);
		if (card) {
			entries.push({
				uid: ref.uid,
				card,
				zone: { kind: 'laws' },
				groupId: null,
				playerId: null,
				kingdomId: null
			});
		}
	}

	for (const ref of simulator.market) {
		const card = simulator.cardOf(ref);
		if (card) {
			entries.push({
				uid: ref.uid,
				card,
				zone: { kind: 'market' },
				groupId: null,
				playerId: null,
				kingdomId: null
			});
		}
	}

	for (const group of kingdomGroups(simulator)) {
		if (group.kingdom) {
			const kingdomId = group.kingdom.id;
			for (const { ref, card } of sortedCards(simulator, group.kingdom.cards)) {
				entries.push({
					uid: ref.uid,
					card,
					zone:
						card.type === 'office'
							? { kind: 'kingdom-offices', kingdomId }
							: { kind: 'kingdom-cards', kingdomId },
					groupId: kingdomId,
					playerId: null,
					kingdomId
				});
			}
		}

		for (const player of group.players) {
			for (const { ref, card } of sortedCards(simulator, [...player.offices, ...player.hand])) {
				entries.push({
					uid: ref.uid,
					card,
					zone:
						card.type === 'office'
							? { kind: 'player-offices', playerId: player.id }
							: { kind: 'hand', playerId: player.id },
					groupId: group.id,
					playerId: player.id,
					kingdomId: group.kingdom?.id ?? null
				});
			}
		}
	}

	for (const deckId of deckIdsInPlay) {
		const discards = simulator.discards[deckId];
		const top = discards[discards.length - 1];
		if (!top) continue;
		const card = simulator.cardOf(top);
		if (card) {
			entries.push({
				uid: top.uid,
				card,
				zone: { kind: 'discard', deckId },
				groupId: null,
				playerId: null,
				kingdomId: null
			});
		}
	}

	return entries;
}

export function groupsOfCards(entries: Iterable<CardEntry>): Set<string> {
	const groups = new Set<string>();
	for (const entry of entries) {
		if (entry.groupId) groups.add(entry.groupId);
	}
	return groups;
}

export function playerIdsOfCards(entries: Iterable<CardEntry>): Set<string> {
	const players = new Set<string>();
	for (const entry of entries) {
		if (entry.playerId) players.add(entry.playerId);
	}
	return players;
}

export function cardsOfGroups(
	simulator: SimulatorState,
	groupIds: ReadonlySet<string>
): Array<CardEntry> {
	return orderedCards(simulator).filter(
		(entry) => entry.groupId !== null && groupIds.has(entry.groupId)
	);
}

export function cardsOfPlayers(
	simulator: SimulatorState,
	playerIds: ReadonlySet<string>
): Array<CardEntry> {
	return orderedCards(simulator).filter(
		(entry) => entry.playerId !== null && playerIds.has(entry.playerId)
	);
}

/**
 * The card pills navigation should move within when card pills are selected: the cards of
 * the owning players, or all cards of a directly owning kingdom. Cards without an owner
 * (laws, market, discards) fall back to every visible pill.
 */
export function cardScope(simulator: SimulatorState, selected: Iterable<string>): Array<CardEntry> {
	const entries = orderedCards(simulator);
	const selectedIds = new Set(selected);
	const ownerPlayers = new Set<string>();
	const ownerKingdoms = new Set<string>();
	let hasOwner = false;

	for (const entry of entries) {
		if (!selectedIds.has(entry.uid)) continue;
		if (entry.playerId) {
			ownerPlayers.add(entry.playerId);
			hasOwner = true;
		} else if (entry.kingdomId) {
			ownerKingdoms.add(entry.kingdomId);
			hasOwner = true;
		}
	}

	if (!hasOwner) return entries;

	return entries.filter((entry) => {
		if (entry.playerId && ownerPlayers.has(entry.playerId)) return true;
		if (entry.kingdomId && ownerKingdoms.has(entry.kingdomId)) return true;
		return false;
	});
}

export const concreteTypeKeys = [
	't',
	'v',
	'h',
	'p',
	'c',
	'K',
	'M',
	'B',
	'T',
	'C',
	'S',
	'J'
] as const;
export const nonConcreteTypeKeys = ['a', 'o'] as const;

export type ConcreteTypeKey = (typeof concreteTypeKeys)[number];
export type NonConcreteTypeKey = (typeof nonConcreteTypeKeys)[number];
export type TypeKey = ConcreteTypeKey | NonConcreteTypeKey;
export type OfficeTypeKey = 'K' | 'M' | 'B' | 'T' | 'C' | 'S' | 'J';

const officeTypeByKey: Record<OfficeTypeKey, OfficeType> = {
	K: 'king',
	M: 'marshal',
	B: 'bishop',
	T: 'treasurer',
	C: 'chancellor',
	S: 'spy-master',
	J: 'jester'
};

const deckByType: Record<Exclude<ConcreteTypeKey, OfficeTypeKey>, DeckId> = {
	t: 'tactic',
	v: 'visible-asset',
	h: 'hidden-asset',
	p: 'personal-goal',
	c: 'collective-goal'
};

export function isConcreteTypeKey(key: string): key is ConcreteTypeKey {
	return (concreteTypeKeys as ReadonlyArray<string>).includes(key);
}

export function isTypeKey(key: string): key is TypeKey {
	return isConcreteTypeKey(key) || (nonConcreteTypeKeys as ReadonlyArray<string>).includes(key);
}

export function isOfficeTypeKey(key: string): key is OfficeTypeKey {
	return key in officeTypeByKey;
}

/** The card id of a concrete office selector. */
export function officeCardId(key: OfficeTypeKey): string {
	return officeTypeByKey[key];
}

/** The deck a concrete selector is drawn from, or `null` for offices. */
export function deckIdForType(key: ConcreteTypeKey): DeckId | null {
	if (isOfficeTypeKey(key)) return null;
	return deckByType[key];
}

const cardTypeByKey: Partial<Record<ConcreteTypeKey, CardType>> = {
	t: 'tactic',
	v: 'asset',
	h: 'asset',
	p: 'goal',
	c: 'goal'
};

export function matchesType(card: Card, key: TypeKey): boolean {
	if (isOfficeTypeKey(key)) {
		return card.type === 'office' && card.id === officeTypeByKey[key];
	}
	if (key === 'a') return card.type === 'asset';
	if (key === 'o') return card.type === 'office';

	const type = cardTypeByKey[key];
	if (!type || card.type !== type) return false;

	switch (key) {
		case 'v':
			return !card.hidden;
		case 'h':
			return card.hidden;
		case 'p':
			return card.type === 'goal' && card.goalType === 'personal';
		case 'c':
			return card.type === 'goal' && card.goalType === 'collective';
		default:
			return true;
	}
}

export function typeLabel(key: TypeKey): string {
	if (isOfficeTypeKey(key)) return getOfficeName(officeTypeByKey[key]);
	switch (key) {
		case 't':
			return 'Tàctica';
		case 'v':
			return 'Actiu visible';
		case 'h':
			return 'Actiu ocult';
		case 'p':
			return 'Objectiu personal';
		case 'c':
			return 'Objectiu col·lectiu';
		case 'a':
			return 'Actiu';
		case 'o':
			return 'Càrrec';
	}
}
