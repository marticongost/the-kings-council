<script lang="typescript">
	import CapabilitiesBrowser from '#lib/components/CapabilitiesBrowser.svelte';
	import { cardsCatalog } from '#lib/data/catalog';
</script>

<CapabilitiesBrowser cards={cardsCatalog.all()} />
