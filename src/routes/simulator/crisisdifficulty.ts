import type { Crisis } from '#lib/models/cards';
import { kingdomStatTypes, type KingdomStatType } from '#lib/models/kingdomstats';
import type { KingdomStats } from './types';

/** The kingdom-dependent values a crisis difficulty expression can reference. */
export interface CrisisDifficultyContext {
	/** Number of players in the kingdom, the `{kingdom-members}` variable. */
	members: number;
	/** Current game danger, the `{danger}` variable. */
	danger: number;
	/** Kingdom stats, referenced by name such as `{wealth}`. */
	stats: KingdomStats;
}

type Operator = '+' | '-' | '*' | '/';

type Token =
	| { type: 'number'; value: number }
	| { type: 'variable'; name: string }
	| { type: 'operator'; value: Operator }
	| { type: 'open' }
	| { type: 'close' };

const arithmeticOperators: Record<string, Operator> = {
	'+': '+',
	'-': '-',
	'−': '-',
	'*': '*',
	'×': '*',
	'/': '/',
	'÷': '/'
};

const kingdomStatNames = new Set<string>(kingdomStatTypes);

/** Expressions naming the number of players in the kingdom. */
const kingdomPlayerNames = new Set(['kingdom-members', 'kingdom-players', 'players']);

function tokenize(expression: string): Array<Token> | null {
	const tokens: Array<Token> = [];
	let index = 0;

	while (index < expression.length) {
		const character = expression[index];

		if (/\s/.test(character)) {
			index += 1;
			continue;
		}

		if (character === '(' || character === ')') {
			tokens.push({ type: character === '(' ? 'open' : 'close' });
			index += 1;
			continue;
		}

		const operator = arithmeticOperators[character];
		if (operator) {
			tokens.push({ type: 'operator', value: operator });
			index += 1;
			continue;
		}

		if (character === '{') {
			const close = expression.indexOf('}', index + 1);
			if (close === -1) return null;

			const name = expression.slice(index + 1, close).trim();
			if (!name) return null;

			tokens.push({ type: 'variable', name });
			index = close + 1;
			continue;
		}

		if (/\d/.test(character)) {
			const start = index;
			while (index < expression.length && /[\d.]/.test(expression[index])) index += 1;

			const value = Number(expression.slice(start, index));
			if (!Number.isFinite(value)) return null;

			tokens.push({ type: 'number', value });
			continue;
		}

		return null;
	}

	return tokens;
}

function resolveVariable(name: string, context: CrisisDifficultyContext): number | null {
	if (kingdomPlayerNames.has(name)) return context.members;
	if (name === 'danger') return context.danger;
	if (kingdomStatNames.has(name)) return context.stats[name as KingdomStatType];
	return null;
}

/**
 * Evaluates a crisis difficulty expression such as `{kingdom-members} × ({danger} + 1)`,
 * returning `null` when the expression is malformed or references an unknown value.
 */
export function evaluateCrisisDifficulty(
	crisis: Crisis,
	context: CrisisDifficultyContext
): number | null {
	const tokens = tokenize(crisis.difficulty);
	if (!tokens?.length) return null;

	let index = 0;

	const peek = () => tokens[index];

	function parseExpression(): number | null {
		let value = parseTerm();
		if (value === null) return null;

		while (true) {
			const token = peek();
			if (token?.type !== 'operator' || (token.value !== '+' && token.value !== '-')) break;

			index += 1;
			const right = parseTerm();
			if (right === null) return null;

			value = token.value === '+' ? value + right : value - right;
		}

		return value;
	}

	function parseTerm(): number | null {
		let value = parseFactor();
		if (value === null) return null;

		while (true) {
			const token = peek();
			if (token?.type !== 'operator' || (token.value !== '*' && token.value !== '/')) break;

			index += 1;
			const right = parseFactor();
			if (right === null || (token.value === '/' && right === 0)) return null;

			value = token.value === '*' ? value * right : value / right;
		}

		return value;
	}

	function parseFactor(): number | null {
		const token = peek();
		if (!token) return null;

		index += 1;

		switch (token.type) {
			case 'number':
				return token.value;
			case 'variable': {
				const value = resolveVariable(token.name, context);
				return value !== null && Number.isFinite(value) ? value : null;
			}
			case 'open': {
				const value = parseExpression();
				if (value === null || peek()?.type !== 'close') return null;
				index += 1;
				return value;
			}
			case 'operator': {
				if (token.value !== '+' && token.value !== '-') return null;
				const value = parseFactor();
				if (value === null) return null;
				return token.value === '-' ? -value : value;
			}
			default:
				return null;
		}
	}

	const result = parseExpression();
	if (result === null || index !== tokens.length || !Number.isFinite(result)) return null;

	// A threshold below zero is equivalent to zero, since a crisis only requires contributions.
	return Math.max(0, Math.round(result));
}
