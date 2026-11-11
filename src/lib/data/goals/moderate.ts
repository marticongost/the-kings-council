import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Moderat',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Si el regne té 2 indicadors a nivell 3, guanya {prestige 1}. Si en té 3, guanya {prestige 2}. Si els té tots 4, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
