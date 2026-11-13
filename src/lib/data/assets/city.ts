import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Ciutat',
	properties: ['land'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {any 2}.'
		}
	]
} satisfies AssetData;
