import type { Crisis } from '#lib/models/cards';
import type { CrisisToken } from '#lib/models/crisis-tokens';
import type { SimulatorState } from './simulatorstate.svelte';
import type { KingdomState } from './types';

/** Danger a retribution token adds, by the grace of the kingdom. Retribution grows as grace falls. */
const retributionDanger: Record<number, number> = { 1: 3, 2: 2, 3: 1, 4: 0, 5: -1 };

/** How much danger a token brings to a crisis it is drawn for, for the kingdom facing it. */
export function crisisTokenDanger(
	token: CrisisToken,
	crisis: Crisis,
	state: SimulatorState,
	kingdom: KingdomState
): number {
	if (token.isVariable()) return crisis.fortuneEffects.compute(state, kingdom);

	switch (token.id) {
		case 'danger1':
			return 1;
		case 'danger2':
			return 2;
		case 'danger3':
			return 3;
		default:
			return retributionDanger[kingdom.stats.grace] ?? 0;
	}
}

/** The difficulty of a crisis: the danger every token drawn for it adds, never below zero. */
export function crisisDifficultyFromDangers(dangers: ReadonlyArray<number>): number {
	const danger = dangers.reduce((total, value) => total + value, 0);
	// A crisis always requires some contribution, so its difficulty never drops below zero.
	return Math.max(0, Math.round(danger));
}
