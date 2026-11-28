import type { EventData } from '#lib/models/cards';

export default {
	title: 'Lideratge',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: `Si no hi ha {king}, descartar aquesta carta i robar-ne una altra. El {king} escull un {kingdom-stat}. A continuació, els jugadors seleccionen una quantitat de recursos {any} de la seva reserva i els revelen simultàniament. Si el total és igual o superior al valor de l'{kingdom-stat}, incrementar-lo en 1.`
		}
	]
} satisfies EventData;
