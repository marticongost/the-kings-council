import type { AssetData } from '#lib/models/cards';

export default {
	title: "Xarxa d'informants",
	properties: ['retinue'],
	hidden: true,
	capabilities: [
		{
			title: 'Obtenir informació',
			type: 'secret',
			cost: { gold: 1 },
			effects: 'Guanyar {intrigue 2}.'
		}
	]
} satisfies AssetData;
