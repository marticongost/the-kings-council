import type { SimulatorState } from './simulatorstate.svelte';
import { simulatorDragMime, type DragPayload, type Zone } from './types';

interface CardDropOptions {
	simulator: () => SimulatorState;
	zone: () => Zone;
	onOverChange: (isOver: boolean) => void;
}

/** Drag handlers that move any face-up card into a target zone. */
export function cardDropHandlers({ simulator, zone, onOverChange }: CardDropOptions) {
	function hasCardPayload(event: DragEvent): boolean {
		return event.dataTransfer?.types.includes(simulatorDragMime) ?? false;
	}

	function ondragover(event: DragEvent) {
		if (!hasCardPayload(event)) return;
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
		const raw = event.dataTransfer?.getData(simulatorDragMime);
		if (!raw) return;
		event.preventDefault();

		try {
			const payload = JSON.parse(raw) as DragPayload;
			simulator().moveCard(payload.source, zone(), payload.uid);
		} catch {
			// Ignore malformed payloads from outside the simulator.
		}
	}

	return { ondragover, ondragleave, ondrop };
}
