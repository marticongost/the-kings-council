import type { GoalData } from '#lib/models/cards';

// TODO: Review

export default {
	title: 'Altruïsta',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: "Si l'{stability} del teu regne és 4 o més, guanya {prestige 3}."
		}
	]
} satisfies GoalData;
