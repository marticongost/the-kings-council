import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Artista',
	properties: ['retinue', 'luxury'],
	capabilities: [
		{
			title: 'Inspiració',
			type: 'action',
			cost: { faith: 3 },
			effects: 'Guanyar {prestige 1}.'
		}
	]
} satisfies AssetData;
