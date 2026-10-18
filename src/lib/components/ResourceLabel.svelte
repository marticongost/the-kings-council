<script lang="ts" module>
	import { getResource, type ResourceType } from '#lib/models/resources';
	import * as css from '#lib/styles';
	import InlineSvg from './InlineSvg.svelte';

	const styles = css.styles({
		resourceDisplay: {},
		icon: {
			color: css.palette.wood
		},
		name: {
			fontWeight: 'bold'
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		resource: ResourceType;
		amount?: number;
	}

	const { resource, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.resourceDisplay)}>
	<InlineSvg class={styles.icon} src="resources/{resource}.svg" />
	<span class={styles.name}>
		{getResource(resource).title}
	</span>
</span>
