import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Magnètic',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Si acabes la partida controlant 3 o més cartes amb el tret {retinue}, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
