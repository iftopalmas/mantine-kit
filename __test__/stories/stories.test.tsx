import { readdirSync } from 'fs';

import { describe, expect, test } from '@jest/globals';
import { cleanup, render } from '@testing-library/react';
import { composeStories, setProjectAnnotations } from '@storybook/react-vite';
import type { ComponentType } from 'react';

import * as preview from '@/.storybook/preview';

/* Renders every story with the same decorators of the Storybook (providers and locale), so a story that breaks fails
   the tests. jsdom has no canvas, so ECharts is replaced by a mock. */
jest.mock('echarts', () => ({
    init: () => ({ setOption: jest.fn(), resize: jest.fn(), dispose: jest.fn(), on: jest.fn(), off: jest.fn() }),
    registerMap: jest.fn()
}));

setProjectAnnotations(preview);

/** Locales in which every story is rendered. */
const LOCALES = ['pt-BR', 'en-US'];

/** Story files, relative to the `stories` folder. */
const STORY_FILES = readdirSync('stories', { recursive: true, encoding: 'utf8' }).filter(file =>
    file.endsWith('.stories.tsx')
);

describe('stories', () => {
    test.each(STORY_FILES)('every story of %s renders in both locales', async file => {
        const module = await import(`@/stories/${file.replace(/\.tsx$/, '')}`);
        const stories = composeStories(module) as Record<string, ComponentType<{ globals: object }>>;
        expect(Object.keys(stories).length).toBeGreaterThan(0);

        for (const Story of Object.values(stories)) {
            for (const locale of LOCALES) {
                const { container } = render(<Story globals={{ locale, colorScheme: 'light' }} />);
                expect(container).not.toBeEmptyDOMElement();
                cleanup();
            }
        }
    });
});
