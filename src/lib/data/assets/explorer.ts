import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Explorador',
	properties: ['retinue', 'maritime'],
	hidden: false,
	capabilities: [
		{
			title: 'Hic sunt dracones',
			type: 'action',
			cost: { power: 1, gold: 1 },
			effects:
				"Roba de la pila d'{assets} {visible} fins que trobis una carta amb la propietat {land}; afegeix-la al teu domini."
		}
	]
} satisfies AssetData;
