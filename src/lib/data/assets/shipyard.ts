import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Port',
	properties: ['land', 'maritime'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {gold 2}.'
		}
	]
} satisfies AssetData;
