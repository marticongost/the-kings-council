import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Monestir',
	properties: ['land', 'holy', 'knowledge'],
	capabilities: [
		{
			type: 'action',
			title: 'Contemplació',
			cost: { power: 1 },
			effects: 'Guanyar {faith 2}.'
		}
	]
} satisfies AssetData;
