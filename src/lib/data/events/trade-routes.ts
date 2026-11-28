import type { EventData } from '#lib/models/cards';

export default {
	title: 'Rutes comercials',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: `Revelar un {asset} {object} per cada {kingdom-member}. Els jugadors escullen una quantitat de {any} en secret, i la revelen simultàniament. Cada jugador es queda una de les cartes, en ordre decreixent de la seva aposta. El {king} decideix l'ordre entre els jugadors que hagin empatat; si no hi ha rei, decidir-ho a sort.`
		}
	]
} satisfies EventData;
