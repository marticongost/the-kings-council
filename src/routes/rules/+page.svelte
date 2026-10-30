<script lang="typescript" module>
	import * as css from '#lib/styles';
	const styles = css.styles({
		rules: {
			margin: 'auto',
			padding: css.spacing.xl,
			...css.document.surface,
			width: '46em'
		},
		content: {
			textAlign: 'justify'
		}
	});
</script>

<script lang="typescript">
	import Markdown from '#lib/components/Markdown.svelte';
	import Example from '#lib/components/Example.svelte';
	import rules from './rules.md?raw';
	import Comment from '#lib/components/Comment.svelte';
	import KingdomProductionTable from '#lib/components/KingdomProductionTable.svelte';
	import Notice from '#lib/components/Notice.svelte';
</script>

<div class={styles.rules}>
	<Markdown class={styles.content} markdown={rules}>
		{#snippet example(markdown = '')}
			<Example {markdown} />
		{/snippet}
		{#snippet notice(markdown = '')}
			<Notice {markdown} />
		{/snippet}
		{#snippet comment(markdown = '')}
			<Comment {markdown} />
		{/snippet}
		{#snippet kingdomProductionTable()}
			<KingdomProductionTable />
		{/snippet}
	</Markdown>
</div>
