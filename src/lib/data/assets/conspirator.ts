import type { AssetData } from '#lib/models/cards';
import { productionPerProperty } from '../reusable-definitions';

export default {
	title: 'Conspirador',
	properties: ['retinue', 'illicit'],
	hidden: true,
	capabilities: [
		productionPerProperty('illicit', 'intrigue'),
		{
			type: 'action',
			title: 'Xarxa criminal',
			effects: 'Canviar fins a 3 {intrigue} per {power}.'
		}
	]
} satisfies AssetData;
