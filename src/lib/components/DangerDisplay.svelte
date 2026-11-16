<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		danger: {
			position: 'relative',
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			verticalAlign: 'middle',
			color: css.palette.petal
		},
		icon: {
			height: '1.3em',
			width: 'auto'
		},
		value: {
			position: 'absolute',
			inset: 0,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontFamily: css.fonts.number,
			fontSize: '1.1em',
			fontWeight: 900,
			textShadow: '0 0 0.5em rgba(0,0,0,0.3)',
			lineHeight: 1,
			color: css.palette.white
		}
	});
</script>

<script lang="ts">
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		danger: number;
	}

	const { danger, ...attributes }: Props = $props();
</script>

<span
	{...standardAttributes(attributes, styles.danger)}
	title="Perill"
	role="img"
	aria-label={`Perill ${danger}`}
>
	<InlineSvg class={styles.icon} src="keywords/danger.svg" aria-hidden="true" />
	<span class={styles.value} aria-hidden="true">{danger}</span>
</span>
