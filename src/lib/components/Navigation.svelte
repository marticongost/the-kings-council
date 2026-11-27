<script lang="ts" module>
	import * as css from '#lib/styles';

	/** Size of the icon slot of a menu entry. */
	const menuIconSize = '1.3em';

	/** Icon plus the gap before its label, the amount a child level is indented. */
	const menuIndentStep = '1.8em';

	/** Left padding of a menu entry, so each level starts under its parent's label. */
	const menuIndent = (depth: number) => `calc(${css.spacing.sm} + ${depth} * ${menuIndentStep})`;

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
		desktopList: {
			...css.row(),
			alignItems: 'stretch',
			height: '100%',
			listStyleType: 'none',
			flex: '1 1 auto',
			minWidth: 0,
			...css.viewport.sm.orSmaller().hide()
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
		group: {
			position: 'relative',
			height: '100%',
			'&:hover > ul, &:focus-within > ul': {
				display: 'block'
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
		},
		popover: {
			position: 'absolute',
			top: '100%',
			left: 0,
			zIndex: 100,
			display: 'none',
			minWidth: '100%',
			listStyleType: 'none',
			backgroundColor: css.palette.linen,
			border: `1px solid ${css.palette.gurkha}`,
			boxShadow: '0 0.5em 1em rgba(0, 0, 0, 0.2)'
		},
		popoverLast: {
			left: 'auto',
			right: 0
		},
		popoverLink: {
			display: 'flex',
			alignItems: 'center',
			gap: css.spacing.sm,
			padding: `${css.spacing.xs} ${css.spacing.sm}`,
			fontSize: '0.95em',
			fontWeight: 600,
			color: css.palette.sandal,
			whiteSpace: 'nowrap',
			'&:hover': {
				backgroundColor: css.palette.ivory
			}
		},
		popoverGroup: {
			display: 'flex',
			alignItems: 'center',
			gap: css.spacing.sm,
			padding: `${css.spacing.xs} ${css.spacing.sm}`,
			fontSize: '0.95em',
			fontWeight: 600,
			color: css.palette.sandal,
			whiteSpace: 'nowrap'
		},
		popoverChildren: {
			listStyleType: 'none'
		},
		popoverSelected: {
			color: css.palette.buccaneer,
			fontWeight: 900,
			'--icon-opacity': 1,
			'&:hover': {
				backgroundColor: 'transparent'
			}
		},
		popoverIcon: {
			height: menuIconSize,
			width: menuIconSize,
			flex: '0 0 auto',
			opacity: 'var(--icon-opacity, 0.7)'
		},
		treePanel: {
			display: 'none',
			...css.viewport.sm.orSmaller().then({
				position: 'absolute',
				top: '100%',
				left: 0,
				right: 0,
				maxHeight: '80vh',
				overflowY: 'auto',
				backgroundColor: css.palette.linen,
				boxShadow: '0 0.5em 1em rgba(0, 0, 0, 0.2)',
				zIndex: 100
			})
		},
		treePanelOpen: {
			...css.viewport.sm.orSmaller().then({
				display: 'block'
			})
		},
		treeList: {
			listStyleType: 'none'
		}
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
		unfolded?: boolean;
	}

	let { entries, unfolded = $bindable(false), ...attributes }: Props = $props();

	const pathname = $derived(page.url.pathname);

	/** A section is highlighted while it or any of its child pages is current. */
	function isCurrent(entry: NavigationEntry, path: string): boolean {
		return entry.children.length > 0 ? entry.contains(path) : entry.matches(path);
	}
</script>

{#snippet popoverItems(nodes: ReadonlyArray<NavigationEntry>, depth: number)}
	{#each nodes as node (node.title)}
		<li>
			{#if node.url}
				<a
					class={cx(styles.popoverLink, {
						[styles.popoverSelected]: isCurrent(node, pathname)
					})}
					style="padding-left: {menuIndent(depth)}"
					href={node.url}
				>
					<InlineSvg class={styles.popoverIcon} src={node.icon ?? 'nav/chevron.svg'} />
					{node.title}
				</a>
			{:else}
				<span class={styles.popoverGroup} style="padding-left: {menuIndent(depth)}">
					<InlineSvg class={styles.popoverIcon} src={node.icon ?? 'nav/chevron.svg'} />
					{node.title}
				</span>
			{/if}
			{#if node.children.length > 0}
				<ul class={styles.popoverChildren}>
					{@render popoverItems(node.children, depth + 1)}
				</ul>
			{/if}
		</li>
	{/each}
{/snippet}

{#snippet treeItems(nodes: ReadonlyArray<NavigationEntry>, depth: number)}
	{#each nodes as node (node.title)}
		<li>
			{#if node.url}
				<a
					class={cx(styles.popoverLink, {
						[styles.popoverSelected]: isCurrent(node, pathname)
					})}
					style="padding-left: {menuIndent(depth)}"
					href={node.url}
					onclick={() => (unfolded = false)}
				>
					<InlineSvg class={styles.popoverIcon} src={node.icon ?? 'nav/chevron.svg'} />
					{node.title}
				</a>
			{:else}
				<span
					class={cx(styles.popoverGroup, {
						[styles.popoverSelected]: node.contains(pathname)
					})}
					style="padding-left: {menuIndent(depth)}"
				>
					<InlineSvg class={styles.popoverIcon} src={node.icon ?? 'nav/chevron.svg'} />
					{node.title}
				</span>
			{/if}
			{#if node.children.length > 0}
				<ul class={styles.popoverChildren}>
					{@render treeItems(node.children, depth + 1)}
				</ul>
			{/if}
		</li>
	{/each}
{/snippet}

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

	<ul class={styles.desktopList}>
		{#each entries as entry, index (entry.title)}
			<li
				class={cx(styles.entry, {
					[styles.selectedEntry]: entry.contains(pathname)
				})}
			>
				{#if entry.children.length > 0}
					<div class={styles.group}>
						<a class={styles.link} href={entry.url}>
							{#if entry.icon}
								<InlineSvg class={styles.icon} src={entry.icon} />
							{/if}
							<span class={styles.title}>
								{entry.title}
							</span>
						</a>
						<ul
							class={cx(styles.popover, {
								[styles.popoverLast]: index === entries.length - 1
							})}
						>
							{@render popoverItems(entry.children, 0)}
						</ul>
					</div>
				{:else}
					<a class={styles.link} href={entry.url}>
						{#if entry.icon}
							<InlineSvg class={styles.icon} src={entry.icon} />
						{/if}
						<span class={styles.title}>
							{entry.title}
						</span>
					</a>
				{/if}
			</li>
		{/each}
	</ul>

	<div id="navigation-menu" class={cx(styles.treePanel, { [styles.treePanelOpen]: unfolded })}>
		<ul class={styles.treeList}>
			{@render treeItems(entries, 0)}
		</ul>
	</div>
</nav>
