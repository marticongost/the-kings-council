import { getContext, setContext } from 'svelte';
import type { SimulatorState } from './simulatorstate.svelte';
import { emptyVoteAllocation, lawVoteWeight, type VoteAllocation, type VoteSide } from './types';

export const votesKey = Symbol('simulator-votes');

/** The weight each side of the open vote has gathered. */
export interface VoteTotals {
	for: number;
	against: number;
}

/** Which kingdom's law vote modal is open, and the resources each member is committing. */
export class VoteController {
	readonly simulator: SimulatorState;
	kingdomId = $state<string | null>(null);
	lawUid = $state<string | null>(null);
	allocations = $state<Record<string, VoteAllocation>>({});

	constructor(simulator: SimulatorState) {
		this.simulator = simulator;
	}

	get totals(): VoteTotals {
		const totals: VoteTotals = { for: 0, against: 0 };
		const kingdomId = this.kingdomId;
		if (!kingdomId) return totals;

		for (const player of this.simulator.membersOf(kingdomId)) {
			const allocation = this.allocationOf(player.id);
			totals[allocation.side] += lawVoteWeight(allocation);
		}
		return totals;
	}

	open(kingdomId: string): void {
		if (this.kingdomId === kingdomId) return;
		this.kingdomId = kingdomId;
		this.reset();
	}

	/** Opens the vote of a kingdom, or closes it when it is already open. */
	toggle(kingdomId: string): void {
		if (this.kingdomId === kingdomId) this.close();
		else this.open(kingdomId);
	}

	close(): void {
		this.kingdomId = null;
		this.lawUid = null;
		this.allocations = {};
	}

	selectLaw(lawUid: string | null): void {
		this.lawUid = lawUid;
	}

	allocationOf(playerId: string): VoteAllocation {
		return this.allocations[playerId] ?? emptyVoteAllocation();
	}

	setPower(playerId: string, value: number): void {
		this.commit(playerId, 'power', value);
	}

	setFavour(playerId: string, value: number): void {
		this.commit(playerId, 'favour', value);
	}

	setSide(playerId: string, side: VoteSide): void {
		this.update(playerId, { side });
	}

	/** Spends every committed resource and resolves the law, closing the modal. */
	finish(): boolean {
		const kingdomId = this.kingdomId;
		const lawUid = this.lawUid;
		if (!kingdomId || !lawUid) return false;

		const votes = this.simulator.membersOf(kingdomId).map((player) => ({
			playerId: player.id,
			...this.allocationOf(player.id)
		}));
		const passed = this.simulator.resolveLawVote(kingdomId, lawUid, votes);
		this.close();
		return passed;
	}

	/** Closes the modal when its kingdom is gone, and keeps the selected law in the row. */
	prune(simulator: SimulatorState): void {
		const kingdomId = this.kingdomId;
		if (!kingdomId) return;

		if (!simulator.kingdoms.some((kingdom) => kingdom.id === kingdomId)) {
			this.close();
			return;
		}

		if (this.lawUid && !simulator.laws.some((ref) => ref.uid === this.lawUid)) {
			this.lawUid = simulator.laws[0]?.uid ?? null;
		}
	}

	private reset(): void {
		this.lawUid = this.simulator.laws[0]?.uid ?? null;
		const allocations: Record<string, VoteAllocation> = {};
		const kingdomId = this.kingdomId;
		if (kingdomId) {
			for (const player of this.simulator.membersOf(kingdomId)) {
				allocations[player.id] = emptyVoteAllocation();
			}
		}
		this.allocations = allocations;
	}

	private commit(playerId: string, resource: 'power' | 'favour', value: number): void {
		const player = this.simulator.players.find((candidate) => candidate.id === playerId);
		if (!player) return;

		const amount = Math.min(Math.max(0, Math.round(value)), player.resources[resource]);
		this.update(playerId, { [resource]: amount });
	}

	private update(playerId: string, patch: Partial<VoteAllocation>): void {
		this.allocations[playerId] = { ...this.allocationOf(playerId), ...patch };
	}
}

export function provideVotes(votes: VoteController): void {
	setContext(votesKey, votes);
}

export function useVotes(): VoteController {
	const votes = getContext<VoteController | undefined>(votesKey);
	if (!votes) throw new Error('Simulator vote context is missing');
	return votes;
}
