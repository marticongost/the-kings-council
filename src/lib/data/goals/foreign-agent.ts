import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Agent estranger',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameStart',
			effects: 'Escull un {input kingdom} que no sigui el teu.'
		},
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Per cada {kingdom-stat} del {kingdom} escollit que estigui per sobre els de la resta de regnes guanya {prestige 1}. Guanya {prestige 2} addicionals si el {kingdom} escollit és el millor en tots els {kingdom-stats}.'
		}
	]
} satisfies GoalData;
