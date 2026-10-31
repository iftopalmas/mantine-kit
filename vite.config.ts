import { globSync } from 'node:fs';
import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import MagicString from 'magic-string';
import { defineConfig, Plugin } from 'vite';

import packageJson from './package.json' with { type: 'json' };

/** Folder of the sources, whose structure is repeated in `dist/` (one `.js` per file, for the deep imports). */
const SRC_DIR = 'src';

/** TypeScript files of the library, each one an entry of the build (the `.d.ts` declarations are left out). */
const entries = globSync(`${SRC_DIR}/**/*.{ts,tsx}`, { exclude: name => name.endsWith('.d.ts') });

/** Dependencies the app installs (peerDependencies): they stay out of the bundle, including subpaths (e.g. `echarts/core`). */
const peers = Object.keys(packageJson.peerDependencies);
const isExternal = (id: string): boolean =>
    id.startsWith('react/') || peers.some(peer => id === peer || id.startsWith(`${peer}/`));

/** Directive that marks a module as a Client Component in the Next.js App Router. */
const USE_CLIENT = "'use client';";

/**
 * Marks all generated modules as Client Components, as Mantine does: without it, a Server Component of the app could not
 * import a component of the library that uses hooks. The modules that already have the directive in the source are kept
 * as they are, since Vite preserves it.
 */
function useClientDirective(): Plugin {
    return {
        name: 'use-client-directive',
        renderChunk(code) {
            if (/^\s*["']use client["']/.test(code)) return null;

            const output = new MagicString(code).prepend(`${USE_CLIENT}\n`);
            return { code: output.toString(), map: output.generateMap({ hires: true }) };
        }
    };
}

/**
 * Build of the library: ESM only, a module per file of `src/` (`preserveModules`) and all the CSS (CSS Modules compiled
 * with the Mantine PostCSS preset) in `dist/styles.css`. The `.d.ts` are generated afterwards by `tsc`
 * (`tsconfig.build.json`). The `print.css` is copied separately, since the app imports it, not the components.
 */
export default defineConfig({
    plugins: [react(), useClientDirective()],
    css: { modules: { generateScopedName: 'mk-[name]-[local]-[hash:base64:5]' } },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        cssCodeSplit: false,
        sourcemap: true,
        minify: false,
        lib: {
            entry: Object.fromEntries(
                entries.map(file => [file.slice(SRC_DIR.length + 1).replace(/\.tsx?$/, ''), resolve(file)])
            ),
            formats: ['es'],
            cssFileName: 'styles'
        },
        rollupOptions: {
            external: isExternal,
            output: {
                preserveModules: true,
                preserveModulesRoot: SRC_DIR,
                entryFileNames: '[name].js'
            }
        },
        copyPublicDir: false
    }
});
