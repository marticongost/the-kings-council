import type { RouteId, ResolvedPathname } from '$app/types';
import { resolve } from '$app/paths';

/** A route that can be linked from the navigation, i.e. one that takes no parameters. */
export type NavigationRouteId = Exclude<RouteId, `${string}[${string}]${string}`>;

/**
 * `resolve` is typed per route id, with different arguments for each of them, so TypeScript
 * cannot resolve a union of ids. Navigation entries only hold routes that take no parameters.
 */
const resolveRoute = resolve as unknown as (route: NavigationRouteId) => ResolvedPathname;

export interface NavigationEntryProps {
	id: NavigationRouteId;
	title: string;
}

export class NavigationEntry {
	readonly id: NavigationRouteId;
	readonly title: string;

	constructor({ id, title }: NavigationEntryProps) {
		this.id = id;
		this.title = title;
	}

	get url(): ResolvedPathname {
		return resolveRoute(this.id);
	}

	matches(path: string): boolean {
		let url = this.url;
		if (path === url) {
			return true;
		}

		if (!url.endsWith('/')) {
			url += '/';
		}
		return path.startsWith(url);
	}
}

export const entries = [
	new NavigationEntry({ id: '/rules', title: 'Regles' }),
	new NavigationEntry({ id: '/cards', title: 'Cartes' }),
	new NavigationEntry({ id: '/capabilities', title: 'Targetes' }),
	new NavigationEntry({ id: '/fate-cards', title: 'Cartes de destí' }),
	new NavigationEntry({ id: '/simulator', title: 'Simulador' })
];
