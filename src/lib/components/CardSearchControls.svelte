<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		controls: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: css.spacing.md,
			...css.viewport.xl.orLarger().then({
				flexDirection: 'row',
				flexWrap: 'wrap'
			}),
			...css.viewport.xs.exactly().then({
				padding: css.spacing.md
			}),
			'@media print': {
				// The controls are not part of the printed card sheets.
				display: 'none'
			}
		},
		search: {
			flex: '0 0 auto',
			width: '16em',
			height: css.forms.controlHeight,
			...css.hpadding('sm'),
			border: css.forms.controlBorder,
			backgroundColor: css.forms.controlBackgroundColor,
			color: css.text.regularColor,
			fontFamily: css.fonts.text,
			fontSize: '1em',
			...css.focus.mixin,
			...css.viewport.sm.orSmaller().then({
				width: '100%'
			}),
			...css.viewport.xl.orLarger().then({
				flexGrow: 1
			})
		},
		dropdown: {
			position: 'relative',
			flex: '0 0 auto',
			width: '16em',
			...css.viewport.sm.orSmaller().then({
				width: '100%'
			})
		},
		trigger: {
			...css.row('xs'),
			width: '100%',
			height: css.forms.controlHeight,
			...css.hpadding('sm'),
			border: css.forms.controlBorder,
			backgroundColor: css.forms.controlBackgroundColor,
			color: css.text.regularColor,
			fontFamily: css.fonts.text,
			fontSize: '1em',
			whiteSpace: 'nowrap',
			cursor: 'pointer',
			listStyle: 'none',
			'&::-webkit-details-marker': {
				display: 'none'
			},
			'&:focus-visible': {
				outline: css.focus.outline
			}
		},
		triggerLabel: {
			flex: '0 0 auto',
			fontWeight: 900,
			color: css.palette.wood
		},
		triggerValue: {
			flex: '1 1 auto',
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis'
		},
		caret: {
			flex: '0 0 auto',
			fontSize: '0.8em',
			color: css.palette.wood,
			transition: 'transform 0.15s',
			'details[open] &': {
				transform: 'rotate(180deg)'
			}
		},
		menu: {
			position: 'absolute',
			top: '100%',
			left: 0,
			zIndex: 10,
			minWidth: '100%',
			maxWidth: 'min(24em, calc(100vw - 2em))',
			maxHeight: '20em',
			overflowY: 'auto',
			margin: 0,
			padding: 0,
			listStyleType: 'none',
			backgroundColor: css.palette.linen,
			border: css.forms.controlBorder,
			boxShadow: '0 0.25em 0.75em rgba(0, 0, 0, 0.25)'
		},
		menuRight: {
			left: 'auto',
			right: 0
		},
		groupHeading: {
			...css.vpadding('xs'),
			...css.hpadding('sm'),
			borderTop: css.separators.regularBorder,
			backgroundColor: css.palette.wheat,
			color: css.palette.sandal,
			fontSize: '0.85em',
			fontWeight: 900,
			textTransform: 'uppercase'
		},
		filter: {
			borderTop: css.separators.thinBorder
		},
		filterLabel: {
			...css.row('sm'),
			fontSize: '0.9em',
			width: '100%',
			...css.vpadding('sm'),
			...css.hpadding('sm'),
			cursor: 'pointer',
			color: css.palette.wood,
			'&:has(input:focus-visible)': {
				outline: css.focus.outline
			}
		},
		radio: {
			position: 'absolute',
			width: '1px',
			height: '1px',
			margin: '-1px',
			padding: 0,
			overflow: 'hidden',
			clip: 'rect(0 0 0 0)',
			clipPath: 'inset(50%)',
			whiteSpace: 'nowrap',
			border: 0
		},
		checkbox: {
			margin: 0,
			accentColor: css.palette.sandal
		},
		count: {
			marginLeft: 'auto',
			color: css.text.mutedColor,
			fontFamily: css.fonts.number,
			fontSize: '0.9em'
		},
		selectedTitle: {
			fontWeight: 700
		},
		dimmed: {
			opacity: 0.4
		},
		resetButton: {
			flex: '0 0 auto',
			width: '10em',
			...css.viewport.sm.orSmaller().then({
				width: '100%'
			})
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import { standardAttributes, type StandardAttributeProps } from './utils';
	import {
		filterEntries,
		filterableProperties,
		findFilterOption,
		type FilterEntry
	} from '#lib/search';
	import type { BrowserCardSearchState } from '#lib/browsercardsearchstate.svelte';
	import Button from './Button.svelte';

	interface Props extends StandardAttributeProps {
		searchState: BrowserCardSearchState;
	}

	let { searchState, ...attributes }: Props = $props();

	let typeDropdown = $state<HTMLDetailsElement>();
	let propertiesDropdown = $state<HTMLDetailsElement>();

	function closeDropdowns() {
		if (typeDropdown) typeDropdown.open = false;
		if (propertiesDropdown) propertiesDropdown.open = false;
	}

	function clearFilters() {
		searchState.search = '';
		searchState.selectedFilter = 'all';
		searchState.selectedProperties = [];
		closeDropdowns();
	}

	$effect(() => {
		function closeOnPointerDown(event: PointerEvent) {
			for (const dropdown of [typeDropdown, propertiesDropdown]) {
				if (dropdown?.open && !dropdown.contains(event.target as Node)) {
					dropdown.open = false;
				}
			}
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') closeDropdowns();
		}

		document.addEventListener('pointerdown', closeOnPointerDown);
		document.addEventListener('keydown', closeOnEscape);
		return () => {
			document.removeEventListener('pointerdown', closeOnPointerDown);
			document.removeEventListener('keydown', closeOnEscape);
		};
	});

	const visibleEntries: ReadonlyArray<FilterEntry> = $derived(
		filterEntries.flatMap((entry): Array<FilterEntry> => {
			if (entry.kind === 'group') {
				const options = entry.options.filter((option) =>
					searchState.visibleOptionIds.has(option.id)
				);
				return options.length ? [{ ...entry, options }] : [];
			}
			return searchState.visibleOptionIds.has(entry.id) ? [entry] : [];
		})
	);

	const visibleProperties = $derived(
		filterableProperties.filter((property) => searchState.visiblePropertyIds.has(property.id))
	);

	const selectedFilterTitle = $derived(
		findFilterOption(searchState.selectedFilter)?.title ?? searchState.selectedFilter
	);

	const selectedPropertyTitles = $derived(
		searchState.selectedProperties
			.map((id) => filterableProperties.find((property) => property.id === id)?.title)
			.filter((title): title is string => title !== undefined)
	);

	const propertiesTitle = $derived(
		selectedPropertyTitles.length ? selectedPropertyTitles.join(', ') : 'Qualsevol'
	);
</script>

<div
	{...standardAttributes(attributes, styles.controls)}
	role="search"
	aria-label="Cerca i filtres de cartes"
>
	<input
		class={styles.search}
		type="search"
		placeholder="Cerca..."
		aria-label="Cerca cartes"
		bind:value={searchState.search}
	/>

	<details class={styles.dropdown} bind:this={typeDropdown}>
		<summary class={styles.trigger}>
			<span class={styles.triggerLabel}>Tipus de carta:</span>
			<span class={styles.triggerValue}>{selectedFilterTitle}</span>
			<span class={styles.caret} aria-hidden="true">▾</span>
		</summary>

		<ul class={styles.menu}>
			{#each visibleEntries as entry (entry.id)}
				{#if entry.kind === 'group'}
					<li class={styles.groupHeading}>{entry.title}</li>
					{#each entry.options as option (option.id)}
						<li
							class={cx(styles.filter, {
								[styles.dimmed]: (searchState.optionCounts.get(option.id) ?? 0) === 0
							})}
						>
							<label class={styles.filterLabel}>
								<input
									class={styles.radio}
									type="radio"
									name="card-type-filter"
									value={option.id}
									bind:group={searchState.selectedFilter}
									onchange={closeDropdowns}
								/>
								<span
									class={searchState.selectedFilter === option.id
										? styles.selectedTitle
										: undefined}>{option.title}</span
								>
								<span class={styles.count}>{searchState.optionCounts.get(option.id) ?? 0}</span>
							</label>
						</li>
					{/each}
				{:else}
					<li
						class={cx(styles.filter, {
							[styles.dimmed]: (searchState.optionCounts.get(entry.id) ?? 0) === 0
						})}
					>
						<label class={styles.filterLabel}>
							<input
								class={styles.radio}
								type="radio"
								name="card-type-filter"
								value={entry.id}
								bind:group={searchState.selectedFilter}
								onchange={closeDropdowns}
							/>
							<span
								class={searchState.selectedFilter === entry.id ? styles.selectedTitle : undefined}
								>{entry.title}</span
							>
							<span class={styles.count}>{searchState.optionCounts.get(entry.id) ?? 0}</span>
						</label>
					</li>
				{/if}
			{/each}
		</ul>
	</details>

	<details class={styles.dropdown} bind:this={propertiesDropdown}>
		<summary class={styles.trigger}>
			<span class={styles.triggerLabel}>Propietats:</span>
			<span class={styles.triggerValue}>{propertiesTitle}</span>
			<span class={styles.caret} aria-hidden="true">▾</span>
		</summary>

		<ul class={cx(styles.menu, styles.menuRight)}>
			{#each visibleProperties as property (property.id)}
				<li
					class={cx(styles.filter, {
						[styles.dimmed]: (searchState.propertyCounts.get(property.id) ?? 0) === 0
					})}
				>
					<label class={styles.filterLabel}>
						<input
							class={styles.checkbox}
							type="checkbox"
							value={property.id}
							bind:group={searchState.selectedProperties}
						/>
						<span
							class={searchState.selectedProperties.includes(property.id)
								? styles.selectedTitle
								: undefined}>{property.title}</span
						>
						<span class={styles.count}>{searchState.propertyCounts.get(property.id) ?? 0}</span>
					</label>
				</li>
			{/each}
		</ul>
	</details>

	<Button class={styles.resetButton} onclick={clearFilters}>Neteja els filtres</Button>
</div>
