import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Monopolista',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Guanya tant {prestige} com la diferència entre el teu {gold} i la {wealth} del teu regne (màxim 4).'
		}
	]
} satisfies GoalData;
