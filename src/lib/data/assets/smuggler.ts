import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Contrabandista',
	properties: ['retinue', 'maritime', 'illicit'],
	hidden: true,
	capabilities: [
		{
			title: 'Mercaderia il·lícita',
			type: 'secret',
			effects:
				"Resol un {plot} {input intrigue} contra el teu regne. Si té èxit, roba 3 cartes de les piles d'{assets} {visible} i {hidden} (un total de 6 cartes). Pots quedar-te una de les cartes {object} robades; descarta la resta."
		}
	]
} satisfies AssetData;
