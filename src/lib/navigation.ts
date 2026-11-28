import type { RouteId, ResolvedPathname } from '$app/types';
import { resolve } from '$app/paths';
import { cardBackTypes, cardBackTypeTitles, type CardBackType } from './cardbacks';

/** A route that can be linked from the navigation, i.e. one that takes no parameters. */
export type NavigationRouteId = Exclude<RouteId, `${string}[${string}]${string}`>;

/**
 * `resolve` is typed per route id, with different arguments for each of them, so TypeScript
 * cannot resolve a union of ids. Navigation entries only hold routes that take no parameters.
 */
const resolveRoute = resolve as unknown as (route: NavigationRouteId) => ResolvedPathname;

const resolveCardBack = (type: CardBackType): ResolvedPathname =>
	resolve('/card-backs/[type]', { type });

export interface NavigationEntryProps {
	/** The page this entry links to. Group entries leave it out. */
	id?: NavigationRouteId;
	title: string;
	/** Icon file inside the `nav` asset folder, for entries shown in the menu bar. */
	icon?: string;
	/** Resolves the URL of pages that take parameters, instead of using `id`. */
	url?: () => string;
	children?: ReadonlyArray<NavigationEntry>;
}

export class NavigationEntry {
	readonly id: NavigationRouteId | undefined;
	readonly title: string;
	readonly icon: string | undefined;
	readonly children: ReadonlyArray<NavigationEntry>;
	private readonly getUrl: (() => string) | undefined;

	constructor({ id, title, icon, url, children = [] }: NavigationEntryProps) {
		this.id = id;
		this.title = title;
		this.icon = icon;
		this.children = children;
		this.getUrl = url ?? (id ? () => resolveRoute(id) : undefined);
	}

	/** The page URL, or undefined for group entries that only group their child pages. */
	get url(): string | undefined {
		return this.getUrl?.();
	}

	/** The page URL as a root-absolute path, independent of the page being rendered. */
	get path(): string | undefined {
		const url = this.url;
		if (!url) return undefined;

		// `resolve` produces URLs relative to the current page (e.g. `./rules` or
		// `../rules`) during SSR and prerendering, while `page.url.pathname` is
		// always root-absolute. Normalise so both render modes match.
		let path = url;
		while (path.startsWith('../')) {
			path = path.slice(3);
		}
		if (path.startsWith('./')) {
			path = path.slice(1);
		} else if (!path.startsWith('/')) {
			path = `/${path}`;
		}
		return path;
	}

	matches(pathname: string): boolean {
		const path = this.path;
		if (!path) return false;
		if (pathname === path) return true;

		const prefix = path.endsWith('/') ? path : `${path}/`;
		return pathname.startsWith(prefix);
	}

	/** Whether this entry or any of its descendants matches the given pathname. */
	contains(pathname: string): boolean {
		return this.matches(pathname) || this.children.some((child) => child.contains(pathname));
	}
}

const cardBackEntries = cardBackTypes.map(
	(type) =>
		new NavigationEntry({
			title: cardBackTypeTitles[type],
			url: () => resolveCardBack(type)
		})
);

export const entries = [
	new NavigationEntry({ id: '/rules', title: 'Regles', icon: 'nav/rules.svg' }),
	new NavigationEntry({
		id: '/cards',
		title: 'Cartes',
		icon: 'nav/cards.svg',
		children: [
			new NavigationEntry({ id: '/cards', title: 'Cartes', icon: 'nav/cards.svg' }),
			new NavigationEntry({
				id: '/capabilities',
				title: 'Capacitats',
				icon: 'nav/capabilities.svg'
			}),
			new NavigationEntry({
				id: '/fate-cards',
				title: 'Cartes de destí',
				icon: 'nav/fate-cards.svg'
			})
		]
	}),
	new NavigationEntry({ id: '/simulator', title: 'Simulador', icon: 'nav/simulator.svg' }),
	new NavigationEntry({
		id: '/resources',
		title: 'Recursos',
		icon: 'nav/materials.svg',
		children: [
			new NavigationEntry({
				id: '/kingdom-sheets',
				title: 'Fitxes de regne',
				icon: 'nav/kingdom-sheets.svg'
			}),
			new NavigationEntry({
				id: '/card-backs',
				title: 'Revers cartes',
				icon: 'nav/cards.svg',
				children: cardBackEntries
			})
		]
	})
];

function findTrail(entry: NavigationEntry, pathname: string): Array<NavigationEntry> | undefined {
	// Deeper entries win, so a parent whose path prefixes a child still resolves to the child.
	for (const child of entry.children) {
		const trail = findTrail(child, pathname);
		if (trail) return [entry, ...trail];
	}
	return entry.matches(pathname) ? [entry] : undefined;
}

/** Returns the entries of the given tree from its top level down to the page matching the pathname. */
export function getTrail(
	tree: ReadonlyArray<NavigationEntry>,
	pathname: string
): ReadonlyArray<NavigationEntry> {
	for (const entry of tree) {
		const trail = findTrail(entry, pathname);
		if (trail) return trail;
	}
	return [];
}

/** Returns the entries from the top-level one down to the page matching the pathname. */
export function getCurrentTrail(pathname: string): ReadonlyArray<NavigationEntry> {
	return getTrail(entries, pathname);
}

/** Returns the navigation entry matching the given pathname, if any. */
export function getCurrentEntry(pathname: string): NavigationEntry | undefined {
	return getCurrentTrail(pathname).at(-1);
}
