import type { HouseData } from '#lib/models/cards';
import { doubleFavourHouseTrait } from '../reusable-definitions';

export default {
	title: 'Casa Norwind',
	capabilities: [doubleFavourHouseTrait("Nissaga d'herois", 'com a contribució a la crisi')]
} satisfies HouseData;
