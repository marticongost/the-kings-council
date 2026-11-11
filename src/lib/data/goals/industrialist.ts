import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Industrialista',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanya {prestige 3} si la {wealth} del teu regne és 4, o {prestige 4} si és 5.'
		}
	]
} satisfies GoalData;
