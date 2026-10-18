import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Ovella negra',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: "Si l'{stability} del teu regne és 2 o menys, guanya {prestige 4}."
		}
	]
} satisfies GoalData;
