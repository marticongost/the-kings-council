import type { CSSObject } from '@emotion/css/create-instance';
import * as fonts from './fonts';
import * as palette from './palette';

const createSurface = (insetBlur: string, insetSpread: string): CSSObject => ({
	backgroundColor: palette.linen,
	border: `1px solid ${palette.gurkha}`,
	boxShadow: `inset 0 0 ${insetBlur} ${insetSpread} ${palette.gurkha}a0, 0 0 0.5em rgba(0,0,0,0.15)`
});

/** Surface used for long-form document content, such as the rules page and panels. */
export const surface: CSSObject = createSurface('2em', '0.5em');

/** Surface used for compact panels, whose smaller padding leaves less room for the inset glow. */
export const compactSurface: CSSObject = createSurface('1em', '0.25em');

/** Typography of top-level headings in long-form documents. */
export const titleTypography: CSSObject = {
	fontFamily: fonts.heading,
	fontWeight: 'bold',
	fontSize: '2em',
	lineHeight: '1.1em',
	color: palette.red
};

/** Decorative underline that runs under the full width of a heading. */
export const titleRule = (borderWidth: string): CSSObject => ({
	paddingBottom: '0.25em',
	borderImage: `url('/svg/decorations/separator.svg') 0 0 100% 0 / 0 0 ${borderWidth} 0 repeat`
});

/** Appearance of top-level headings in long-form documents. */
export const title: CSSObject = {
	...titleTypography,
	...titleRule('0.1em')
};
