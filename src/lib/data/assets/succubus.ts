import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Súcube',
	properties: ['retinue', 'magic'],
	hidden: true,
	capabilities: [
		{
			title: 'Satisfer',
			type: 'secret',
			cost: { any: 1 },
			effects: 'Fes una marca a la casella "Satisfet".'
		},
		{
			type: 'reaction',
			trigger: 'turnEnd',
			effects: `Satisfet: {input check}. Si la casella està marcada, esborra-la. Si no, {discard} aquest actiu.`
		},
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanyar {prestige 2}.'
		}
	]
} satisfies AssetData;
