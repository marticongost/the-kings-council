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
		/** Renders the `{input …}` marks as form controls. */
		editable?: boolean;
		/** Prefix identifying the input marks in the state provided by `provideCapabilityInputs`. */
		inputKey?: string;
	}

	const { effects, editable = false, inputKey, ...attributes }: Props = $props();
	const chunks = $derived(parse(effects));
</script>

<span {...standardAttributes(attributes, styles.effectsText)}>
	<EffectsChunks {chunks} {editable} {inputKey} />
</span>
