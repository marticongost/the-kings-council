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

		/* The site header and page padding are not part of the printed sheet. */
		:global(header) {
			display: none !important;
		}

		:global(main) {
			padding: 0 !important;
			overflow: visible !important;
		}
	}
</style>
