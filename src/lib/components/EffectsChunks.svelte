<script lang="ts" module>
	import { keywords } from '#lib/models/keywords';
	import * as css from '#lib/styles';
	import { cx } from '@emotion/css';

	const styles = css.styles({
		invalid: {
			backgroundColor: css.text.negativeColor,
			color: css.palette.white
		},
		text: {},
		keyword: {
			color: css.text.highlightColor
		},
		keywordIcon: {},
		input: {
			display: 'inline-block',
			border: `1px dashed ${css.palette.dawn}`,
			verticalAlign: 'middle',
			height: '1.5em',
			borderRadius: '0.3em',
			margin: 0
		},
		numericInput: {
			width: '2em'
		},
		checkInput: {
			width: '1em',
			borderRadius: '0.8em',
			height: '1em'
		},
		textInput: {
			width: '5em'
		},
		listInput: {
			display: 'block',
			height: '4em',
			marginTop: css.spacing.xs
		},
		formatWrapper: {
			height: '1em',
			padding: '0.1em',
			borderRight: `1px solid ${css.palette.ivory}`
		},
		formatIcon: {
			width: '1em',
			height: '1em',
			verticalAlign: 'middle'
		},
		kingdomInput: {
			width: '5em'
		},
		playerInput: {
			width: '5em'
		},
		playerListInput: {
			width: '100%'
		},
		resourceInput: {
			width: '2.5em'
		}
	});
</script>

<script lang="ts">
	import type { Chunk } from '#lib/models/effects';
	import InlineSvg from './InlineSvg.svelte';
	import KingdomStatDisplay from './KingdomStatDisplay.svelte';
	import ResourceDisplay from './ResourceDisplay.svelte';
	import { isResourceType } from '#lib/models/resources';
	import ResourceLabel from './ResourceLabel.svelte';
	import KingdomStatLabel from './KingdomStatLabel.svelte';

	interface Props {
		chunks: Array<Chunk>;
	}

	const { chunks }: Props = $props();

	function exhaustiveCheck(value: never): never {
		throw new Error(`Missing branches (${value})`);
	}
</script>

{#each chunks as chunk, index (index)}
	{#if chunk.type === 'invalid'}
		<code class={styles.invalid}>
			{chunk.message}
		</code>
	{:else if chunk.type === 'text'}
		<span class={styles.text}>{chunk.text}</span>
	{:else if chunk.type === 'keyword'}
		{@const label = keywords[chunk.keyword]}
		{#if label === undefined}
			<InlineSvg class={styles.keywordIcon} src="keywords/{chunk.keyword}.svg" />
		{:else}
			<strong class={styles.keyword}>{keywords[chunk.keyword]}</strong>
		{/if}
	{:else if chunk.type === 'resource'}
		<ResourceDisplay resource={chunk.resource} amount={chunk.amount} />
	{:else if chunk.type === 'resource-label'}
		<ResourceLabel resource={chunk.resource} />
	{:else if chunk.type === 'kingdom-stat'}
		<KingdomStatDisplay stat={chunk.stat} amount={chunk.amount} />
	{:else if chunk.type === 'kingdom-stat-label'}
		<KingdomStatLabel stat={chunk.stat} />
	{:else if chunk.type === 'input'}
		<span
			class={cx(styles.input, {
				[styles.numericInput]: chunk.format === 'number',
				[styles.textInput]: chunk.format === 'text',
				[styles.listInput]: chunk.format === 'list',
				[styles.checkInput]: chunk.format === 'check',
				[styles.kingdomInput]: chunk.format === 'kingdom',
				[styles.playerInput]: chunk.format === 'player' || chunk.format === 'kingdom-member',
				[styles.playerListInput]: chunk.format === 'players' || chunk.format === 'kingdom-members',
				[styles.resourceInput]: isResourceType(chunk.format)
			})}
		>
			{#if chunk.format === 'player'}
				<span class={styles.formatWrapper}>
					<InlineSvg class={styles.formatIcon} src="keywords/player.svg" />
				</span>
			{:else if chunk.format === 'kingdom'}
				<span class={styles.formatWrapper}>
					<InlineSvg class={styles.formatIcon} src="keywords/kingdom.svg" />
				</span>
			{:else if chunk.format === 'kingdom-member'}
				<span class={styles.formatWrapper}>
					<InlineSvg class={styles.formatIcon} src="keywords/kingdom-member.svg" />
				</span>
			{:else if chunk.format === 'players'}
				<span class={styles.formatWrapper}>
					<InlineSvg class={styles.formatIcon} src="keywords/players.svg" />
				</span>
			{:else if chunk.format === 'kingdom-members'}
				<span class={styles.formatWrapper}>
					<InlineSvg class={styles.formatIcon} src="keywords/kingdom-members.svg" />
				</span>
			{:else if isResourceType(chunk.format)}
				<span class={styles.formatWrapper}>
					<ResourceDisplay resource={chunk.format} />
				</span>
			{/if}
		</span>
	{:else}
		{exhaustiveCheck(chunk)}
	{/if}
{/each}
