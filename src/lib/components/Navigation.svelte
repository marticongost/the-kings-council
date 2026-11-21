<script lang="ts" module>
	/* eslint-disable svelte/no-navigation-without-resolve */
	import * as css from '#lib/styles';

	const styles = css.styles({
		navigation: {},
		list: {
			...css.row(),
			alignItems: 'stretch',
			height: '100%',
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
			color: css.palette.buccaneer,
			boxShadow: `inset 0 0 1em 0.2em ${css.palette.sandal}a0, 0 0 0.5em rgba(0,0,0,0.15)`,
			'a:before': {
				backgroundColor: 'currentColor',
				width: '100%'
			}
		},
		link: {
			...css.column(),
			...css.vpadding('sm'),
			...css.hpadding('md'),
			width: '8em',
			height: '100%',
			alignItems: 'center',
			justifyContent: 'flex-end',
			fontSize: '1.2em',
			border: `1px dotted ${css.palette.gurkha}`
		},
		icon: {
			height: '2.4em',
			width: 'auto'
		},
		title: {}
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { standardAttributes, type StandardAttributeProps } from './utils';
	import type { NavigationEntry } from '#lib/navigation';
	import { cx } from '@emotion/css';
	import InlineSvg from './InlineSvg.svelte';

	interface Props extends StandardAttributeProps {
		entries: Array<NavigationEntry>;
	}

	const { entries, ...attributes }: Props = $props();
</script>

<nav {...standardAttributes(attributes, styles.navigation)}>
	<ul class={styles.list}>
		{#each entries as entry (entry.url)}
			<li class={cx(styles.entry, { [styles.selectedEntry]: entry.matches(page.url.pathname) })}>
				<a class={styles.link} href={entry.url}>
					<InlineSvg class={styles.icon} src="nav{entry.id}.svg" />
					<span class={styles.title}>
						{entry.title}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
