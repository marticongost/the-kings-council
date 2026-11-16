<script lang="typescript">
	import CardBrowser from '#lib/components/CardBrowser.svelte';
	import { cardsCatalog } from '#lib/data/catalog';
	import { isFateCard } from '#lib/models/cards';

	const cards = cardsCatalog
		.all()
		.filter((card) => card.type !== 'tactic' && card.type !== 'common' && !isFateCard(card));
</script>

<CardBrowser {cards} />
