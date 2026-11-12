import type { HouseData } from '#lib/models/cards';
import { biggestHoarderHouseReward } from '../reusable-definitions';

export default {
	title: 'Casa Morian',
	capabilities: [biggestHoarderHouseReward('Instruments del Senyor', 'holy', ['faith', 'intrigue'])]
} satisfies HouseData;
