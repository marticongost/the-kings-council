import { assertNever } from '#lib/components/utils';
import { type ResourceSetProps, ResourceSet } from './resourcesets';
import { getTrigger, type Trigger, type TriggerType } from './triggers';

export type CapabilityType =
	'indication' | 'action' | 'secret' | 'reaction' | 'constant' | 'crisis';

export interface CapabilityCostFields {
	cost?: ResourceSetProps;
}

export interface CapabilityEffectsFields {
	effects: string;
}

export type ConcreteCapabilityData = CapabilityCostFields &
	CapabilityEffectsFields & {
		restrictions?: string;
	};

export interface ReactionData extends ConcreteCapabilityData {
	trigger: TriggerType;
}

export interface BaseActionData extends ConcreteCapabilityData {
	title?: string;
}

export interface ConstantData extends CapabilityEffectsFields {
	title: string;
}

export type IndicationSpec = { type: 'indication' } & BaseActionData;
export type ActionSpec = { type: 'action' } & BaseActionData;
export type SecretSpec = { type: 'secret' } & BaseActionData;
export type ReactionSpec = { type: 'reaction' } & ReactionData;
export type ConstantSpec = { type: 'constant' } & ConstantData;
export type CapabilitySpec = IndicationSpec | ActionSpec | SecretSpec | ReactionSpec | ConstantSpec;

export type Capability = Indication | Action | Secret | Reaction | Constant;

export function buildCapability(spec: IndicationSpec): Indication;
export function buildCapability(spec: ActionSpec): Action;
export function buildCapability(spec: SecretSpec): Secret;
export function buildCapability(spec: ReactionSpec): Reaction;
export function buildCapability(spec: ConstantSpec): Constant;
export function buildCapability(spec: CapabilitySpec): Capability;
export function buildCapability(spec: CapabilitySpec): Capability {
	switch (spec.type) {
		case 'indication':
			return new Indication(spec);
		case 'action':
			return new Action(spec);
		case 'secret':
			return new Secret(spec);
		case 'reaction':
			return new Reaction(spec);
		case 'constant':
			return new Constant(spec);
		default:
			assertNever(spec, 'Unknown capability type');
	}
}

export abstract class BaseCapability {
	abstract readonly type: CapabilityType;
}

export abstract class ConcreteCapability extends BaseCapability {
	readonly cost: ResourceSet;
	readonly effects: string;
	readonly restrictions?: string;

	constructor({ cost, effects, restrictions }: ConcreteCapabilityData) {
		super();
		this.cost = new ResourceSet(cost ?? {});
		this.effects = effects;
		this.restrictions = restrictions;
	}
}

export abstract class BaseAction extends ConcreteCapability {
	readonly title: string;

	constructor({ title = 'Aplicar', ...base }: BaseActionData) {
		super(base);
		this.title = title;
	}
}

export class Indication extends BaseAction {
	override readonly type = 'indication';
}

export class Action extends BaseAction {
	override readonly type = 'action';
}

export class Secret extends BaseAction {
	override readonly type = 'secret';
}

export class Reaction extends ConcreteCapability {
	readonly trigger: Trigger;

	constructor({ trigger, ...base }: ReactionData) {
		super(base);
		this.trigger = getTrigger(trigger);
	}

	override readonly type = 'reaction';
}

export class Constant extends BaseCapability {
	readonly title: string;
	readonly effects: string;

	constructor({ title, effects }: ConstantData) {
		super();
		this.title = title;
		this.effects = effects;
	}

	override readonly type = 'constant';
}
