import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Ovella negra',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: "Guanya {prestige 3} si l'{stability} del teu regne és 2, o {prestige 4} si és 1."
		}
	]
} satisfies GoalData;
