import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Catedral',
	properties: ['land', 'holy'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {faith 1} per cada {asset} {visible} amb la propietat {holy}.'
		},
		{
			type: 'action',
			title: 'Delme',
			effects: 'Canviar fins a 3 {faith} per {gold}.'
		}
	]
} satisfies AssetData;
