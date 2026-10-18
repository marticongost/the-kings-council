import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Bola de cristall',
	properties: ['magic', 'object'],
	hidden: true,
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnEnd',
			effects: 'Guanyar {intrigue 1}'
		},
		{
			title: 'Visions del futur',
			type: 'secret',
			cost: { intrigue: 1 },
			effects: "El director de joc t'ensenya en secret les següents 3 cartes de destí."
		}
	]
} satisfies AssetData;
