import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Independent',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si acabes la partida no formant part de cap reialme, guanya {prestige 4}.'
		}
	]
} satisfies GoalData;
