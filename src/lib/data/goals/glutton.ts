import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Golut',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si tens 3+ més cartes amb la propietat {food}, guanya {prestige 4}.'
		}
	]
} satisfies GoalData;
