import { buildCapability, type Capability, type CapabilitySpec } from './capabilities';
import { getProperty, type Property, type PropertyId } from './properties';
import { ResourceSet, type ResourceSetProps } from './resourcesets';

export const cardTypes = [
	'common',
	'office',
	'goal',
	'event',
	'crisis',
	'law',
	'tactic',
	'asset',
	'house'
] as const;

export type CardType = (typeof cardTypes)[number];

export interface CardData {
	title: string;
	capabilities?: ReadonlyArray<CapabilitySpec>;
	properties?: ReadonlyArray<PropertyId>;
	/** Number of physical copies of this card included in its deck. */
	copies?: number;
}

export abstract class BaseCard {
	readonly id: string;
	readonly title: string;
	readonly capabilities: Array<Capability>;
	readonly copies: number;
	abstract readonly type: CardType;
	private readonly ownProperties: ReadonlyArray<PropertyId>;

	constructor(id: string, { title, capabilities, properties, copies = 1 }: CardData) {
		this.id = id;
		this.title = title;
		this.capabilities = capabilities ? capabilities.map(buildCapability) : [];
		this.copies = copies;
		this.ownProperties = properties ?? [];
	}

	/**
	 * Indicates whether the card is kept secret from other players (true) or must be
	 * shown publicly (false).
	 */
	get hidden(): boolean {
		return true;
	}

	get properties(): ReadonlySet<Property> {
		return new Set([this.type, ...this.ownProperties].map(getProperty));
	}
}

export type CommonData = CardData;

export class Common extends BaseCard {
	override readonly type = 'common';
}

export type EventData = CardData;

export class Event extends BaseCard {
	override readonly type = 'event';
}

export interface CrisisData extends CardData {
	test: string;
	difficulty: string;
	penalty: string;
	highestContributionReward: string;
}

export class Crisis extends BaseCard {
	override readonly type = 'crisis';

	readonly test: string;
	readonly difficulty: string;
	readonly penalty: string;
	readonly highestContributionReward: string;

	constructor(
		id: string,
		{ test, difficulty, penalty, highestContributionReward, ...base }: CrisisData
	) {
		super(id, base);
		this.test = test;
		this.difficulty = difficulty;
		this.penalty = penalty;
		this.highestContributionReward = highestContributionReward;
	}
}

export type OfficeData = CardData;

export class Office extends BaseCard {
	override readonly type = 'office';

	override get hidden(): boolean {
		return false;
	}
}

export type GoalType = 'collective' | 'personal';

export interface GoalData extends CardData {
	goalType: GoalType;
}

export class Goal extends BaseCard {
	override readonly type = 'goal';
	readonly goalType: GoalType;

	constructor(id: string, { goalType, ...base }: GoalData) {
		super(id, base);
		this.goalType = goalType;
	}
}

export interface TacticData extends CardData {
	discardBonus?: ResourceSetProps;
}

export class Tactic extends BaseCard {
	override readonly type = 'tactic';
	readonly discardBonus: ResourceSet;

	constructor(id: string, { discardBonus, ...base }: TacticData) {
		super(id, base);
		this.discardBonus = new ResourceSet(discardBonus ?? {});
	}
}

export interface AssetData extends CardData {
	hidden?: boolean;
}

export class Asset extends BaseCard {
	override readonly type = 'asset';
	private readonly _hidden: boolean;

	constructor(id: string, { hidden = false, ...base }: AssetData) {
		super(id, base);
		this._hidden = hidden;
	}

	override get hidden(): boolean {
		return this._hidden;
	}
}

export type LawData = CardData;

export class Law extends BaseCard {
	override readonly type = 'law';
}

export type HouseData = CardData;

export class House extends BaseCard {
	override readonly type = 'house';

	override get hidden(): boolean {
		return false;
	}
}

export type Card = Common | Event | Crisis | Office | Goal | Tactic | Asset | Law | House;
