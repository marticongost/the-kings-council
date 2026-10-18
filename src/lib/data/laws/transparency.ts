import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de transparència',
	capabilities: [
		{
			title: 'Transparència',
			type: 'constant',
			effects:
				'Mentre estigui en vigor, tots els membres del regne han de jugar amb els recursos visibles.'
		}
	]
} satisfies LawData;
