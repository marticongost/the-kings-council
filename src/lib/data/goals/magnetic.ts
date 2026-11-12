import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Magnètic',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('cartes amb el tret {retinue}')]
} satisfies GoalData;
