import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Burdell',
	properties: ['land', 'illicit'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {gold 1} o {intrigue 1}.'
		},
		{
			title: 'Confidències',
			type: 'action',
			cost: { intrigue: 1 },
			effects: 'Guanyar una {tactic}.'
		}
	]
} satisfies AssetData;
