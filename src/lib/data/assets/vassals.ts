import type { AssetData } from '#lib/models/cards';
import { productionPerProperty } from '../reusable-definitions';

export default {
	title: 'Vasalls',
	properties: ['military'],
	capabilities: [
		productionPerProperty('military', 'strength'),
		{
			type: 'action',
			title: 'Senyor feudal',
			effects: 'Canviar fins a 3 {strength} per {power}.'
		}
	]
} satisfies AssetData;
