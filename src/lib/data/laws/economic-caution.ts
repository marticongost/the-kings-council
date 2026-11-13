import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de prudència econòmica',
	capabilities: [
		{
			type: 'constant',
			title: 'Prudència econòmica',
			effects:
				"Si està en vigor els jugadors queden limitats a una sola compra durant la {assets-bid}. Poden seguir fent dues apostes, però només una d'elles podrà tenir èxit: si ja han adquirit un actiu a la primera aposta, la segona aposta serà ignorada."
		}
	]
} satisfies LawData;
