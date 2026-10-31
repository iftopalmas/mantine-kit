import { useEffect } from 'react';

/** Attribute where Mantine stores the color scheme of the page (`light` or `dark`). */
const COLOR_SCHEME_ATTRIBUTE = 'data-mantine-color-scheme';

/**
 * Always prints the page with the light color scheme, even if the user uses the dark one: on paper (or in a PDF),
 * light text on a dark background wastes ink and is hard to read. The scheme changes only while the print dialog is
 * open (`beforeprint`/`afterprint`), without changing the preference saved by the user.
 *
 * It changes only what comes from the Mantine CSS variables. A component that chooses the color in JavaScript from the
 * color scheme (e.g. with `useMantineColorScheme`) is not redrawn and keeps the dark colors.
 */
export function useLightColorSchemeOnPrint(): void {
    useEffect(() => {
        const html = document.documentElement;
        let savedScheme: string | null = null;

        const beforePrint = (): void => {
            savedScheme = html.getAttribute(COLOR_SCHEME_ATTRIBUTE);
            html.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'light');
        };
        // Without a scheme before printing, removes the attribute, instead of leaving the light scheme set.
        const afterPrint = (): void => {
            if (savedScheme) html.setAttribute(COLOR_SCHEME_ATTRIBUTE, savedScheme);
            else html.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
        };

        window.addEventListener('beforeprint', beforePrint);
        window.addEventListener('afterprint', afterPrint);
        return (): void => {
            window.removeEventListener('beforeprint', beforePrint);
            window.removeEventListener('afterprint', afterPrint);
        };
    }, []);
}
