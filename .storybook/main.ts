import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Storybook configuration: the stories live in `stories/`, mirroring `src/`, so they stay out of the library build.
 * Every story gets an automatic documentation page (`autodocs`), built from the props types and the JSDoc.
 */
const config: StorybookConfig = {
    stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-docs'],
    framework: {
        name: '@storybook/react-vite',
        options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } }
    },
    /* Props documentation built from the TypeScript types of the components (only the library ones, not the stories). */
    typescript: {
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: { include: ['src/**/*.tsx'] }
    },
    /* The site bundles ECharts and ExcelJS (loaded on demand by the stories), which are bigger than the default warning
       limit of Vite. Apps that use the library only load them when needed. */
    viteFinal: config => ({ ...config, build: { ...config.build, chunkSizeWarningLimit: 2500 } })
};

export default config;
