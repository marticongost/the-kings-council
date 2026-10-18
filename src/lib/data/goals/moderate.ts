import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Moderat',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				"Si el regne té la majoria d'indicadors a nivell 3, i cap a nivell 1 o 5, guanya {prestige 3}."
		}
	]
} satisfies GoalData;
