import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Llengua de plata',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'afterVoting',
			effects: 'Si la teva opció ha estat la guanyadora, afegeix una marca {input tally 5}.'
		},
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanya {prestige 1} per cada marca que hagis col·locat.'
		}
	]
} satisfies GoalData;
