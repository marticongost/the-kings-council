import type { HouseData } from '#lib/models/cards';
import { doubleFavourHouseTrait } from '../reusable-definitions';

export default {
	title: 'Casa Valker',
	capabilities: [doubleFavourHouseTrait('Diplomàcia astuta', 'en contribuir a una {vote}')]
} satisfies HouseData;
