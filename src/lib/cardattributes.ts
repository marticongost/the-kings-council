import { assertNever } from './components/utils';
import { type Capability } from './models/capabilities';
import type { Card } from './models/cards';

export function getCardIcon(card: Card): string {
	switch (card.type) {
		case 'common':
			return `common/${card.id}.svg`;
		case 'office':
			return `offices/${card.id}.svg`;
		case 'goal':
			return `goals/${card.id}.svg`;
		case 'event':
			return `events/${card.id}.svg`;
		case 'crisis':
			return `crisis/${card.id}.svg`;
		case 'law':
			return `laws/${card.id}.svg`;
		case 'tactic':
			return `tactics/${card.id}.svg`;
		case 'asset':
			return `assets/${card.id}.svg`;
		case 'house':
			return `houses/${card.id}.svg`;
		default:
			return assertNever(card, 'Unknown card type');
	}
}

/** The names of the card background artwork, one per card type and sub-type. */
export type CardBackgroundName =
	| 'common'
	| 'office'
	| 'collective-goal'
	| 'personal-goal'
	| 'event'
	| 'crisis'
	| 'law'
	| 'tactic'
	| 'asset'
	| 'hidden-asset'
	| 'house';

/** The name of the background artwork for a card, shared by the card fronts. */
export function getCardBackgroundName(card: Card): CardBackgroundName {
	if (card.type === 'asset' && card.hidden) {
		return 'hidden-asset';
	}
	if (card.type === 'goal') {
		return `${card.goalType}-goal`;
	}
	return card.type;
}

export function getCapabilityIcon(capability: Capability): string {
	switch (capability.type) {
		case 'indication':
			return `capabilities/indication.svg`;
		case 'action':
			return `capabilities/action.svg`;
		case 'reaction':
			return `capabilities/reaction.svg`;
		case 'constant':
			return `capabilities/constant.svg`;
		case 'secret':
			return `capabilities/secret.svg`;
		default:
			return assertNever(capability, 'Unknown capability type');
	}
}

export function getCapabilityTitle(capability: Capability): string {
	switch (capability.type) {
		case 'indication':
		case 'action':
		case 'secret':
		case 'constant':
			return capability.title;
		case 'reaction':
			return capability.trigger.title;
		default:
			return assertNever(capability, 'Unknown capability type');
	}
}
