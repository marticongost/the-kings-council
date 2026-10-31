import { getContext, setContext } from 'svelte';
import type { SimulatorState } from './simulatorstate.svelte';

export const plansKey = Symbol('simulator-plans');

/** Which player's plan modal is open, if any. */
export class PlanController {
	playerId = $state<string | null>(null);

	open(playerId: string): void {
		this.playerId = playerId;
	}

	/** Opens the plan of a player, or closes it when it is already open. */
	toggle(playerId: string): void {
		this.playerId = this.playerId === playerId ? null : playerId;
	}

	close(): void {
		this.playerId = null;
	}

	/** Closes the modal when its player no longer exists, e.g. after deleting it. */
	prune(simulator: SimulatorState): void {
		const playerId = this.playerId;
		if (playerId && !simulator.players.some((player) => player.id === playerId)) {
			this.close();
		}
	}
}

export function providePlans(plans: PlanController): void {
	setContext(plansKey, plans);
}

export function usePlans(): PlanController {
	const plans = getContext<PlanController | undefined>(plansKey);
	if (!plans) throw new Error('Simulator plan context is missing');
	return plans;
}
