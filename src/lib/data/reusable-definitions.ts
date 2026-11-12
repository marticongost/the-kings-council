import type { ResourceType } from '../models/resources.ts';
import type { ActionSpec, ConstantSpec, ReactionSpec } from '../models/capabilities.ts';
import type { KingdomStatType } from '../models/kingdomstats.ts';
import type { PropertyId } from '../models/properties.ts';

export function highKingdomStatGoalReaction(stat: KingdomStatType): ReactionSpec {
	return {
		type: 'reaction',
		trigger: 'gameEnd',
		effects: `Guanya {prestige 2} si {${stat}} del teu regne és 4, o {prestige 4} si és 5.`
	};
}

export function lowKingdomStatGoalReaction(stat: KingdomStatType): ReactionSpec {
	return {
		type: 'reaction',
		trigger: 'gameEnd',
		effects: `Guanya {prestige 2} si {${stat}} del teu regne és 2, o {prestige 4} si és 1.`
	};
}

export function resourceHigherThanKingdomStatGoalReaction(
	kingdomStat: KingdomStatType,
	resource: ResourceType
): ReactionSpec {
	return {
		type: 'reaction',
		trigger: 'gameEnd',
		effects: `Si {${resource}} > {${kingdomStat}}, guanya tant {prestige} com la diferència (màxim 5).`
	};
}

export function biggestHoarderGoalReaction(kind: string): ReactionSpec {
	return {
		type: 'reaction',
		trigger: 'gameEnd',
		effects: `Si ets el jugador amb més ${kind} del teu regne, guanya {prestige} igual a {kingdom-members} (màxim 5).`
	};
}

export function biggestHoarderHouseReward(
	title: string,
	property: PropertyId,
	resources: ResourceType[]
): ActionSpec {
	const rewardMarkup = resources.map((resource) => `{${resource} 1}`).join(' i ');
	return {
		title,
		type: 'action',
		effects: `Guanyar ${rewardMarkup} si cap altre {kingdom-member} té més {assets} {visible} amb la propietat {${property}} que tu.`
	};
}

export function doubleFavourHouseTrait(title: string, context: string): ConstantSpec {
	return {
		title,
		type: 'constant',
		effects: `Cada torn, el primer {favour} que gastis ${context} compta per 2.`
	};
}
