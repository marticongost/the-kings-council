<script lang="ts">
	import CardBackSheet from '#lib/components/CardBackSheet.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<CardBackSheet type={data.type} />

<style>
	@media print {
		@page {
			size: A4;
			margin: 0;
		}

		/* The sheet fills the whole page, so the document width does not apply to it. */
		:global(main > div) {
			max-width: none !important;
		}
	}
</style>
