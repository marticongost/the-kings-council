import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Ambiciós',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('{power}')]
} satisfies GoalData;
