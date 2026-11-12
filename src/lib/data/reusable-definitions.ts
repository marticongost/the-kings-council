import type { ResourceType } from '../models/resources.ts';
import type { ReactionSpec } from '../models/capabilities.ts';
import type { KingdomStatType } from '../models/kingdomstats.ts';

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
