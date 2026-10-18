import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Reservat',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Si acabes la partida controlant 3 o més cartes {asset} {hidden}, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
