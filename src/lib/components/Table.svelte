<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		table: {
			borderCollapse: 'collapse',
			width: '100%',
			'th, td': {
				border: `2px solid ${css.palette.linen}`,
				padding: css.spacing.sm
			},
			th: {
				backgroundColor: css.palette.moonMist,
				color: css.palette.wood
			},
			td: {
				backgroundColor: css.palette.ivory
			}
		}
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { standardAttributes, type StandardAttributeProps } from './utils';

	export interface Props extends StandardAttributeProps {
		children: Snippet;
	}

	const { children, ...attributes }: Props = $props();
</script>

<table {...standardAttributes(attributes, styles.table)}>
	{@render children()}
</table>
