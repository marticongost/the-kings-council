<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		counter: {
			...css.column('xs'),
			padding: css.spacing.xs,
			border: `1px solid ${css.palette.moonMist}`,
			borderRadius: css.spacing.xs,
			backgroundColor: css.palette.linen
		},
		label: {
			...css.row('xs'),
			fontSize: '0.85em',
			color: css.palette.wood,
			minWidth: 0
		},
		labelText: {
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		},
		controls: {
			...css.row('xs'),
			justifyContent: 'space-between'
		},
		button: {
			width: '1.6em',
			height: '1.6em',
			border: 'none',
			borderRadius: '50%',
			backgroundColor: css.palette.sandal,
			color: css.palette.ivory,
			fontFamily: css.fonts.text,
			fontWeight: 900,
			fontSize: '1em',
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
			fontSize: '1.1em',
			minWidth: '1.5em',
			textAlign: 'center'
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

<div class={styles.counter}>
	<span class={styles.label}>
		{@render icon?.()}
		<span class={styles.labelText} title={label}>{label}</span>
	</span>
	<span class={styles.controls}>
		<button
			type="button"
			class={styles.button}
			disabled={!canDecrease}
			aria-label={`Disminueix ${label}`}
			onclick={() => onchange(value - 1)}>−</button
		>
		<span class={styles.value} aria-live="polite">{value}</span>
		<button
			type="button"
			class={styles.button}
			disabled={!canIncrease}
			aria-label={`Augmenta ${label}`}
			onclick={() => onchange(value + 1)}>+</button
		>
	</span>
</div>
