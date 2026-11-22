<script lang="ts" module>
	/* eslint-disable svelte/no-navigation-without-resolve */
	import * as css from '#lib/styles';

	const styles = css.styles({
		navigation: {
			display: 'flex',
			alignItems: 'stretch',
			flex: '1 1 auto',
			minWidth: 0,
			...css.viewport.sm.orSmaller().then({
				flex: '0 0 auto',
				alignItems: 'center',
				justifyContent: 'flex-end'
			})
		},
		toggle: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			...css.vpadding('sm'),
			...css.viewport.md.orLarger().hide()
		},
		toggleIcon: {
			...css.column('0.2em'),
			width: '1.8em'
		},
		bar: {
			height: '0.18em',
			backgroundColor: 'currentColor'
		},
		list: {
			...css.row(),
			alignItems: 'stretch',
			height: '100%',
			listStyleType: 'none',
			flex: '1 1 auto',
			minWidth: 0,
			...css.viewport.sm.orSmaller().then({
				display: 'none'
			})
		},
		unfoldedList: {
			...css.viewport.sm.orSmaller().then({
				display: 'grid',
				gridTemplateColumns: 'repeat(2, 1fr)',
				position: 'absolute',
				top: '100%',
				left: 0,
				right: 0,
				height: 'auto',
				backgroundColor: css.palette.linen,
				border: `1px solid ${css.palette.gurkha}`,
				boxShadow: `0 0.5em 1em rgba(0, 0, 0, 0.2)`,
				zIndex: 100
			})
		},
		entry: {
			fontWeight: 600,
			position: 'relative',
			flex: '1 1 0',
			minWidth: 0,
			'a:before': {
				content: '""',
				position: 'absolute',
				bottom: 0,
				left: '50%',
				transform: 'translateX(-50%)',
				width: 0,
				height: '0.1em',
				backgroundColor: 'transparent',
				transition: 'width 0.3s linear, background-color 0.3s linear'
			}
		},
		selectedEntry: {
			fontWeight: 900,
			color: css.palette.buccaneer,
			boxShadow: `inset 0 0 1em 0.2em ${css.palette.sandal}a0, 0 0 0.5em rgba(0,0,0,0.15)`,
			'--icon-opacity': 1,
			'a:before': {
				backgroundColor: 'currentColor',
				width: '100%'
			}
		},
		link: {
			...css.column(),
			...css.vpadding('sm'),
			...css.hpadding('sm'),
			width: '100%',
			height: '100%',
			alignItems: 'center',
			justifyContent: 'flex-end',
			fontSize: '1.2em',
			border: `1px dotted ${css.palette.gurkha}`,
			...css.viewport.sm.orSmaller().then({
				height: 'auto',
				justifyContent: 'center'
			}),
			...css.viewport.md.exactly().then({
				fontSize: '1em'
			})
		},
		icon: {
			height: '2.4em',
			width: 'auto',
			opacity: 'var(--icon-opacity, 0.7)',
			transition: 'opacity 0.2s linear',
			...css.viewport.md.exactly().then({
				height: '2.2em'
			})
		},
		title: {
			...css.viewport.md.exactly().then({
				fontSize: '0.9em'
			})
		}
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { standardAttributes, type StandardAttributeProps } from './utils';
	import { getCurrentEntry, type NavigationEntry } from '#lib/navigation';
	import { cx } from '@emotion/css';
	import InlineSvg from './InlineSvg.svelte';

	interface Props extends StandardAttributeProps {
		entries: Array<NavigationEntry>;
		unfolded?: boolean;
	}

	let { entries, unfolded = $bindable(false), ...attributes }: Props = $props();

	const currentEntry = $derived(getCurrentEntry(page.url.pathname));
</script>

<nav {...standardAttributes(attributes, styles.navigation)}>
	<button
		class={styles.toggle}
		type="button"
		aria-label="Menú"
		aria-expanded={unfolded}
		aria-controls="navigation-menu"
		onclick={() => (unfolded = !unfolded)}
	>
		<span class={styles.toggleIcon} aria-hidden="true">
			<span class={styles.bar}></span>
			<span class={styles.bar}></span>
			<span class={styles.bar}></span>
		</span>
	</button>

	<ul id="navigation-menu" class={cx(styles.list, { [styles.unfoldedList]: unfolded })}>
		{#each entries as entry (entry.url)}
			<li class={cx(styles.entry, { [styles.selectedEntry]: entry === currentEntry })}>
				<a class={styles.link} href={entry.url} onclick={() => (unfolded = false)}>
					<InlineSvg class={styles.icon} src="nav{entry.id}.svg" />
					<span class={styles.title}>
						{entry.title}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
