import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { KitProvider } from '@/src/provider/KitProvider';
import { useDocumentTitle, useKitConfig, useKitMessages, useKitRouter } from '@/src/provider/useKit';
import { anchorRouter } from '@/src/router/anchorRouter';
import { PORTUGUESE_FORM_ROUTE_SEGMENTS } from '@/src/router/FormRouteSegments';

/** Shows the tab title built for the "Regions" page, whether the router is the default one and the "back" text. */
function Probe(): React.ReactElement {
    const title = useDocumentTitle('Regions');
    const router = useKitRouter();
    const { back } = useKitMessages().common;
    const { formRouteSegments } = useKitConfig();

    return (
        <p>
            {title} | {router === anchorRouter ? 'anchor' : 'app'} | {back} | {formRouteSegments.create}
        </p>
    );
}

describe('KitProvider', () => {
    test('outside the provider, uses the defaults: anchor router, title without app name, en-US texts', () => {
        render(<Probe />);

        expect(screen.getByText('Regions | anchor | Back | create')).toBeInTheDocument();
    });

    test('adds the app name to the title and keeps the default router when the app gives none', () => {
        render(
            <KitProvider appName="My System">
                <Probe />
            </KitProvider>
        );

        expect(screen.getByText('Regions - My System | anchor | Back | create')).toBeInTheDocument();
    });

    test('uses the router, the locale, the texts and the route segments given by the app', () => {
        render(
            <KitProvider
                router={{ ...anchorRouter }}
                locale="pt-BR"
                messages={{ common: { back: 'Retornar' } }}
                formRouteSegments={PORTUGUESE_FORM_ROUTE_SEGMENTS}
            >
                <Probe />
            </KitProvider>
        );

        expect(screen.getByText('Regions | app | Retornar | criar')).toBeInTheDocument();
    });
});
