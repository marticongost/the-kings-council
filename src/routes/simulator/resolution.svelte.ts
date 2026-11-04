import { getContext, setContext } from 'svelte';
import type { SimulatorState } from './simulatorstate.svelte';
import type { PlannableCapability, PlayerState } from './types';

export const resolutionKey = Symbol('simulator-turn-resolution');

/** A planned capability of the turn being resolved, and the player who planned it. */
export interface CapabilityResolutionStep {
	kind: 'capability';
	player: PlayerState;
	capability: PlannableCapability;
}

/** A crisis a kingdom must resolve, presented after every planned capability. */
export interface CrisisResolutionStep {
	kind: 'crisis';
	kingdomId: string;
}

/** One step of the turn resolution: a planned capability or a kingdom's crisis. */
export type ResolutionStep = CapabilityResolutionStep | CrisisResolutionStep;

/**
 * Walks through the planned capabilities of every player, in turn order, to resolve a turn.
 * Actions go first, in rounds: each player's first action, then their second, and so on.
 * Secrets follow once every action has been presented, and crisis steps come last.
 *
 * The state of the resolution lives in the simulator, so that it is persisted with the rest
 * of the game and a reload comes back to the step that was being presented.
 */
export class TurnResolution {
	readonly simulator: SimulatorState;

	constructor(simulator: SimulatorState) {
		this.simulator = simulator;
	}

	get active(): boolean {
		return this.simulator.resolution.active;
	}

	get index(): number {
		return this.simulator.resolution.index;
	}

	/** Every planned capability of the turn, in the order in which it is presented. */
	private get capabilitySteps(): Array<CapabilityResolutionStep> {
		const players = this.simulator.turnOrder.flatMap((id) => {
			const player = this.simulator.players.find((candidate) => candidate.id === id);
			return player ? [player] : [];
		});
		const plans = players.map((player) => this.simulator.planOf(player));

		return (['actions', 'secrets'] as const).flatMap((list) => {
			const rounds = Math.max(0, ...plans.map((plan) => plan[list].length));
			const steps: Array<CapabilityResolutionStep> = [];

			for (let round = 0; round < rounds; round++) {
				plans.forEach((plan, playerIndex) => {
					const capability = plan[list][round];
					if (capability) {
						steps.push({ kind: 'capability', player: players[playerIndex], capability });
					}
				});
			}

			return steps;
		});
	}

	/**
	 * Crisis steps, one per kingdom with a crisis card attached. Kingdoms are ordered by
	 * the lowest position of any of their members in the player order, so the kingdom whose
	 * member acts first resolves its crisis first.
	 */
	private get crisisSteps(): Array<CrisisResolutionStep> {
		const steps = this.simulator.kingdoms.flatMap((kingdom, order) => {
			if (!this.simulator.kingdomCrisis(kingdom.id)) return [];

			const memberIndex = this.simulator.turnOrder.findIndex((playerId) =>
				this.simulator.membersOf(kingdom.id).some((player) => player.id === playerId)
			);

			return [
				{
					kingdomId: kingdom.id,
					order,
					memberIndex: memberIndex === -1 ? Number.POSITIVE_INFINITY : memberIndex
				}
			];
		});

		steps.sort((a, b) => a.memberIndex - b.memberIndex || a.order - b.order);
		return steps.map(({ kingdomId }) => ({ kind: 'crisis' as const, kingdomId }));
	}

	/** Every step of the turn, in the order in which it is presented. */
	get steps(): Array<ResolutionStep> {
		return [...this.capabilitySteps, ...this.crisisSteps];
	}

	/** Position of the presented step, clamped to the steps that still exist. */
	get position(): number {
		return Math.min(this.index, Math.max(this.steps.length - 1, 0));
	}

	get current(): ResolutionStep | null {
		return this.steps[this.position] ?? null;
	}

	get atStart(): boolean {
		return this.position === 0;
	}

	get atEnd(): boolean {
		return this.position >= this.steps.length - 1;
	}

	/** Starts the resolution, unless no step can be presented. */
	start(): void {
		if (this.steps.length === 0) return;
		this.simulator.resolution = { active: true, index: 0 };
	}

	stop(): void {
		this.simulator.resolution = { active: false, index: 0 };
		this.simulator.clearAllIndications();
	}

	/** Moves to the next step, finishing the turn after the last one. */
	next(): void {
		if (!this.active) return;
		if (this.atEnd) {
			this.finish();
			return;
		}
		this.simulator.resolution.index = this.position + 1;
	}

	previous(): void {
		if (!this.active || this.atStart) return;
		this.simulator.resolution.index = this.position - 1;
	}

	/** Ends the resolution, shows the player order again, and advances the turn. */
	private finish(): void {
		this.simulator.advanceTurn();
		this.simulator.resetTurnOrder();
		this.simulator.resolution = { active: false, index: 0 };
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
