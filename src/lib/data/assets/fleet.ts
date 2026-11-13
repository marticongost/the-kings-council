import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Flota',
	properties: ['military', 'maritime'],
	hidden: false,
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanya {strength 1} i {gold 1}.'
		}
	]
} satisfies AssetData;
