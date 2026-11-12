import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Conflictiu',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenInstigatingDuel',
			effects: 'Afegeix una marca {input tally 5}.'
		},
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanya {prestige 1} per cada marca que hagis col·locat.'
		}
	]
} satisfies GoalData;
