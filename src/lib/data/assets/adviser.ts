import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Ma dreta',
	properties: ['retinue'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar 1 carta.'
		}
	]
} satisfies AssetData;
