import { page } from '$app/state';
import { browser } from '$app/env';
import { replaceState } from '$app/navigation';
import type { ResolvedPathname } from '$app/types';
import { SvelteSet, SvelteURL } from 'svelte/reactivity';
import type { Card } from '#lib/models/cards';
import { getProperties, type PropertyId } from '#lib/models/properties';
import {
	countByOption,
	countByProperty,
	filterCards,
	findFilterOption,
	getVisibleOptionIds,
	getVisiblePropertyIds
} from '#lib/search';

export type BrowserCardSearchState = {
	search: string;
	selectedFilter: string;
	selectedProperties: Array<PropertyId>;
	readonly optionCounts: Map<string, number>;
	readonly propertyCounts: Map<PropertyId, number>;
	readonly visibleOptionIds: ReadonlySet<string>;
	readonly visiblePropertyIds: ReadonlySet<PropertyId>;
	readonly filteredCards: Array<Card>;
};

/**
 * Reactive state for a card browser: search and filter values initialised from
 * the current URL and kept in sync with it via `replaceState`. Use it together
 * with `CardSearchControls` (binding `search`, `selectedFilter` and
 * `selectedProperties`) to render any kind of card listing.
 */
export function getBrowserCardSearchState(getCards: () => Array<Card>): BrowserCardSearchState {
	// Search params are only available in the browser; during prerendering there
	// is no query string, so start from empty defaults.
	const params = browser ? page.url.searchParams : new URLSearchParams();
	const validPropertyIds = new SvelteSet(getProperties().map((property) => property.id));
	const filterParam = params.get('filter');

	let search = $state(params.get('q') ?? '');
	let selectedFilter = $state(filterParam && findFilterOption(filterParam) ? filterParam : 'all');
	let selectedProperties = $state<Array<PropertyId>>(
		params.getAll('p').filter((id): id is PropertyId => validPropertyIds.has(id as PropertyId))
	);

	function currentHref(): ResolvedPathname {
		const url = new SvelteURL(page.url.href);

		if (search) url.searchParams.set('q', search);
		else url.searchParams.delete('q');

		if (selectedFilter && selectedFilter !== 'all') url.searchParams.set('filter', selectedFilter);
		else url.searchParams.delete('filter');

		url.searchParams.delete('p');
		for (const id of selectedProperties) url.searchParams.append('p', id);

		return (page.url.pathname + url.search) as ResolvedPathname;
	}

	$effect(() => {
		const href = currentHref();
		if (href === page.url.pathname + page.url.search) return;
		replaceState(href, {});
	});

	const optionCounts = $derived(countByOption(getCards(), search, selectedProperties));
	const propertyCounts = $derived(
		countByProperty(getCards(), search, selectedFilter, selectedProperties)
	);
	const filteredCards = $derived(
		filterCards(getCards(), search, selectedFilter, selectedProperties)
	);
	const visibleOptionIds = $derived(getVisibleOptionIds(getCards()));
	const visiblePropertyIds = $derived(getVisiblePropertyIds(getCards()));

	return {
		get search() {
			return search;
		},
		set search(value: string) {
			search = value;
		},
		get selectedFilter() {
			return selectedFilter;
		},
		set selectedFilter(value: string) {
			selectedFilter = value;
		},
		get selectedProperties() {
			return selectedProperties;
		},
		set selectedProperties(value: Array<PropertyId>) {
			selectedProperties = value;
		},
		get optionCounts() {
			return optionCounts;
		},
		get propertyCounts() {
			return propertyCounts;
		},
		get filteredCards() {
			return filteredCards;
		},
		get visibleOptionIds() {
			return visibleOptionIds;
		},
		get visiblePropertyIds() {
			return visiblePropertyIds;
		}
	};
}
