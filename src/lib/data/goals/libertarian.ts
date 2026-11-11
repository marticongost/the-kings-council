import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Llibertari',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Si el teu regne té 2 lleis en vigor, guanya {prestige 1}. Si en té 1, guanya {prestige 2}. Si no en té cap, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
