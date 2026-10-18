import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Ciutat',
	properties: ['land'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {power 2}, {gold 2}, {intrigue 2} o {strength 2}.'
		}
	]
} satisfies AssetData;
