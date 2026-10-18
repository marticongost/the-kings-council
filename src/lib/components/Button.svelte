<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		button: {
			height: css.forms.controlHeight,
			...css.hpadding('sm'),
			border: 'none',
			borderRadius: css.spacing.sm,
			backgroundColor: css.palette.sandal,
			color: css.palette.ivory,
			fontFamily: css.fonts.text,
			fontWeight: 900,
			fontSize: '1em',
			cursor: 'pointer',
			...css.focus.mixin,
			'&:hover': {
				backgroundColor: css.palette.tobacco
			}
		}
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		type?: 'button' | 'submit' | 'reset';
		children?: Snippet;
	}

	const { type = 'button', children, ...attributes }: Props = $props();
</script>

<button {...standardAttributes(attributes, styles.button)} {type}>
	{@render children?.()}
</button>
