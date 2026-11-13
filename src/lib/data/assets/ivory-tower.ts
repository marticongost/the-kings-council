import type { AssetData } from '#lib/models/cards';
import { productionPerProperty } from '../reusable-definitions';

export default {
	title: "Torre d'ivori",
	properties: ['land', 'magic'],
	hidden: true,
	capabilities: [
		productionPerProperty('magic', 'favour'),
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {power 1}.'
		}
	]
} satisfies AssetData;
