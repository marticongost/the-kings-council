import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Mandrós',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'afterResolvingCrisis',
			effects: 'Si no has contribuit a la crisi, afegeix una marca {input tally 4}.'
		},
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanya {prestige 1} per cada marca que hagis col·locat.'
		}
	]
} satisfies GoalData;
