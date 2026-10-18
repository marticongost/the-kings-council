import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de supervisió reial',
	capabilities: [
		{
			title: 'Supervisió',
			type: 'constant',
			effects: 'Si està en vigor, els vots del {king} compten el doble.'
		}
	]
} satisfies LawData;
