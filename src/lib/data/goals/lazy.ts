import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Mandrós',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Si tens menys emblemes que tots els altres membres del teu regne, guanya {prestige 2}.'
		}
	]
} satisfies GoalData;
