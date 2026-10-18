import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Contactes polítics',
	properties: ['illicit', 'retinue'],
	hidden: true,
	capabilities: [
		{
			title: 'Engreixar la roda',
			type: 'secret',
			cost: { gold: 1 },
			effects: 'Guanyar {power 2}.'
		}
	]
} satisfies AssetData;
