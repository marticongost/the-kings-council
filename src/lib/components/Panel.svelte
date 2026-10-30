<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		panel: {
			...css.column('md'),
			transition: 'border-color 0.15s, background-color 0.15s',
			minWidth: 0
		},
		regular: {
			...css.document.surface,
			padding: css.spacing.lg
		},
		compact: {
			...css.document.compactSurface,
			padding: css.spacing.md
		},
		over: {
			borderColor: css.palette.sandal,
			backgroundColor: css.palette.wheat
		},
		header: {
			...css.row('lg'),
			flexWrap: 'wrap',
			...css.document.titleRule('0.2em')
		},
		name: {
			margin: 0,
			whiteSpace: 'nowrap',
			...css.document.titleTypography
		},
		body: {
			...css.column('sm'),
			minWidth: 0
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import type { Snippet } from 'svelte';
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		title: string;
		/** Content rendered inside the title element, instead of the plain `title` text. */
		titleContent?: Snippet;
		/** Content rendered in the header, after the title. */
		header?: Snippet;
		/** Panel body content. */
		children?: Snippet;
		/** Highlights the panel, e.g. while a drag operation hovers it. */
		isOver?: boolean;
		/** Renders the panel with reduced padding and a tighter surface, for dense content. */
		compact?: boolean;
	}

	const {
		title,
		titleContent,
		header,
		children,
		isOver = false,
		compact = false,
		...attributes
	}: Props = $props();
</script>

<article
	{...standardAttributes(
		attributes,
		cx(styles.panel, compact ? styles.compact : styles.regular, isOver && styles.over)
	)}
>
	<header class={styles.header}>
		<h3 class={styles.name}>
			{#if titleContent}
				{@render titleContent()}
			{:else}
				{title}
			{/if}
		</h3>
		{@render header?.()}
	</header>
	<div class={styles.body}>
		{@render children?.()}
	</div>
</article>
