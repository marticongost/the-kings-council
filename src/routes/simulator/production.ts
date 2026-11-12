import type { KingdomStatType } from '#lib/models/kingdomstats';
import type { OfficeType } from '#lib/models/offices';
import type { PlayerResourceType } from './types';

/** Player resources a kingdom produces, in the order they are distributed. Prestige is excluded. */
export const productionResourceTypes = [
	'gold',
	'power',
	'strength',
	'faith',
	'intrigue',
	'favour'
] as const satisfies ReadonlyArray<PlayerResourceType>;

export type ProductionResourceType = (typeof productionResourceTypes)[number];

/** Resources a kingdomless player may choose from during production; favour is not offered. */
export const independentProductionResourceTypes = [
	'gold',
	'power',
	'strength',
	'faith',
	'intrigue'
] as const satisfies ReadonlyArray<ProductionResourceType>;

/** Units a kingdomless player receives during production, freely combined across resource types. */
export const independentProductionResourceCount = 3;

/** Production factors by kingdom stat value, following the production table in the rules. */
const productionFactors = [
	{ value: 1, factor: 0.5 },
	{ value: 2, factor: 1 },
	{ value: 3, factor: 1.5 },
	{ value: 4, factor: 2 },
	{ value: 5, factor: 2.5 }
] as const;

export function productionFactor(stat: number): number {
	return productionFactors.find(({ value }) => value === stat)?.factor ?? 0;
}

/** The kingdom stat driving the production of a resource, evaluated to a 1-5 value. */
export function productionStatValue(
	resource: ProductionResourceType,
	stats: Record<KingdomStatType, number>
): number {
	switch (resource) {
		case 'gold':
			return stats.wealth;
		case 'power':
			return stats.stability;
		case 'strength':
			return stats.might;
		case 'faith':
			return stats.grace;
		case 'intrigue':
			return 6 - stats.stability;
		case 'favour':
			return Math.min(stats.wealth, stats.stability, stats.might, stats.grace);
	}
}

/** How much of each resource a kingdom produces from its member count and stats. */
export function kingdomProduction(
	memberCount: number,
	stats: Record<KingdomStatType, number>
): Record<ProductionResourceType, number> {
	const produced = {} as Record<ProductionResourceType, number>;
	for (const resource of productionResourceTypes) {
		produced[resource] = Math.ceil(
			memberCount * productionFactor(productionStatValue(resource, stats))
		);
	}
	return produced;
}

/** The office responsible for distributing a produced resource. */
export function productionOffice(resource: ProductionResourceType): OfficeType {
	switch (resource) {
		case 'gold':
			return 'treasurer';
		case 'power':
			return 'chancellor';
		case 'strength':
			return 'marshal';
		case 'faith':
			return 'bishop';
		case 'intrigue':
			return 'spy-master';
		case 'favour':
			return 'king';
	}
}

/** Key under which the distribution of one kingdom resource is stored. */
export function productionKey(kingdomId: string, resource: ProductionResourceType): string {
	return `${kingdomId}:${resource}`;
}

/** The amounts assigned to each player of one production step, plus its applied flags. */
export interface ProductionDistribution {
	/** Player ids receiving the remainder unit of an even, non-favour split. */
	extras: Array<string>;
	/** Whether the responsible player kept the privilege unit (non-favour resources only). */
	privilege: boolean;
	/** Free-form amounts for favour, keyed by player id. */
	assigned: Record<string, number>;
	/** Whether the distribution has already been paid out to the players. */
	applied: boolean;
}

/** The scratch state of the production phase, persisted with the game. */
export interface ProductionState {
	/** Distributions of the kingdom steps, keyed by {@link productionKey}. */
	distributions: Record<string, ProductionDistribution>;
	/** Resources chosen by each kingdomless player, keyed by player id. */
	independent: Record<string, Array<ProductionResourceType>>;
	/** Whether the kingdomless production has been paid out. */
	independentApplied: boolean;
}

export function emptyProductionState(): ProductionState {
	return { distributions: {}, independent: {}, independentApplied: false };
}
