import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** Root of the repository. */
const ROOT = resolve(import.meta.dirname, '..');

/**
 * Vite configuration of the Storybook. The one of the root builds the library (library mode), which does not suit an
 * app such as the Storybook, so this one only has what the components need: React, the `@/` alias and the PostCSS of
 * Mantine for the CSS Modules.
 */
export default defineConfig({
    plugins: [react()],
    resolve: { alias: { '@': ROOT } },
    css: { postcss: ROOT }
});
