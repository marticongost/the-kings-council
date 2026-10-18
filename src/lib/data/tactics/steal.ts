import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Robar',
	discardBonus: { intrigue: 1 },
	properties: ['machination'],
	capabilities: [
		{
			type: 'secret',
			effects:
				"Resol un {plot} {input intrigue} contra {input player}; si té èxit, el director de joc et revela dues de les seves cartes {tactic} i/o {object}, escollides aleatòriament, i pots quedar-te'n una."
		}
	]
} satisfies TacticData;
