import { getContext, setContext } from 'svelte';
import type { SimulatorState } from './simulatorstate.svelte';
import type { PlannableCapability, PlayerState } from './types';

export const resolutionKey = Symbol('simulator-turn-resolution');

/** A planned capability of the turn being resolved, and the player who planned it. */
export interface ResolutionEntry {
	player: PlayerState;
	capability: PlannableCapability;
}

/**
 * Walks through the planned capabilities of every player, in turn order, to resolve a turn.
 * Actions go first, in rounds: each player's first action, then their second, and so on.
 * Secrets follow once every action has been presented.
 */
export class TurnResolution {
	active = $state(false);
	index = $state(0);

	readonly simulator: SimulatorState;

	constructor(simulator: SimulatorState) {
		this.simulator = simulator;
	}

	/** Every capability of the turn, in the order in which it is presented. */
	get entries(): Array<ResolutionEntry> {
		const players = this.simulator.turnOrder.flatMap((id) => {
			const player = this.simulator.players.find((candidate) => candidate.id === id);
			return player ? [player] : [];
		});
		const plans = players.map((player) => this.simulator.planOf(player));

		return (['actions', 'secrets'] as const).flatMap((list) => {
			const rounds = Math.max(0, ...plans.map((plan) => plan[list].length));
			const entries: Array<ResolutionEntry> = [];

			for (let round = 0; round < rounds; round++) {
				plans.forEach((plan, playerIndex) => {
					const capability = plan[list][round];
					if (capability) entries.push({ player: players[playerIndex], capability });
				});
			}

			return entries;
		});
	}

	/** Position of the presented capability, clamped to the capabilities that still exist. */
	get position(): number {
		return Math.min(this.index, Math.max(this.entries.length - 1, 0));
	}

	get current(): ResolutionEntry | null {
		return this.entries[this.position] ?? null;
	}

	get atStart(): boolean {
		return this.position === 0;
	}

	get atEnd(): boolean {
		return this.position >= this.entries.length - 1;
	}

	/** Starts the resolution, unless no capability has been planned. */
	start(): void {
		if (this.entries.length === 0) return;
		this.index = 0;
		this.active = true;
	}

	stop(): void {
		this.active = false;
		this.index = 0;
		this.simulator.clearAllIndications();
	}

	next(): void {
		if (!this.atEnd) this.index = this.position + 1;
	}

	previous(): void {
		if (!this.atStart) this.index = this.position - 1;
	}
}

export function provideTurnResolution(resolution: TurnResolution): void {
	setContext(resolutionKey, resolution);
}

export function useTurnResolution(): TurnResolution {
	const resolution = getContext<TurnResolution | undefined>(resolutionKey);
	if (!resolution) throw new Error('Simulator turn resolution context is missing');
	return resolution;
}
