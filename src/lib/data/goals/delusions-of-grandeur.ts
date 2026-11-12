import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Deliris de grandesa',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('{tactics}')]
} satisfies GoalData;
