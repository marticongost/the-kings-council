import { cardBackTypes, isCardBackType, type CardBackType } from '#lib/cardbacks';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => cardBackTypes.map((type) => ({ type }));

export const load: PageLoad<{ type: CardBackType }> = ({ params }) => {
	if (!isCardBackType(params.type)) {
		error(404, `Unknown card back type: ${params.type}`);
	}
	return { type: params.type };
};
