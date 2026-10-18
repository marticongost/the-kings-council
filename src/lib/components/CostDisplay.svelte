<script lang="ts" module>
	import type { ResourceSet } from '#lib/models/resourcesets';
	import * as css from '#lib/styles';

	const styles = css.styles({
		cost: {
			display: 'inline-flex',
			alignItems: 'center',
			gap: css.spacing.sm
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from './utils';
	import ResourceDisplay from './ResourceDisplay.svelte';
	import { resourceTypes } from '#lib/models/resources';

	interface Props extends StandardAttributeProps {
		cost: ResourceSet;
	}

	const { cost, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.cost)}>
	{#each resourceTypes as resource (resource)}
		{@const amount = cost[resource]}
		{#if amount}
			<ResourceDisplay {resource} {amount} />
		{/if}
	{/each}
</span>
