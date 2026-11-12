import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Reservat',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('{assets} {hidden}')]
} satisfies GoalData;
