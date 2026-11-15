/** A range of turns that share the same danger value. */
export interface DangerLevel {
	/** First turn of the range, inclusive. */
	firstTurn: number;
	/** Last turn of the range, inclusive. */
	lastTurn: number;
	/** The danger value of every turn in the range. */
	danger: number;
}

/** Danger by turn range, as described in the rules. */
export const dangerLevels: readonly DangerLevel[] = [
	{ firstTurn: 1, lastTurn: 2, danger: 0.5 },
	{ firstTurn: 3, lastTurn: 4, danger: 1 },
	{ firstTurn: 5, lastTurn: 6, danger: 1.5 },
	{ firstTurn: 7, lastTurn: 8, danger: 2 }
];

/** First turn of a game. */
export const minTurn = dangerLevels[0].firstTurn;

/** Last turn of a game, which is also the last turn of the last danger level. */
export const maxTurn = dangerLevels[dangerLevels.length - 1].lastTurn;

/** The danger value of a turn, following the turn table in the rules. */
export function dangerForTurn(turn: number): number {
	const level = dangerLevels.find(({ lastTurn }) => turn <= lastTurn);
	return (level ?? dangerLevels[dangerLevels.length - 1]).danger;
}

/** The turns of a danger level as shown in the danger table, e.g. `1-2`. */
export function dangerTurnRange({ firstTurn, lastTurn }: DangerLevel): string {
	return firstTurn === lastTurn ? `${firstTurn}` : `${firstTurn}-${lastTurn}`;
}
