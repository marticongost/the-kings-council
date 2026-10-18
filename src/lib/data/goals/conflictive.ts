import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Conflictiu',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si has iniciat 5+ duels durant la partida, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
