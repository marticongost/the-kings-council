<script lang="ts" module>
	import * as css from '#lib/styles';

	const simpleParagraphSpacing = '0.8em';
	const intermediateParagraphSpacing = '1.2em';
	const doubleParagraphSpacing = '1.5em';

	const styles = css.styles({
		root: {
			color: css.text.regularColor,
			lineHeight: '1.2em',
			'& > *:first-child': {
				marginTop: 0
			},
			'& > *:last-child': {
				marginBottom: 0
			},
			h1: {
				marginTop: doubleParagraphSpacing,
				color: css.palette.red,
				paddingBottom: '0.25em',
				borderImage: "url('/svg/decorations/separator.svg') 0 0 100% 0 / 0 0 0.1em 0 repeat"
			},
			h2: {
				marginTop: doubleParagraphSpacing,
				paddingBottom: '0.2em',
				borderBottom: css.separators.regularBorder
			},
			h3: {
				marginTop: intermediateParagraphSpacing,
				paddingBottom: '0.2em',
				borderBottom: css.separators.thinBorder
			},
			h4: {
				marginTop: intermediateParagraphSpacing
			}
		},
		heading: {
			fontFamily: css.fonts.heading,
			color: css.palette.wood,
			lineHeight: '1.1em',
			margin: 0,
			position: 'relative',
			'&:hover .heading-anchor, &:focus-within .heading-anchor': {
				opacity: 1
			}
		},
		headingLink: {
			position: 'absolute',
			right: 0,
			top: '50%',
			transform: 'translateY(-50%)',
			opacity: 0,
			transition: 'opacity 0.15s ease',
			textDecoration: 'none',
			fontSize: '1rem',
			color: 'inherit',
			'&:focus': {
				opacity: 1
			}
		},
		paragraph: {
			...css.vmargin(simpleParagraphSpacing)
		},
		list: {
			...css.vmargin(simpleParagraphSpacing),
			paddingLeft: css.spacing.lg,
			listStyleType: 'disc'
		},
		listItem: {
			margin: `${css.spacing.xs} 0`
		},
		blockquote: {
			borderLeft: `4px solid ${css.palette.sandal}`,
			margin: `${css.spacing.md} 0`,
			paddingLeft: css.spacing.md,
			color: css.text.subtleColor
		},
		table: {
			...css.vmargin(simpleParagraphSpacing)
		},
		code: {
			backgroundColor: css.palette.blush,
			border: `1px solid ${css.palette.thatch}`,
			borderRadius: '0.3em',
			padding: css.spacing.sm,
			margin: `${css.spacing.md} 0`,
			overflowX: 'auto'
		},
		inlineCode: {
			backgroundColor: css.palette.blush,
			border: `1px solid ${css.palette.thatch}`,
			borderRadius: '0.3em',
			padding: '0 0.25em',
			fontFamily: 'monospace'
		},
		link: {
			color: css.text.linkColor,
			fontWeight: 'bold',
			textDecorationLine: 'underline',
			textDecorationStyle: 'dotted',
			textUnderlineOffset: '0.2em',
			':hover': {
				textDecoration: 'underline',
				color: css.text.linkHoverColor,
				textDecorationStyle: 'solid'
			},
			'@media print': {
				textDecoration: 'none !important'
			}
		},
		hr: {
			border: 'none',
			borderTop: css.separators.regularBorder,
			margin: `${css.spacing.lg} 0`
		}
	});

	/** Concatenates the plain text of inline tokens (used to derive heading ids). */
	function inlineText(tokens: Token[]): string {
		let text = '';
		for (const token of tokens) {
			if (token.type === 'text' || token.type === 'escape' || token.type === 'codespan') {
				text += (token as Tokens.Text).text;
			} else if ('tokens' in token && Array.isArray(token.tokens)) {
				text += inlineText(token.tokens);
			} else if (token.type === 'br') {
				text += ' ';
			}
		}
		return text;
	}

	/** Matches a trailing `#anchor-id` override at the end of a heading. */
	const headingAnchor = '#([a-zA-Z][a-zA-Z0-9_-]*)';

	/** Extracts a heading's display title and an optional `#anchor-id` override. */
	function parseHeadingText(raw: string): { title: string; overrideId?: string } {
		const override = raw.match(new RegExp(`^(.*?)\\s+${headingAnchor}\\s*$`));
		let body = raw;
		let overrideId: string | undefined;
		if (override) {
			body = override[1];
			overrideId = override[2];
		}
		const title = body
			.replace(/\{[^}]*\}/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		return { title, overrideId };
	}

	/** Removes a trailing `#anchor-id` override from a heading's inline tokens. */
	function stripHeadingAnchor(tokens: Token[]): Token[] {
		const stripped = tokens.slice();
		for (let i = stripped.length - 1; i >= 0; i--) {
			const token = stripped[i];
			if (token.type === 'text' || token.type === 'escape' || token.type === 'codespan') {
				const text = (token as Tokens.Text).text.replace(
					new RegExp(`\\s*${headingAnchor}\\s*$`),
					''
				);
				stripped[i] = { ...token, text } as Tokens.Text;
				break;
			}
		}
		return stripped;
	}
</script>

<script lang="ts">
	import { lexer } from 'marked';
	import type { Token, Tokens } from 'marked';
	import { parse } from '#lib/models/effects';
	import { slugify } from '#lib/utils';
	import type { Snippet } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { cx } from '@emotion/css';
	import EffectsChunks from './EffectsChunks.svelte';
	import InlineSvg from './InlineSvg.svelte';
	import Table from './Table.svelte';
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		markdown: string;
	}

	const { markdown, ...rest }: Props = $props();

	const split = $derived.by(() => {
		const attributes: Record<string, unknown> = {};
		const blockSnippets: Record<string, Snippet<[text: string]>> = {};

		for (const [key, value] of Object.entries(rest)) {
			if (typeof value === 'function') {
				blockSnippets[key] = value as Snippet<[text: string]>;
			} else {
				attributes[key] = value;
			}
		}

		return { attributes, blockSnippets };
	});

	const tokens = $derived(lexer(markdown));

	const headings = $derived.by(() => {
		const byToken = new SvelteMap<Token, { id: string; title: string; tokens: Token[] }>();
		const used = new SvelteMap<string, number>();

		const visit = (blocks: Token[]): void => {
			for (const token of blocks) {
				if (token.type === 'heading') {
					const { title, overrideId } = parseHeadingText(inlineText(token.tokens ?? []));
					const base = slugify(overrideId ?? title) || `section-${byToken.size + 1}`;
					const count = used.get(base) ?? 0;
					used.set(base, count + 1);
					byToken.set(token, {
						id: count === 0 ? base : `${base}-${count}`,
						title,
						tokens: stripHeadingAnchor(token.tokens ?? [])
					});
				}
				if ('tokens' in token && Array.isArray(token.tokens)) {
					visit(token.tokens);
				}
			}
		};

		visit(tokens);
		return byToken;
	});

	const sectionTitles = $derived.by(() => {
		const byId = new SvelteMap<string, string>();
		for (const heading of headings.values()) {
			byId.set(heading.id, heading.title);
		}
		return byId;
	});

	const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

	function headingTag(depth: number): (typeof headingTags)[number] {
		return headingTags[Math.min(Math.max(depth, 1), 6) - 1];
	}
</script>

<div {...standardAttributes(split.attributes, styles.root)}>
	{#snippet renderBlocks(blocks: Token[])}
		{#each blocks as token (token)}
			{#if token.type === 'heading'}
				{@const heading = headings.get(token)}
				<svelte:element this={headingTag(token.depth)} class={styles.heading} id={heading?.id}>
					{#if heading}
						<a
							class={cx(styles.headingLink, 'heading-anchor')}
							href={`#${heading.id}`}
							aria-label={heading.title}
							title={heading.title}
						>
							<InlineSvg src="link.svg" aria-hidden="true" />
						</a>
					{/if}
					{@render renderInline(heading?.tokens ?? token.tokens ?? [])}
				</svelte:element>
			{:else if token.type === 'paragraph'}
				<p class={styles.paragraph}>
					{@render renderInline(token.tokens ?? [])}
				</p>
			{:else if token.type === 'text'}
				{@render renderInline(
					token.tokens ?? [{ type: 'text', raw: token.text, text: token.text }]
				)}
			{:else if token.type === 'list'}
				{#if token.ordered}
					<ol class={styles.list} start={token.start === '' ? undefined : token.start}>
						{#each token.items as item (item)}
							{@render renderListItem(item)}
						{/each}
					</ol>
				{:else}
					<ul class={styles.list}>
						{#each token.items as item (item)}
							{@render renderListItem(item)}
						{/each}
					</ul>
				{/if}
			{:else if token.type === 'blockquote'}
				<blockquote class={styles.blockquote}>
					{@render renderBlocks(token.tokens ?? [])}
				</blockquote>
			{:else if token.type === 'code'}
				{@const block = split.blockSnippets?.[token.lang]}
				{#if token.lang && block}
					{@render block(token.text)}
				{:else}
					<pre class={styles.code}><code>{token.text}</code></pre>
				{/if}
			{:else if token.type === 'table'}
				<Table class={styles.table}>
					<thead>
						<tr>
							{#each token.header as cell (cell)}
								{@render renderTableCell(cell)}
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each token.rows as row (row)}
							<tr>
								{#each row as cell (cell)}
									{@render renderTableCell(cell)}
								{/each}
							</tr>
						{/each}
					</tbody>
				</Table>
			{:else if token.type === 'hr'}
				<hr class={styles.hr} />
			{/if}
		{/each}
	{/snippet}

	{#snippet renderListItem(item: Tokens.ListItem)}
		<li class={styles.listItem}>
			{@render renderBlocks(item.tokens)}
		</li>
	{/snippet}

	{#snippet renderTableCell(cell: Tokens.TableCell)}
		{#if cell.header}
			<th style:text-align={cell.align ?? undefined}>
				{@render renderInline(cell.tokens)}
			</th>
		{:else}
			<td style:text-align={cell.align ?? undefined}>
				{@render renderInline(cell.tokens)}
			</td>
		{/if}
	{/snippet}

	{#snippet renderInline(inlineTokens: Token[])}
		{#each inlineTokens as token (token)}
			{#if token.type === 'text'}
				<EffectsChunks chunks={parse(token.text)} />
			{:else if token.type === 'escape'}
				{token.text}
			{:else if token.type === 'strong'}
				<strong>
					{@render renderInline(token.tokens ?? [])}
				</strong>
			{:else if token.type === 'em'}
				<em>
					{@render renderInline(token.tokens ?? [])}
				</em>
			{:else if token.type === 'del'}
				<del>
					{@render renderInline(token.tokens ?? [])}
				</del>
			{:else if token.type === 'codespan'}
				<code class={styles.inlineCode}>{token.text}</code>
			{:else if token.type === 'link'}
				{@const sectionId = token.href.startsWith('#') ? token.href.slice(1) : undefined}
				<a class={styles.link} href={token.href} title={token.title ?? undefined}>
					{#if sectionId !== undefined && (token.tokens?.length ?? 0) === 0}
						{sectionTitles.get(sectionId) ?? sectionId}
					{:else}
						{@render renderInline(token.tokens ?? [])}
					{/if}
				</a>
			{:else if token.type === 'br'}
				<br />
			{/if}
		{/each}
	{/snippet}

	{@render renderBlocks(tokens)}
</div>
