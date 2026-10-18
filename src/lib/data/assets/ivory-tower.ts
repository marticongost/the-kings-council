import type { AssetData } from '#lib/models/cards';

export default {
	title: "Torre d'ivori",
	properties: ['land', 'magic', 'luxury'],
	hidden: true,
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si tens 4+ cartes amb el tret {magic}, guanya {prestige 1}.'
		},
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {power 1}.'
		}
	]
} satisfies AssetData;
