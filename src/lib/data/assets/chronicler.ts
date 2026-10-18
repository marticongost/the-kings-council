import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Cronista',
	properties: ['retinue'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'afterWinningDuel',
			restrictions: 'Màxim un cop per torn.',
			effects: 'Guanyar {prestige 1}.'
		}
	]
} satisfies AssetData;
