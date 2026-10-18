import type { RouteId, ResolvedPathname } from '$app/types';
import { resolve } from '$app/paths';

export interface NavigationEntryProps {
	id: RouteId;
	title: string;
}

export class NavigationEntry {
	readonly id: RouteId;
	readonly title: string;

	constructor({ id, title }: NavigationEntryProps) {
		this.id = id;
		this.title = title;
	}

	get url(): ResolvedPathname {
		return resolve(this.id);
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
	new NavigationEntry({ id: '/cards', title: 'Cartes' }),
	new NavigationEntry({ id: '/capabilities', title: 'Targetes' }),
	new NavigationEntry({ id: '/rules', title: 'Regles' })
];
