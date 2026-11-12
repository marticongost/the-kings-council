import type { HouseData } from '#lib/models/cards';
import { biggestHoarderHouseReward } from '../reusable-definitions';

export default {
	title: 'Casa Harkwell',
	capabilities: [
		biggestHoarderHouseReward('Guardians del coneixement', 'magic', ['power', 'intrigue'])
	]
} satisfies HouseData;
