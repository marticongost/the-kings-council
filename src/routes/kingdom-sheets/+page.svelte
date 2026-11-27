<script lang="ts">
	import KingdomSheet from '#lib/components/KingdomSheet.svelte';

	const playerCounts = [1, 2, 3, 4, 5, 6, 7, 8];
</script>

<div class="sheets">
	{#each playerCounts as players (players)}
		<KingdomSheet {players} />
	{/each}
</div>

<style>
	.sheets {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	@media print {
		@page {
			size: A4;
			margin: 0;
		}

		.sheets {
			gap: 0;
		}
	}
</style>
