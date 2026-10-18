<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		notice: {
			fontStyle: 'italic',
			backgroundColor: css.palette.blush,
			...css.vmargin(css.spacing.md),
			...css.vpadding(css.spacing.sm),
			...css.hpadding(css.spacing.md),
			borderLeft: `4px solid ${css.palette.rose}80`
		},
		markdown: {}
	});
</script>

<script lang="ts">
	import Markdown from './Markdown.svelte';
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		markdown: string;
	}

	const { markdown, ...attributes }: Props = $props();
</script>

<aside {...standardAttributes(attributes, styles.notice)}>
	<Markdown class={styles.markdown} {markdown} />
</aside>
