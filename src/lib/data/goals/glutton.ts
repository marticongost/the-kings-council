import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Golut',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('cartes amb el tret {food}')]
} satisfies GoalData;
