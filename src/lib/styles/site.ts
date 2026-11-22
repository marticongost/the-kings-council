import type { CSSObject } from '@emotion/css/create-instance';
import { hpadding } from './box';
import * as palette from './palette';
import { spacing } from './spacing';
import * as viewport from './viewport';

export const headerBackgroundColor = palette.cedar;
export const pageBackgroundColor = palette.moonMist;
export const screenBleed = spacing.lg;
export const smallScreenBleed = spacing.sm;

/** Maximum width of the document content at each viewport size. */
const documentWidths: Record<viewport.ViewportSizeId, string> = {
	xs: '100%',
	sm: '540px',
	md: '720px',
	lg: '960px',
	xl: '1140px'
};

/** Width of the document, limited and centred for the active viewport. */
export const documentWidth: CSSObject = {
	width: '100%',
	maxWidth: documentWidths.xs,
	margin: '0 auto',
	...viewport.sm.exactly().then({ maxWidth: documentWidths.sm }),
	...viewport.md.exactly().then({ maxWidth: documentWidths.md }),
	...viewport.lg.exactly().then({ maxWidth: documentWidths.lg }),
	...viewport.xl.exactly().then({ maxWidth: documentWidths.xl })
};

/** Width of a document that fills the whole viewport, kept off the edges by a small bleed. */
export const fluidWidth: CSSObject = {
	width: '100%',
	...hpadding(smallScreenBleed),
	...viewport.sm.orLarger().then({
		...hpadding(screenBleed)
	})
};
