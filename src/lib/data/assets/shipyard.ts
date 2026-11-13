import type { AssetData } from '#lib/models/cards';
import { productionPerProperty } from '../reusable-definitions';

export default {
	title: 'Port',
	properties: ['land', 'maritime'],
	capabilities: [
		productionPerProperty('maritime', 'gold'),
		{
			type: 'action',
			title: 'Interessos mercantils',
			effects: 'Canviar fins a 3 {gold} per {power}.'
		}
	]
} satisfies AssetData;
