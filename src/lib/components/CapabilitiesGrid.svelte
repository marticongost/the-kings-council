<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		cardGrid: {
			...css.grid('md')
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';
	import type { CardCapability } from '#lib/models/cardcapabilities';
	import CardCapabilityFront from './CardCapabilityFront.svelte';

	interface Props extends StandardAttributeProps {
		cardCapabilities: Array<CardCapability>;
	}

	const { cardCapabilities, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.cardGrid)}>
	{#each cardCapabilities as cardCapability (cardCapability.id)}
		<CardCapabilityFront {cardCapability} />
	{/each}
</div>
