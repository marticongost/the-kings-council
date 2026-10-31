<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		section: {
			...css.column('xs'),
			minWidth: 0
		},
		header: {
			...css.row('sm')
		},
		title: {
			margin: 0,
			fontFamily: css.fonts.heading,
			fontSize: '0.95em',
			color: css.palette.wood
		},
		actions: {
			marginLeft: 'auto',
			...css.row('xs')
		},
		dropZone: {
			position: 'relative',
			minWidth: 0,
			padding: css.spacing.sm,
			border: `2px dashed ${css.palette.moonMist}`,
			borderRadius: css.spacing.sm,
			backgroundColor: css.palette.carrara,
			transition: 'border-color 0.15s, background-color 0.15s'
		},
		over: {
			borderColor: css.palette.sandal,
			backgroundColor: css.palette.wheat
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import type { Snippet } from 'svelte';
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';

	interface Props extends StandardAttributeProps {
		title?: string;
		/** Accessible name of the drop area, defaulting to the title. */
		ariaLabel?: string;
		/** Role of the drop area, e.g. a list of cards or a group of players. */
		role?: string;
		/** Highlights the drop area while a drag hovers it. */
		isOver?: boolean;
		/** Layout of the drop area, such as a grid of cards or a column of players. */
		contentClass?: string;
		/** Controls rendered in the header, after the title. */
		actions?: Snippet;
		children?: Snippet;
	}

	const {
		title,
		ariaLabel = title,
		role = 'group',
		isOver = false,
		contentClass = '',
		actions,
		children,
		...attributes
	}: Props = $props();
</script>

<section class={styles.section}>
	{#if title}
		<div class={styles.header}>
			<h4 class={styles.title}>{title}</h4>
			{#if actions}
				<div class={styles.actions}>
					{@render actions()}
				</div>
			{/if}
		</div>
	{/if}
	<div
		{...standardAttributes(attributes, cx(styles.dropZone, isOver && styles.over, contentClass))}
		{role}
		aria-label={ariaLabel}
	>
		{@render children?.()}
	</div>
</section>
