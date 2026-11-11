import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Extremista',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Guanya {prestige 1} per cada indicador amb un valor 1 o 5. Si no hi ha cap indicador amb valor 3, guanya {prestige 1} addicional.'
		}
	]
} satisfies GoalData;
