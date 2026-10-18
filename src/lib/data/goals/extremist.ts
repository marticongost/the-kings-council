import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Extremista',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				"Si el regne té la majoria d'indicadors a nivell 1 o 5, i cap a nivell 3, guanya {prestige 4}."
		}
	]
} satisfies GoalData;
