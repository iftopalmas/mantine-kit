import { describe, expect, test } from '@jest/globals';

import { escapeHtml } from '@/src/util/HtmlUtil';

describe('HtmlUtil', () => {
    test('escapes the HTML special characters', () => {
        expect(escapeHtml(`<a href="x" title='y'>A & B</a>`)).toBe(
            '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;A &amp; B&lt;/a&gt;'
        );
    });

    test('keeps a text without special characters', () => {
        expect(escapeHtml('Araguaína')).toBe('Araguaína');
    });
});
