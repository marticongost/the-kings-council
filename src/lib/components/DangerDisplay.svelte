<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		danger: {
			...css.row('xs'),
			justifyContent: 'flex-start'
		},
		icon: {
			height: '1.1em',
			width: 'auto',
			color: css.palette.petal
		},
		halfIcon: {
			clipPath: 'inset(0 50% 0 0)'
		}
	});

	/** One skull per point of danger, the last one halved when danger ends in a half. */
	function dangerSkulls(danger: number): Array<'full' | 'half'> {
		return Array.from({ length: Math.ceil(danger) }, (_, index) =>
			danger - index >= 1 ? 'full' : 'half'
		);
	}
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		danger: number;
	}

	const { danger, ...attributes }: Props = $props();
	const skulls = $derived(dangerSkulls(danger));
</script>

<span
	{...standardAttributes(attributes, styles.danger)}
	title="Perill"
	role="img"
	aria-label={`Perill ${danger}`}
>
	{#each skulls as fill, index (index)}
		<InlineSvg
			class={cx(styles.icon, fill === 'half' && styles.halfIcon)}
			src="keywords/danger.svg"
			aria-hidden="true"
		/>
	{/each}
</span>
