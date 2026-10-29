<script lang="ts" module>
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
			...css.row('0.1em')
		},
		button: {
			width: '1em',
			height: '1em',
			border: 'none',
			borderRadius: '50%',
			backgroundColor: css.palette.sandal,
			color: css.palette.ivory,
			fontFamily: css.fonts.text,
			fontWeight: 900,
			fontSize: '0.8em',
			lineHeight: 1,
			cursor: 'pointer',
			...css.focus.mixin,
			'&:hover': {
				backgroundColor: css.palette.tobacco
			},
			'&:disabled': {
				opacity: 0.4,
				cursor: 'default',
				backgroundColor: css.palette.sandal
			}
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
</script>

{#snippet decrementButton()}
	<button
		type="button"
		class={styles.button}
		disabled={!canDecrease}
		aria-label={`Disminueix ${label}`}
		onclick={() => onchange(value - 1)}>−</button
	>
{/snippet}

{#snippet incrementButton()}
	<button
		type="button"
		class={styles.button}
		disabled={!canIncrease}
		aria-label={`Augmenta ${label}`}
		onclick={() => onchange(value + 1)}>+</button
	>
{/snippet}

<div class={styles.counter}>
	<span class={styles.label} title={label}>
		{@render icon?.()}
	</span>
	<span class={styles.value} aria-live="polite">{value}</span>
	<div class={styles.buttons}>
		{@render decrementButton()}
		{@render incrementButton()}
	</div>
</div>
