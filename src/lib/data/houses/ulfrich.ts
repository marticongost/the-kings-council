import type { HouseData } from '#lib/models/cards';
import { doubleFavourHouseTrait } from '../reusable-definitions';

export default {
	title: 'Casa Ulfrich',
	capabilities: [doubleFavourHouseTrait('Al peu del canó', 'en un {duel}')]
} satisfies HouseData;
