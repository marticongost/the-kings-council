import { getContext, setContext } from 'svelte';

/** An option of a select rendered for a player or kingdom input. */
export interface CapabilityInputChoice {
	value: string;
	label: string;
}

/**
 * Values of the `{input …}` marks of a capability. Values are keyed by the path of the input,
 * so every rendered input reads its own entry.
 */
export interface CapabilityInputValues {
	value(key: string): string;
	players: Array<CapabilityInputChoice>;
	kingdoms: Array<CapabilityInputChoice>;
}

/** State backing the `{input …}` marks of a capability while they are being edited. */
export interface CapabilityInputs extends CapabilityInputValues {
	setValue(key: string, value: string): void;
}

const capabilityInputsKey = Symbol('capability-inputs');
const capabilityValuesKey = Symbol('capability-input-values');

export function provideCapabilityInputs(inputs: CapabilityInputs): void {
	setContext(capabilityInputsKey, inputs);
}

/** The inputs of the surrounding editable capability, or `null` when there is none. */
export function useCapabilityInputs(): CapabilityInputs | null {
	return getContext<CapabilityInputs | undefined>(capabilityInputsKey) ?? null;
}

/**
 * Presents the values of the `{input …}` marks of a capability without editing them, e.g. to
 * show a card of a plan as it was filled in.
 */
export function provideCapabilityInputValues(values: CapabilityInputValues): void {
	setContext(capabilityValuesKey, values);
}

/** The values the surrounding capability was filled in with, or `null` when there are none. */
export function useCapabilityInputValues(): CapabilityInputValues | null {
	return getContext<CapabilityInputValues | undefined>(capabilityValuesKey) ?? null;
}
