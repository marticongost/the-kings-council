<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		comment: {
			fontStyle: 'italic',
			backgroundColor: css.palette.willow,
			...css.vpadding(css.spacing.sm),
			...css.hpadding(css.spacing.md),
			...css.vmargin(css.spacing.md),
			borderLeft: `4px solid ${css.palette.grass}80`
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

<aside {...standardAttributes(attributes, styles.comment)}>
	<Markdown class={styles.markdown} {markdown} />
</aside>
