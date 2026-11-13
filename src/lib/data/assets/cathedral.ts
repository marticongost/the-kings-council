import type { AssetData } from '#lib/models/cards';
import { productionPerProperty } from '../reusable-definitions';

export default {
	title: 'Catedral',
	properties: ['land', 'holy'],
	capabilities: [
		productionPerProperty('holy', 'faith'),
		{
			type: 'action',
			title: 'Delme',
			effects: 'Canviar fins a 3 {faith} per {gold}.'
		}
	]
} satisfies AssetData;
