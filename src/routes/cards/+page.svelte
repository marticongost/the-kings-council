<script lang="typescript">
	import CardBrowser from '#lib/components/CardBrowser.svelte';
	import { cardsCatalog } from '#lib/data/catalog';
</script>

<CardBrowser
	cards={cardsCatalog.all().filter((card) => card.type !== 'tactic' && card.type !== 'common')}
/>
