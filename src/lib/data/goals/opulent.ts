import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Opulent',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('cartes amb el tret {luxury}')]
} satisfies GoalData;
