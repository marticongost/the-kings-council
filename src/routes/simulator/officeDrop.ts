import type { SimulatorState } from './simulatorstate.svelte';
import { officeDragMime, type DragPayload, type Zone } from './types';

interface OfficeDropOptions {
	simulator: () => SimulatorState;
	zone: () => Zone;
	onOverChange: (isOver: boolean) => void;
}

/**
 * Drag handlers that turn a whole panel into the drop target of the offices it holds,
 * replacing the dedicated office drop areas.
 */
export function officeDropHandlers({ simulator, zone, onOverChange }: OfficeDropOptions) {
	function hasOfficePayload(event: DragEvent): boolean {
		return event.dataTransfer?.types.includes(officeDragMime) ?? false;
	}

	function ondragover(event: DragEvent) {
		if (!hasOfficePayload(event)) return;
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
		const raw = event.dataTransfer?.getData(officeDragMime);
		if (!raw) return;
		event.preventDefault();
		// Nested drop zones (e.g. a player inside a kingdom) must not also handle the drop.
		event.stopPropagation();

		try {
			const payload = JSON.parse(raw) as DragPayload;
			simulator().moveCard(payload.source, zone(), payload.uid);
		} catch {
			// Ignore malformed payloads from outside the simulator.
		}
	}

	return { ondragover, ondragleave, ondrop };
}
