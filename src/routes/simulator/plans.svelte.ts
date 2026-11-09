import { getContext, setContext } from 'svelte';
import type { SimulatorState } from './simulatorstate.svelte';

export const plansKey = Symbol('simulator-plans');

/** Which player's plan modal is open, if any. */
export class PlanController {
	readonly simulator: SimulatorState;
	playerId = $state<string | null>(null);
	/** Whether the open plan is being recorded as a single undoable step. */
	private recording = false;

	constructor(simulator: SimulatorState) {
		this.simulator = simulator;
	}

	open(playerId: string): void {
		if (this.playerId === playerId) return;
		this.close();

		const player = this.simulator.players.find((candidate) => candidate.id === playerId);
		if (!player) return;

		this.playerId = playerId;
		// The whole planning session is undone at once, as a single step.
		this.simulator.beginTransaction(`Pla de torn de ${player.name}`);
		this.recording = true;
	}

	/** Opens the plan of a player, or closes it when it is already open. */
	toggle(playerId: string): void {
		if (this.playerId === playerId) this.close();
		else this.open(playerId);
	}

	close(): void {
		if (this.playerId === null) return;

		this.playerId = null;
		if (this.recording) {
			this.recording = false;
			this.simulator.endTransaction();
		}
	}

	/** Closes the modal when its player no longer exists, e.g. after deleting it. */
	prune(simulator: SimulatorState): void {
		const playerId = this.playerId;
		if (!playerId || simulator.players.some((player) => player.id === playerId)) return;

		this.playerId = null;
		if (this.recording) {
			this.recording = false;
			// The step was recording a player that is gone, so it is dropped instead of recorded.
			this.simulator.cancelTransaction();
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
