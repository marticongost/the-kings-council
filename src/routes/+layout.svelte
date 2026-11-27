<script lang="ts" module>
	import * as css from '#lib/styles';
	import logoUrl from '#lib/assets/img/logo.png?url';

	const styles = css.styles({
		layout: {
			...css.column(),
			height: '100vh',
			overflow: 'hidden',
			'@media print': {
				// A viewport-sized, clipped box would cut the printed document at its first page.
				height: 'auto',
				overflow: 'visible'
			}
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
			}),
			'@media print': {
				// The site header is not part of any printed page.
				display: 'none'
			}
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
			overflow: 'auto',
			'@media print': {
				// Printing paginates the document itself, so the scroll container must not clip it.
				overflow: 'visible'
			}
		},
		mainContent: {
			...css.site.documentWidth,
			...css.viewport.xs.larger().then({
				marginTop: css.spacing.md
			}),
			'@media print': {
				// Printed pages, and printed sheets in particular, start at the top of the paper.
				marginTop: 0
			}
		},
		mainContentFullBleed: {
			...css.site.fluidWidth,
			'@media print': {
				// Printed sheets use the whole width of the paper.
				paddingLeft: 0,
				paddingRight: 0
			}
		},
		pageHeaderBar: {
			...css.site.documentWidth,
			'@media print': {
				display: 'none'
			}
		},
		pageHeader: {
			...css.column('xs'),
			paddingTop: css.spacing.md,
			paddingBottom: css.spacing.md,
			...css.viewport.xs.exactly().then({
				...css.hpadding('md')
			}),
			'@media print': {
				display: 'none'
			}
		},
		breadcrumbList: {
			...css.row('xs'),
			flexWrap: 'wrap',
			listStyleType: 'none',
			fontSize: '0.85em',
			color: css.palette.tobacco
		},
		breadcrumbItem: {
			...css.row('xs'),
			'&:not(:last-child):after': {
				content: '"›"',
				color: css.palette.gurkha
			}
		},
		breadcrumbLink: {
			color: 'inherit',
			'&:hover': {
				color: css.palette.buccaneer,
				textDecoration: 'underline'
			}
		},
		breadcrumbCurrent: {
			color: css.palette.wood,
			fontWeight: 600
		},
		pageTitle: {
			...css.document.titleTypography,
			color: css.palette.wood,
			marginBottom: css.spacing.md
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
	import { entries, getCurrentTrail } from '#lib/navigation';
	import { globalStyles } from '#lib/styles';
	import { injectGlobal } from '@emotion/css';
	import { page } from '$app/state';

	injectGlobal(globalStyles);

	let { children } = $props();

	const siteName = 'El Consell del Rei';
	const trail = $derived(getCurrentTrail(page.url.pathname));
	const currentEntry = $derived(trail.at(-1));
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

{#snippet pageHeader()}
	{#if currentEntry}
		<div class={styles.pageHeader}>
			{#if trail.length > 1}
				<nav aria-label="Fil d'Ariadna">
					<ol class={styles.breadcrumbList}>
						{#each trail as entry, index (index)}
							<li class={styles.breadcrumbItem}>
								{#if index === trail.length - 1}
									<span class={styles.breadcrumbCurrent} aria-current="page">
										{entry.title}
									</span>
								{:else if entry.url}
									<a class={styles.breadcrumbLink} href={entry.url}>
										{entry.title}
									</a>
								{:else}
									<span>{entry.title}</span>
								{/if}
							</li>
						{/each}
					</ol>
				</nav>
			{/if}
			<h1 class={styles.pageTitle}>{currentEntry.title}</h1>
		</div>
	{/if}
{/snippet}

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
		{#if fullBleed}
			<div class={styles.pageHeaderBar}>
				{@render pageHeader()}
			</div>
		{/if}
		<div
			class={fullBleed ? styles.mainContentFullBleed : styles.mainContent}
			bind:this={contentElement}
		>
			{#if !fullBleed}
				{@render pageHeader()}
			{/if}
			{@render children()}
		</div>
	</main>
</div>
