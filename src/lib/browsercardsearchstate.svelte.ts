import { page, type ReadonlyURLSearchParams } from '$app/state';
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
	readonly ready: boolean;
	readonly optionCounts: Map<string, number>;
	readonly propertyCounts: Map<PropertyId, number>;
	readonly visibleOptionIds: ReadonlySet<string>;
	readonly visiblePropertyIds: ReadonlySet<PropertyId>;
	readonly filteredCards: Array<Card>;
};

/**
 * Reactive state for a card browser: search and filter values kept in sync with
 * the URL. Values are adopted from the URL after mounting and on navigation, and
 * written back to it via `replaceState`. Use it together with
 * `CardSearchControls` (binding `search`, `selectedFilter` and
 * `selectedProperties`) to render any kind of card listing.
 */
export function getBrowserCardSearchState(getCards: () => Array<Card>): BrowserCardSearchState {
	const validPropertyIds = new SvelteSet(getProperties().map((property) => property.id));

	// Pages are prerendered without a query string, so the server always renders
	// the default (unfiltered) listing. Start from those same defaults here and
	// adopt the URL only after mounting; otherwise hydration would replace the
	// server-rendered cards with a different set and Svelte could reuse the
	// existing DOM nodes for the wrong cards.
	let search = $state('');
	let selectedFilter = $state('all');
	let selectedProperties = $state<Array<PropertyId>>([]);
	// Becomes true once the state has been adopted from the URL for the first
	// time (i.e. after mounting). While false, the server-rendered listing must
	// stay hidden so the unfiltered cards it contains never flash into view.
	let ready = $state(false);

	function applySearchParams(params: ReadonlyURLSearchParams) {
		const filterParam = params.get('filter');

		search = params.get('q') ?? '';
		selectedFilter = filterParam && findFilterOption(filterParam) ? filterParam : 'all';
		selectedProperties = params
			.getAll('p')
			.filter((id): id is PropertyId => validPropertyIds.has(id as PropertyId));
	}

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

	// Adopt URL changes (including the initial query string, browser history and
	// client-side navigations) unless they already match the current state.
	// This effect must be registered before the one below so that a new URL wins
	// over the previous state instead of being overwritten by it.
	let lastUrl = '';
	$effect(() => {
		const url = page.url;
		const href = url.pathname + url.search;
		if (href === lastUrl) return;
		lastUrl = href;
		if (href !== currentHref()) applySearchParams(url.searchParams);
		ready = true;
	});

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
		get ready() {
			return ready;
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
