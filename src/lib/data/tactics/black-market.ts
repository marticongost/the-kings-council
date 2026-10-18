import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Mercat negre',
	discardBonus: { power: 1 },
	properties: ['machination'],
	capabilities: [
		{
			title: 'Tot té un preu',
			type: 'secret',
			cost: { gold: 2 },
			effects:
				"Resol un {plot} {input intrigue} contra el teu regne. Si té èxit, el director de joc t'ensenya dos {assets} {hidden} aleatoris. Pots quedar-te'n un. Descartar la resta."
		}
	]
} satisfies TacticData;
