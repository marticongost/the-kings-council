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
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import { standardAttributes, type StandardAttributeProps } from './utils';
	import type { Card } from '#lib/models/cards';
	import { getBrowserCardSearchState } from '#lib/browsercardsearchstate.svelte';
	import CardGrid from './CardGrid.svelte';
	import CardSearchControls from './CardSearchControls.svelte';

	interface Props extends StandardAttributeProps {
		cards: Array<Card>;
	}

	const { cards, ...attributes }: Props = $props();

	const searchState = getBrowserCardSearchState(() => cards);
</script>

<div {...standardAttributes(attributes, styles.browser)}>
	<CardSearchControls {searchState} />

	<section class={cx(styles.results, !searchState.ready && styles.resultsHidden)}>
		{#if searchState.filteredCards.length}
			<CardGrid cards={searchState.filteredCards} />
		{:else}
			<p class={styles.noResultsNotice}>
				No s'ha trobat cap carta que coincideixi amb els filtres indicats.
			</p>
		{/if}
	</section>
</div>
