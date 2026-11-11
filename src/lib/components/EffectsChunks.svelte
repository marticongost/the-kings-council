<script lang="ts" module>
	import { keywords } from '#lib/models/keywords';
	import * as css from '#lib/styles';

	const styles = css.styles({
		invalid: {
			backgroundColor: css.text.negativeColor,
			color: css.palette.white
		},
		text: {},
		keyword: {
			color: css.text.highlightColor
		},
		keywordIcon: {}
	});
</script>

<script lang="ts">
	import type { Chunk } from '#lib/models/effects';
	import CapabilityInput from './CapabilityInput.svelte';
	import InlineSvg from './InlineSvg.svelte';
	import KingdomStatDisplay from './KingdomStatDisplay.svelte';
	import ResourceDisplay from './ResourceDisplay.svelte';
	import ResourceLabel from './ResourceLabel.svelte';
	import KingdomStatLabel from './KingdomStatLabel.svelte';

	interface Props {
		chunks: Array<Chunk>;
		/** Renders the `{input …}` chunks as form controls. */
		editable?: boolean;
		/** Prefix identifying the input chunks in the state provided by `provideCapabilityInputs`. */
		inputKey?: string;
	}

	const { chunks, editable = false, inputKey }: Props = $props();

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
		<CapabilityInput
			format={chunk.format}
			counts={chunk.counts}
			{editable}
			inputKey={inputKey === undefined ? undefined : `${inputKey}:${index}`}
		/>
	{:else}
		{exhaustiveCheck(chunk)}
	{/if}
{/each}
