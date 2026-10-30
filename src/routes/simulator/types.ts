import type { CardType } from '#lib/models/cards';
import { kingdomStatTypes, type KingdomStatType } from '#lib/models/kingdomstats';
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

/** A card in play, identified by its catalog card and a per-instance id. */
export interface CardRef {
	uid: string;
	cardId: string;
}

/** A place where cards can live. Decks are face-down, the rest are face-up. */
export type Zone =
	| { kind: 'hand'; playerId: string }
	| { kind: 'laws' }
	| { kind: 'market' }
	| { kind: 'deck'; cardType: CardType }
	| { kind: 'discard'; cardType: CardType }
	| { kind: 'kingdom-offices'; kingdomId: string }
	| { kind: 'player-offices'; playerId: string };

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
	offices: Array<CardRef>;
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
	offices?: Array<string>;
}

export interface SimulatorSnapshot {
	version: number;
	players: Array<SerializedPlayer>;
	kingdoms: Array<SerializedKingdom>;
	laws: Array<string>;
	market: Array<string>;
	decks: Record<CardType, Array<string>>;
	discards: Record<CardType, Array<string>>;
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
			return `${zone.kind}:${zone.cardType}`;
		case 'kingdom-offices':
			return `kingdom-offices:${zone.kingdomId}`;
		case 'player-offices':
			return `player-offices:${zone.playerId}`;
	}
}
