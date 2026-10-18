import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Espiar',
	discardBonus: { intrigue: 1 },
	properties: ['machination'],
	capabilities: [
		{
			title: 'Segueixi aquell carro!',
			type: 'secret',
			effects:
				"Resol un {plot} contra un jugador {input text}. Si el {plot} té èxit, el director de joc t'ensenya en secret les cartes i recursos del jugador escollit."
		}
	]
} satisfies TacticData;
