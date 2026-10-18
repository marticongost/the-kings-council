import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Poble',
	properties: ['land'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {power 1}, {gold 1}, {intrigue 1} o {strength 1}.'
		}
	]
} satisfies AssetData;
