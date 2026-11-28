import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Joies',
	properties: ['object', 'luxury'],
	hidden: false,
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanyar {prestige 1}.'
		},
		{
			title: 'Empenyorar',
			type: 'action',
			effects: 'Guanyar {gold 3}. {discard} aquest actiu.'
		}
	]
} satisfies AssetData;
