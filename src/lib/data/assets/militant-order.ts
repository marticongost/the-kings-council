import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Ordre militant',
	properties: ['holy', 'military'],
	capabilities: [
		{
			title: 'Deus vult!',
			type: 'action',
			cost: { faith: 1 },
			effects: 'Guanya {strength 2}.'
		}
	]
} satisfies AssetData;
