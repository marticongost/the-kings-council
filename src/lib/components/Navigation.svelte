<script lang="ts" module>
	/* eslint-disable svelte/no-navigation-without-resolve */
	import * as css from '#lib/styles';

	const styles = css.styles({
		navigation: {},
		list: {
			...css.row(),
			listStyleType: 'none'
		},
		entry: {
			position: 'relative',
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
			'a:before': {
				backgroundColor: css.palette.sandal,
				width: '100%'
			}
		},
		link: {
			display: 'block',
			...css.vpadding('sm'),
			...css.hpadding('md'),
			fontSize: '1.2em'
		}
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { standardAttributes, type StandardAttributeProps } from './utils';
	import type { NavigationEntry } from '#lib/navigation';
	import { cx } from '@emotion/css';

	interface Props extends StandardAttributeProps {
		entries: Array<NavigationEntry>;
	}

	const { entries, ...attributes }: Props = $props();
</script>

<nav {...standardAttributes(attributes, styles.navigation)}>
	<ul class={styles.list}>
		{#each entries as entry (entry.url)}
			<li class={cx(styles.entry, { [styles.selectedEntry]: entry.matches(page.url.pathname) })}>
				<a class={styles.link} href={entry.url}>{entry.title}</a>
			</li>
		{/each}
	</ul>
</nav>
