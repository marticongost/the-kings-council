import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Terratinent',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('cartes amb el tret {land}')]
} satisfies GoalData;
