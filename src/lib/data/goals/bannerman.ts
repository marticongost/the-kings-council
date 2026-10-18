import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Fidel',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Si has estat el principal contribuïdor (o empatat al capdavant) en 3 o més batalles, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
