import { cache } from '@emotion/css';
import createEmotionServer from '@emotion/server/create-instance';
import type { Handle } from '@sveltejs/kit/hooks';

const { extractCritical } = createEmotionServer(cache);

const emotionHandle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html, done }) => {
			if (!done) return html;
			const { css, ids } = extractCritical(html);
			if (!css) return html;
			return html.replace(
				'</head>',
				`<style data-emotion="${cache.key} ${ids.join(' ')}">${css}</style></head>`
			);
		}
	});

export const handle = emotionHandle;
