<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		browser: {
			...css.row('xl'),
			alignItems: 'flex-start'
		},
		results: {
			...css.column('sm'),
			flex: '1 1 auto',
			minWidth: 0,
			transition: 'opacity 0.2s ease-in'
		},
		resultsHidden: {
			opacity: 0
		},
		noResultsNotice: {}
	});

	function needsCapabilityCard(card: Card, capability: Capability) {
		if (capability.type === 'constant') {
			return false;
		}
		if (capability.type === 'reaction') {
			return card.type === 'tactic';
		}
		if (card.type === 'event' || card.type === 'goal' || card.type === 'law') {
			return capability.type === 'action' || capability.type === 'secret';
		}
		return true;
	}
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import { standardAttributes, type StandardAttributeProps } from './utils';
	import type { Card } from '#lib/models/cards';
	import { getBrowserCardSearchState } from '#lib/browsercardsearchstate.svelte';
	import CardSearchControls from './CardSearchControls.svelte';
	import CapabilitiesGrid from './CapabilitiesGrid.svelte';
	import { CardCapability } from '#lib/models/cardcapabilities';
	import { type Capability } from '#lib/models/capabilities';

	interface Props extends StandardAttributeProps {
		cards: Array<Card>;
	}

	const { cards, ...attributes }: Props = $props();

	const searchState = getBrowserCardSearchState(() => cards);
	const cardCapabilities = $derived(
		searchState.filteredCards.flatMap((card) =>
			card.capabilities
				.filter((capability) => needsCapabilityCard(card, capability))
				.map((capability, index) => new CardCapability(card, capability, index))
		)
	);
</script>

<div {...standardAttributes(attributes, styles.browser)}>
	<CardSearchControls {searchState} />

	<section class={cx(styles.results, !searchState.ready && styles.resultsHidden)}>
		{#if searchState.filteredCards.length}
			<CapabilitiesGrid {cardCapabilities} />
		{:else}
			<p class={styles.noResultsNotice}>
				No s'ha trobat cap carta que coincideixi amb els filtres indicats.
			</p>
		{/if}
	</section>
</div>
