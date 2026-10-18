import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Terratinent',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si tens 3 o més cartes de terreny, guanya {prestige 2}.'
		}
	]
} satisfies GoalData;
