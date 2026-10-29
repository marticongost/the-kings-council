import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Monopolista',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Guanya {prestige 3} si tens més {gold} que la {wealth} del teu regne, o {prestige 4} si en tens el doble o més.'
		}
	]
} satisfies GoalData;
