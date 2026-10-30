<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		button: {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			height: css.forms.controlHeight,
			width: css.forms.controlHeight,
			padding: '0.3em',
			border: 'none',
			borderRadius: css.spacing.xs,
			backgroundColor: 'transparent',
			color: css.palette.sandal,
			cursor: 'pointer',
			...css.focus.mixin,
			'&:hover': {
				color: css.palette.tobacco
			}
		},
		icon: {
			height: '100%',
			width: 'auto'
		}
	});
</script>

<script lang="ts">
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		type?: 'button' | 'submit' | 'reset';
		src: string;
		/** Accessible name, also shown as a tooltip. */
		label: string;
	}

	const { type = 'button', src, label, ...attributes }: Props = $props();
</script>

<button {...standardAttributes(attributes, styles.button)} {type} aria-label={label} title={label}>
	<InlineSvg class={styles.icon} {src} aria-hidden="true" />
</button>
