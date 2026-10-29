export class CardSize {
	readonly width: number;
	readonly height: number;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	cw(percent: number) {
		return `${(this.width * percent) / 100}mm`;
	}

	dimensions(): { width: string; height: string } {
		return { width: `${this.width}mm`, height: `${this.height}mm` };
	}
}

export const standard = new CardSize(63, 88);
export const mini = new CardSize(63, 41);
