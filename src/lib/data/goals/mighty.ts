import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Poderós',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('{strength}')]
} satisfies GoalData;
