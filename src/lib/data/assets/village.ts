import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Poble',
	properties: ['land'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {any 1}.'
		}
	]
} satisfies AssetData;
