import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Piadós',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('{faith}')]
} satisfies GoalData;
