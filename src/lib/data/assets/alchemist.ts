import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Alquimista',
	properties: ['magic', 'retinue', 'knowledge'],
	hidden: true,
	capabilities: [
		{
			title: 'Pedra filosofal',
			type: 'secret',
			effects: '{discard} un {asset}. Guanyar {gold 3}.'
		},
		{
			title: 'Transmutació',
			type: 'secret',
			cost: { gold: 2 },
			effects: '{discard} un {asset}. Robar un {asset} aleatori.'
		}
	]
} satisfies AssetData;
