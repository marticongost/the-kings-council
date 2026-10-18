import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Llengua de plata',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				"Si durant la partida s'han aprovat 3 o més lleis que tu has proposat, guanya {prestige 3}."
		}
	]
} satisfies GoalData;
