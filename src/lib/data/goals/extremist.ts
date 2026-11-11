import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Extremista',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Guanya {prestige} 3/4/5/6 segons el regne tingui 1/2/3/4 {kingdom-stats} amb valor 1 o 5.'
		}
	]
} satisfies GoalData;
