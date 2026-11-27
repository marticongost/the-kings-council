import type { HouseData } from '#lib/models/cards';
import { biggestHoarderHouseReward } from '../reusable-definitions';

export default {
	title: 'Casa Harkwell',
	capabilities: [
		biggestHoarderHouseReward('Guardians del coneixement', 'knowledge', ['power', 'intrigue'])
	]
} satisfies HouseData;
