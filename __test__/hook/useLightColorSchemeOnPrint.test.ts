import { describe, expect, test } from '@jest/globals';
import { renderHook } from '@testing-library/react';

import { useLightColorSchemeOnPrint } from '@/src/hook/useLightColorSchemeOnPrint';

const ATTRIBUTE = 'data-mantine-color-scheme';

describe('useLightColorSchemeOnPrint', () => {
    test('uses the light color scheme only while the print dialog is open', () => {
        document.documentElement.setAttribute(ATTRIBUTE, 'dark');
        const { unmount } = renderHook(() => useLightColorSchemeOnPrint());

        window.dispatchEvent(new Event('beforeprint'));
        expect(document.documentElement.getAttribute(ATTRIBUTE)).toBe('light');

        window.dispatchEvent(new Event('afterprint'));
        expect(document.documentElement.getAttribute(ATTRIBUTE)).toBe('dark');

        unmount();
        window.dispatchEvent(new Event('beforeprint'));
        expect(document.documentElement.getAttribute(ATTRIBUTE)).toBe('dark');
    });

    test('removes the color scheme attribute after printing, if it did not exist before', () => {
        document.documentElement.removeAttribute(ATTRIBUTE);
        const { unmount } = renderHook(() => useLightColorSchemeOnPrint());

        window.dispatchEvent(new Event('beforeprint'));
        window.dispatchEvent(new Event('afterprint'));
        expect(document.documentElement.hasAttribute(ATTRIBUTE)).toBe(false);
        unmount();
    });
});
