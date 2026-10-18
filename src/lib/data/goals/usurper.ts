import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Usurpador',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Si durant la partida has estat coronat com a {king} del teu regne inicial, guanya {prestige 5}. No pots triar aquest objectiu si ets el {king}.'
		}
	]
} satisfies GoalData;
