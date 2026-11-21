<script lang="ts" module>
	/* eslint-disable svelte/no-navigation-without-resolve */
	import * as css from '#lib/styles';
	import logoUrl from '#lib/assets/img/logo.png?url';

	const styles = css.styles({
		layout: {
			...css.column(),
			height: '100vh',
			overflow: 'hidden'
		},
		header: {
			...css.row('md'),
			alignItems: 'stretch',
			borderBottom: `2px solid ${css.palette.sandal}`,
			backgroundColor: css.palette.ivory,
			color: css.palette.sandal,
			flex: '0 0 auto'
		},
		logoWrapper: {
			width: '17em',
			...css.vpadding('sm'),
			...css.hpadding('md')
		},
		logo: {
			height: '5em',
			width: 'auto'
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
		<div class={styles.logoWrapper}>
			<img class={styles.logo} src={logoUrl} alt="The King's Council" />
		</div>
		<Navigation {entries} />
	</header>

	<main class={styles.main}>
		{@render children()}
	</main>
</div>
