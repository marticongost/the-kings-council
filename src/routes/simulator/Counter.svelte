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
		},
		superscript: {
			fontSize: '0.5em',
			fontWeight: 900,
			lineHeight: 0,
			verticalAlign: 'super',
			marginLeft: '0.05em',
			color: css.palette.red
		},
		compactCounter: {
			gap: '0.1em'
		},
		compactValue: {
			fontSize: '1.4em'
		},
		compactButton: {
			fontSize: '0.7em'
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import type { Snippet } from 'svelte';

	interface Props {
		value: number;
		label: string;
		onchange: (value: number) => void;
		/** Number rendered in place of `value`, e.g. while the counter edits a related amount. */
		displayValue?: number;
		/** Small figure shown next to the displayed number, e.g. the amount a player expects to spend. */
		superscript?: number;
		/** Describes the superscript in its tooltip. */
		superscriptLabel?: string;
		/** Name used in the increment and decrement labels, defaulting to `label`. */
		editLabel?: string;
		min?: number;
		max?: number;
		icon?: Snippet;
		/** Renders smaller figures and buttons, so counters fit side by side in dense panels. */
		compact?: boolean;
	}

	const {
		value,
		label,
		onchange,
		displayValue,
		superscript = 0,
		superscriptLabel,
		editLabel = label,
		min = 0,
		max = Number.POSITIVE_INFINITY,
		icon,
		compact = false
	}: Props = $props();

	const shownValue = $derived(displayValue ?? value);
	const superscriptTitle = $derived(
		superscriptLabel ? `${superscriptLabel}: ${superscript}` : undefined
	);

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
		src="ui/decrease.svg"
		class={cx(styles.button, compact && styles.compactButton)}
		disabled={!canDecrease}
		label={`Disminueix ${editLabel}`}
		onclick={() => onchange(value - 1)}
	/>
{/snippet}

{#snippet incrementButton()}
	<IconButton
		src="ui/increase.svg"
		class={cx(styles.button, compact && styles.compactButton)}
		disabled={!canIncrease}
		label={`Augmenta ${editLabel}`}
		onclick={() => onchange(value + 1)}
	/>
{/snippet}

<div class={cx(styles.counter, compact && styles.compactCounter)} onwheel={handleWheel}>
	<span class={styles.label} title={label}>
		{@render icon?.()}
	</span>
	<span class={cx(styles.value, compact && styles.compactValue)} aria-live="polite"
		>{shownValue}{#if superscript}<sup class={styles.superscript} title={superscriptTitle}
				>{superscript}</sup
			>{/if}</span
	>
	<div class={styles.buttons}>
		{@render incrementButton()}
		{@render decrementButton()}
	</div>
</div>
