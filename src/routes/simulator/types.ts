import { getCardBackgroundName, type CardBackgroundName } from '#lib/cardattributes';
import type { Card, CardType } from '#lib/models/cards';
import { kingdomStatTypes, type KingdomStatType } from '#lib/models/kingdomstats';
import { officeTypes } from '#lib/models/offices';
import type { ResourceType } from '#lib/models/resources';

/** Resources owned by a player (the generic `any` resource has no tokens). */
export const playerResourceTypes = [
	'power',
	'gold',
	'strength',
	'faith',
	'intrigue',
	'favour',
	'prestige'
] as const satisfies ReadonlyArray<ResourceType>;

export type PlayerResourceType = (typeof playerResourceTypes)[number];

export type PlayerResources = Record<PlayerResourceType, number>;

export type KingdomStats = Record<KingdomStatType, number>;

export const kingdomStatMin = 1;
export const kingdomStatMax = 5;
export const kingdomStatNeutral = 3;

export function emptyKingdomStats(): KingdomStats {
	const stats = {} as KingdomStats;
	for (const type of kingdomStatTypes) {
		stats[type] = kingdomStatNeutral;
	}
	return stats;
}

export const simulatorDragMime = 'application/x-kings-council-simulator';

/** Set alongside `simulatorDragMime` so panels can recognise office drags while over them. */
export const officeDragMime = 'application/x-kings-council-office';

/** Set when dragging a player, so kingdoms can adopt it while it hovers over them. */
export const playerDragMime = 'application/x-kings-council-player';

/** A card in play, identified by its catalog card and a per-instance id. */
export interface CardRef {
	uid: string;
	cardId: string;
}

/**
 * A face-down pile: one per card type, except assets, which split by visibility,
 * and goals, which split between collective and personal objectives.
 */
export const deckIds = [
	'common',
	'office',
	'collective-goal',
	'personal-goal',
	'event',
	'crisis',
	'law',
	'tactic',
	'visible-asset',
	'hidden-asset',
	'house'
] as const;

export type DeckId = (typeof deckIds)[number];

/** Decks rendered in the decks bar. Common actions are reference cards, and offices live in kingdoms. */
export const deckIdsInPlay = deckIds.filter((deckId) => deckId !== 'common' && deckId !== 'office');

/** Identifies the independent players panel when it acts as a kingdom. */
export const independentKingdomId = '__independents__';

/** A place where cards can live. Decks are face-down, the rest are face-up. */
export type Zone =
	| { kind: 'hand'; playerId: string }
	| { kind: 'laws' }
	| { kind: 'market' }
	| { kind: 'deck'; deckId: DeckId }
	| { kind: 'discard'; deckId: DeckId }
	| { kind: 'kingdom-cards'; kingdomId: string }
	| { kind: 'kingdom-offices'; kingdomId: string }
	| { kind: 'player-offices'; playerId: string };

/** The deck a card belongs to when it is face down. */
export function deckIdOf(card: Card): DeckId {
	if (card.type === 'asset') return card.hidden ? 'hidden-asset' : 'visible-asset';
	if (card.type === 'goal') return `${card.goalType}-goal`;
	return card.type;
}

/** The order in which cards in play are grouped when rendered. */
const cardDisplayOrder = [
	'house',
	'collective-goal',
	'personal-goal',
	'office',
	'hidden-asset',
	'asset',
	'tactic'
] as const satisfies ReadonlyArray<CardBackgroundName>;

const cardRanks = new Map<CardBackgroundName, number>(
	cardDisplayOrder.map((name, index) => [name, index] as const)
);

const officeRanks = new Map<string, number>(officeTypes.map((type, index) => [type, index]));

/** Cards outside the listed groups, such as laws or events, are grouped last. */
function cardOrder(card: Card): number {
	return cardRanks.get(getCardBackgroundName(card)) ?? cardDisplayOrder.length;
}

/**
 * Sorts cards into display groups, keeping offices in their canonical order
 * regardless of assignment history.
 */
export function compareCards(a: Card, b: Card): number {
	const byGroup = cardOrder(a) - cardOrder(b);
	if (byGroup !== 0) return byGroup;
	if (a.type !== 'office' || b.type !== 'office') return 0;

	const rankA = officeRanks.get(a.id) ?? Number.MAX_SAFE_INTEGER;
	const rankB = officeRanks.get(b.id) ?? Number.MAX_SAFE_INTEGER;
	return rankA - rankB;
}

/** The card type a deck holds. Split asset and goal decks hold their base card type. */
export function deckCardType(deckId: DeckId): CardType {
	if (deckId === 'visible-asset' || deckId === 'hidden-asset') return 'asset';
	if (deckId === 'collective-goal' || deckId === 'personal-goal') return 'goal';
	return deckId;
}

/** Zones holding unassigned (kingdom) or assigned (player) offices. */
export function isOfficeZone(
	zone: Zone
): zone is Extract<Zone, { kind: 'kingdom-offices' } | { kind: 'player-offices' }> {
	return zone.kind === 'kingdom-offices' || zone.kind === 'player-offices';
}

export interface DragPayload {
	source: Zone;
	uid?: string;
}

export interface PlayerDragPayload {
	playerId: string;
}

export interface PlayerState {
	id: string;
	name: string;
	kingdomId: string | null;
	resources: PlayerResources;
	hand: Array<CardRef>;
	offices: Array<CardRef>;
}

export interface KingdomState {
	id: string;
	name: string;
	stats: KingdomStats;
	/** Any card attached to the kingdom, including its unassigned offices. */
	cards: Array<CardRef>;
}

export interface SerializedPlayer {
	id: string;
	name: string;
	kingdomId: string | null;
	resources: Partial<PlayerResources>;
	hand: Array<string>;
	offices?: Array<string>;
}

export interface SerializedKingdom {
	id: string;
	name: string;
	stats: KingdomStats;
	cards?: Array<string>;
}

export interface SimulatorSnapshot {
	version: number;
	players: Array<SerializedPlayer>;
	kingdoms: Array<SerializedKingdom>;
	laws: Array<string>;
	market: Array<string>;
	decks: Record<DeckId, Array<string>>;
	discards: Record<DeckId, Array<string>>;
}

export function zoneKey(zone: Zone): string {
	switch (zone.kind) {
		case 'hand':
			return `hand:${zone.playerId}`;
		case 'laws':
		case 'market':
			return zone.kind;
		case 'deck':
		case 'discard':
			return `${zone.kind}:${zone.deckId}`;
		case 'kingdom-cards':
			return `kingdom-cards:${zone.kingdomId}`;
		case 'kingdom-offices':
			return `kingdom-offices:${zone.kingdomId}`;
		case 'player-offices':
			return `player-offices:${zone.playerId}`;
	}
}
