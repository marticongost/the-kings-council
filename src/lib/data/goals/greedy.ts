import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Avariciós',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('{gold}')]
} satisfies GoalData;
