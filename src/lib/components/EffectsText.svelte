<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		effectsText: {}
	});
</script>

<script lang="ts">
	import { parse } from '#lib/models/effects';
	import EffectsChunks from './EffectsChunks.svelte';
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		effects: string;
	}

	const { effects, ...attributes }: Props = $props();
	const chunks = $derived(parse(effects));
</script>

<span {...standardAttributes(attributes, styles.effectsText)}>
	<EffectsChunks {chunks} />
</span>
