<script lang="ts" module>
	import IconButton from '#lib/components/IconButton.svelte';
	import * as css from '#lib/styles';

	const styles = css.styles({
		counter: {
			...css.row('xs'),
			flexShrink: 0,
			whiteSpace: 'nowrap'
		},
		label: {
			...css.row(),
			color: css.palette.wood,
			minWidth: 0
		},
		buttons: {
			...css.column('0.1em')
		},
		button: {
			fontSize: '0.8em'
		},
		value: {
			fontFamily: css.fonts.number,
			fontWeight: 900,
			fontSize: '2em',
			lineHeight: 1,
			minWidth: '0.8em',
			textAlign: 'center',
			// Grenze's figures sit below the line-box centre; nudge them up optically.
			transform: 'translateY(-0.1em)'
		}
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value: number;
		label: string;
		onchange: (value: number) => void;
		min?: number;
		max?: number;
		icon?: Snippet;
	}

	const { value, label, onchange, min = 0, max = Number.POSITIVE_INFINITY, icon }: Props = $props();

	const canDecrease = $derived(value > min);
	const canIncrease = $derived(value < max);

	// Wheel deltas arrive in pixels, lines or pages depending on the browser/device; express
	// everything in pixels so a single notch is roughly one step everywhere.
	const notchSize = 100;
	const lineSize = notchSize / 3;
	let wheelDelta = 0;

	function handleWheel(event: WheelEvent) {
		if (event.deltaY === 0) return;

		const delta =
			event.deltaMode === WheelEvent.DOM_DELTA_LINE
				? event.deltaY * lineSize
				: event.deltaMode === WheelEvent.DOM_DELTA_PAGE
					? event.deltaY * notchSize
					: event.deltaY;

		// A direction change starts a new gesture, so previous accumulation is discarded.
		if (Math.sign(delta) !== Math.sign(wheelDelta)) wheelDelta = 0;
		wheelDelta += delta;

		const steps = Math.trunc(wheelDelta / notchSize);
		if (steps === 0) return;

		// Scrolling down decreases, like a native number spinner.
		const next = Math.min(max, Math.max(min, value - steps));
		if (next === value) {
			// Already at a bound: leave the gesture to the page instead of swallowing it.
			wheelDelta = 0;
			return;
		}

		wheelDelta -= steps * notchSize;
		event.preventDefault();
		onchange(next);
	}
</script>

{#snippet decrementButton()}
	<IconButton
		src="ui/increase.svg"
		class={styles.button}
		disabled={!canDecrease}
		label={`Disminueix ${label}`}
		onclick={() => onchange(value - 1)}
	/>
{/snippet}

{#snippet incrementButton()}
	<IconButton
		src="ui/decrease.svg"
		class={styles.button}
		disabled={!canIncrease}
		label={`Augmenta ${label}`}
		onclick={() => onchange(value + 1)}
	/>
{/snippet}

<div class={styles.counter} onwheel={handleWheel}>
	<span class={styles.label} title={label}>
		{@render icon?.()}
	</span>
	<span class={styles.value} aria-live="polite">{value}</span>
	<div class={styles.buttons}>
		{@render decrementButton()}
		{@render incrementButton()}
	</div>
</div>
