import { cardBackTypes } from '#lib/cardbacks';
import { redirect } from '@sveltejs/kit';

export function load() {
	redirect(307, `/card-backs/${cardBackTypes[0]}`);
}
