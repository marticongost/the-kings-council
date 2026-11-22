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
			position: 'relative',
			zIndex: 100,
			borderBottom: `2px solid currentColor`,
			backgroundColor: css.palette.linen,
			backgroundImage: `linear-gradient(to bottom, transparent, ${css.palette.moonMist})`,
			color: css.palette.sandal,
			flex: '0 0 auto',
			// Keep the header content centred within the same area as the scrolling content.
			...css.viewport.sm.orLarger().then({
				paddingRight: 'var(--scrollbar-width, 0px)'
			})
		},
		headerContent: {
			...css.site.documentWidth,
			...css.row('md'),
			alignItems: 'stretch',
			...css.viewport.xs.exactly().then({
				...css.hpadding('md')
			})
		},
		logoWrapper: {
			marginRight: 'auto',
			...css.vpadding('sm'),
			paddingRight: css.spacing.xl,
			...css.viewport.sm.orSmaller().then({
				width: 'auto',
				flex: '1 1 auto',
				paddingRight: css.spacing.lg
			})
		},
		logo: {
			height: '5em',
			width: 'auto'
		},
		main: {
			flex: '1 1 auto',
			overflow: 'auto'
		},
		mainContent: {
			...css.site.documentWidth,
			...css.viewport.xs.larger().then({
				marginTop: css.spacing.md
			})
		},
		mainContentFullBleed: {
			...css.site.fluidWidth
		},
		backdrop: {
			display: 'none',
			...css.viewport.sm.orSmaller().then({
				display: 'block',
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.4)',
				zIndex: 90
			})
		}
	});
</script>

<script lang="ts">
	import favicon from '#lib/assets/favicon.png?url';
	import Navigation from '#lib/components/Navigation.svelte';
	import { entries, getCurrentEntry } from '#lib/navigation';
	import { globalStyles } from '#lib/styles';
	import { injectGlobal } from '@emotion/css';
	import { page } from '$app/state';

	injectGlobal(globalStyles);

	let { children } = $props();

	const siteName = 'El Consell del Rei';
	const currentEntry = $derived(getCurrentEntry(page.url.pathname));
	const documentTitle = $derived(currentEntry ? `${currentEntry.title} · ${siteName}` : siteName);
	const fullBleed = $derived(page.data.fullBleed === true);
	let unfolded = $state(false);

	let mainElement = $state<HTMLElement>();
	let contentElement = $state<HTMLElement>();
	/** Width the main scrollbar takes, so the header content can align with the page content. */
	let scrollbarWidth = $state(0);

	$effect(() => {
		const main = mainElement;
		if (!main) return;

		const update = () => (scrollbarWidth = main.offsetWidth - main.clientWidth);
		update();

		// The content box resizes whenever the scrollbar appears or disappears.
		const observer = new ResizeObserver(update);
		if (contentElement) observer.observe(contentElement);
		window.addEventListener('resize', update);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', update);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{documentTitle}</title>
</svelte:head>

<div class={styles.layout} style="--scrollbar-width: {scrollbarWidth}px">
	<header class={styles.header}>
		<div class={styles.headerContent}>
			<div class={styles.logoWrapper}>
				<img class={styles.logo} src={logoUrl} alt="The King's Council" />
			</div>
			<Navigation {entries} bind:unfolded />
		</div>
	</header>

	{#if unfolded}
		<button
			class={styles.backdrop}
			type="button"
			aria-label="Tanca el menú"
			onclick={() => (unfolded = false)}
		></button>
	{/if}

	<main class={styles.main} bind:this={mainElement}>
		<div
			class={fullBleed ? styles.mainContentFullBleed : styles.mainContent}
			bind:this={contentElement}
		>
			{@render children()}
		</div>
	</main>
</div>
