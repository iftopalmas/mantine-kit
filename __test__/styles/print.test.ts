import { readFileSync } from 'fs';

import { describe, expect, test } from '@jest/globals';

/** Print CSS, read as text: CSS cannot use the constants of the code. */
const PRINT_CSS = readFileSync('src/styles/print.css', 'utf8');

/* CSS cannot use the constants of the code, so this test keeps the attributes used by the print components in sync. */
describe('print.css', () => {
    test('both named pages (portrait and landscape) number the pages, since one does not inherit from the other', () => {
        expect(PRINT_CSS.match(/@bottom-right/g)).toHaveLength(2);
    });

    test('only the reports define the paper: there is no unnamed @page', () => {
        expect(PRINT_CSS).not.toMatch(/@page\s*\{/);
    });

    test.each([
        'data-print-hidden',
        'data-print-block',
        'data-print-new-page',
        'data-print-keep-with-next',
        "data-print-orientation='portrait'",
        "data-print-orientation='landscape'"
    ])('has the rule of the %s attribute, used by the print components', attribute => {
        expect(PRINT_CSS).toContain(`[${attribute}]`);
    });
});
