<script lang="ts" module>
	import type { ResourceType } from '#lib/models/resources';
	import { type ResourceSpec } from '#lib/models/resourcesets';
	import * as css from '#lib/styles';
	import EffectsText from './EffectsText.svelte';
	import InlineSvg from './InlineSvg.svelte';

	const styles = css.styles({
		resourceDisplay: {},
		icon: {
			color: css.palette.wood
		},
		amount: {}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		resource: ResourceType;
		amount?: ResourceSpec;
	}

	const { resource, amount = 0, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.resourceDisplay)}>
	<InlineSvg class={styles.icon} src="resources/{resource}.svg" />
	{#if amount}
		<span class={styles.amount}>
			{#if typeof amount === 'number'}
				{amount}
			{:else}
				<EffectsText effects={amount} />
			{/if}
		</span>
	{/if}
</span>
