<script lang="ts" module>
	/* eslint-disable svelte/no-navigation-without-resolve */
	import * as css from '#lib/styles';

	const styles = css.styles({
		layout: {
			...css.column(),
			height: '100vh',
			overflow: 'hidden'
		},
		header: {
			...css.row('md'),
			borderBottom: `2px solid ${css.palette.sandal}`,
			backgroundColor: css.palette.ivory,
			color: css.palette.sandal,
			flex: '0 0 auto'
		},
		main: {
			padding: css.spacing.md,
			flex: '1 1 auto',
			overflow: 'auto'
		}
	});
</script>

<script lang="ts">
	import favicon from '#lib/assets/favicon.svg?url';
	import Navigation from '#lib/components/Navigation.svelte';
	import { entries } from '#lib/navigation';
	import { globalStyles } from '#lib/styles';
	import { injectGlobal } from '@emotion/css';

	injectGlobal(globalStyles);

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class={styles.layout}>
	<header class={styles.header}>
		<Navigation {entries} />
	</header>

	<main class={styles.main}>
		{@render children()}
	</main>
</div>
