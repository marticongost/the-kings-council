import type { SimulatorState } from './simulatorstate.svelte';
import { playerDragMime, type PlayerDragPayload } from './types';

interface PlayerDropOptions {
	simulator: () => SimulatorState;
	/** Kingdom that adopts the dropped player, or `null` for the independents group. */
	kingdomId: () => string | null;
	onOverChange: (isOver: boolean) => void;
}

/** Drag handlers that let a whole panel adopt the players dropped onto it. */
export function playerDropHandlers({ simulator, kingdomId, onOverChange }: PlayerDropOptions) {
	function hasPlayerPayload(event: DragEvent): boolean {
		return event.dataTransfer?.types.includes(playerDragMime) ?? false;
	}

	function ondragover(event: DragEvent) {
		if (!hasPlayerPayload(event)) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		onOverChange(true);
	}

	function ondragleave(event: DragEvent) {
		const target = event.currentTarget;
		const related = event.relatedTarget;
		if (target instanceof Node && related instanceof Node && target.contains(related)) return;
		onOverChange(false);
	}

	function ondrop(event: DragEvent) {
		onOverChange(false);
		const raw = event.dataTransfer?.getData(playerDragMime);
		if (!raw) return;
		event.preventDefault();
		// Nested drop zones (e.g. a player inside a kingdom) must not also handle the drop.
		event.stopPropagation();

		try {
			const payload = JSON.parse(raw) as PlayerDragPayload;
			if (typeof payload.playerId === 'string') {
				simulator().assignKingdom(payload.playerId, kingdomId());
			}
		} catch {
			// Ignore malformed payloads from outside the simulator.
		}
	}

	return { ondragover, ondragleave, ondrop };
}
