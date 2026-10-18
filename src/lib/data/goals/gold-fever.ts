import type { GoalData } from '#lib/models/cards';

export default {
	title: "Febre de l'or",
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Si ets el jugador amb més {gold} a la bossa, guanya {prestige 1} per cada 3 jugadors presents a la partida (arrodonint avall).'
		}
	]
} satisfies GoalData;
