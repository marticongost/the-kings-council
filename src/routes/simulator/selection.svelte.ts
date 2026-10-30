import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import type { SimulatorState } from './simulatorstate.svelte';
import { independentKingdomId } from './types';

export type SelectionKind = 'kingdom' | 'player' | 'card';

export const selectionKey = Symbol('simulator-selection');

/** Transient selection of kingdoms, players and card pills. Empty means the page. */
export class SimulatorSelection {
	readonly kingdoms = new SvelteSet<string>();
	readonly players = new SvelteSet<string>();
	readonly cards = new SvelteSet<string>();

	get isPage(): boolean {
		return this.kingdoms.size === 0 && this.players.size === 0 && this.cards.size === 0;
	}

	clear(): void {
		this.kingdoms.clear();
		this.players.clear();
		this.cards.clear();
	}

	has(kind: SelectionKind, id: string): boolean {
		return this.setOf(kind).has(id);
	}

	toggle(kind: SelectionKind, id: string): void {
		const set = this.setOf(kind);
		if (set.has(id)) {
			set.delete(id);
		} else {
			set.add(id);
		}
	}

	replace(kind: SelectionKind, ids: Iterable<string>): void {
		this.clear();
		const set = this.setOf(kind);
		for (const id of ids) set.add(id);
	}

	select(kind: SelectionKind, id: string, additive: boolean): void {
		if (additive) {
			this.toggle(kind, id);
			return;
		}
		this.replace(kind, [id]);
	}

	/** Drops ids that no longer exist, e.g. after deleting a player or discarding a card. */
	prune(simulator: SimulatorState): void {
		const kingdomIds = new SvelteSet([
			independentKingdomId,
			...simulator.kingdoms.map((k) => k.id)
		]);
		for (const id of [...this.kingdoms]) {
			if (!kingdomIds.has(id)) this.kingdoms.delete(id);
		}

		const playerIds = new SvelteSet(simulator.players.map((player) => player.id));
		for (const id of [...this.players]) {
			if (!playerIds.has(id)) this.players.delete(id);
		}

		const cardIds = new SvelteSet<string>();
		const addRefs = (refs: ReadonlyArray<{ uid: string }>) => {
			for (const ref of refs) cardIds.add(ref.uid);
		};
		addRefs(simulator.laws);
		addRefs(simulator.market);
		for (const refs of Object.values(simulator.decks)) addRefs(refs);
		for (const refs of Object.values(simulator.discards)) addRefs(refs);
		for (const kingdom of simulator.kingdoms) addRefs(kingdom.cards);
		for (const player of simulator.players) {
			addRefs(player.hand);
			addRefs(player.offices);
		}

		for (const uid of [...this.cards]) {
			if (!cardIds.has(uid)) this.cards.delete(uid);
		}
	}

	private setOf(kind: SelectionKind): SvelteSet<string> {
		switch (kind) {
			case 'kingdom':
				return this.kingdoms;
			case 'player':
				return this.players;
			case 'card':
				return this.cards;
		}
	}
}

export function provideSelection(selection: SimulatorSelection): void {
	setContext(selectionKey, selection);
}

export function useSelection(): SimulatorSelection {
	const selection = getContext<SimulatorSelection | undefined>(selectionKey);
	if (!selection) throw new Error('Simulator selection context is missing');
	return selection;
}
