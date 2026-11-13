import type { AssetData } from '#lib/models/cards';
import { productionPerProperty } from '../reusable-definitions';

export default {
	title: 'Universitat',
	properties: ['land', 'knowledge'],
	capabilities: [
		productionPerProperty('knowledge', 'power'),
		{
			type: 'action',
			title: 'Idees revolucionàries',
			effects: 'Canviar fins a 3 {power} per {tactics}.'
		}
	]
} satisfies AssetData;
