import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Doblar els esforços',
	discardBonus: { power: 1 },
	capabilities: [
		{
			type: 'action',
			cost: { power: 1 },
			effects:
				"Escull una {action} d'una {tactic} de la teva ma. Paga el seu cost, i executa els seus efectes dues vegades. Descarta la carta."
		}
	]
} satisfies TacticData;
