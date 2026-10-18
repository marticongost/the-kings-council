import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Catedral',
	properties: ['land', 'holy'],
	capabilities: [
		{
			type: 'action',
			title: 'Centre de culte',
			effects: 'Guanyar {faith 2} i {gold 1}.'
		}
	]
} satisfies AssetData;
