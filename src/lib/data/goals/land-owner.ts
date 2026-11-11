import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Terratinent',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si tens 3 o més cartes de terreny, guanya {prestige 2}.'
		}
	]
} satisfies GoalData;
