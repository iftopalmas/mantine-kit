import { render as testingLibraryRender, RenderResult } from '@testing-library/react';
import { createTheme, MantineProvider, Popover, Tooltip } from '@mantine/core';

import { KitProvider } from '../src/provider/KitProvider';
import { RouterAdapter } from '../src/router/RouterAdapter';
import { createTestRouter } from './testRouter';

/**
 * Theme of the tests. jsdom computes no layout (every element has size zero), so Mantine (8+) would think the target of
 * popovers and tooltips left the screen and would hide the dropdown (`hideDetached`). So the option is turned off.
 */
const testTheme = createTheme({
    components: {
        Popover: Popover.extend({ defaultProps: { hideDetached: false } }),
        Tooltip: Tooltip.extend({ defaultProps: { hideDetached: false } })
    }
});

/** Options of {@link render}. */
export type RenderOptions = {
    /** Simulated router; if absent, one that stays on the `/` page and does not navigate (see {@link createTestRouter}). */
    router?: RouterAdapter;
};

/**
 * Renders a component inside the `MantineProvider` and the `KitProvider`, as in an app.
 * @param ui component to render
 * @param options simulated router
 */
export function render(ui: React.ReactNode, options: RenderOptions = {}): RenderResult {
    const router = options.router ?? createTestRouter().router;
    return testingLibraryRender(<>{ui}</>, {
        wrapper: ({ children }: { children: React.ReactNode }) => (
            <MantineProvider theme={testTheme}>
                <KitProvider router={router} appName="Test App">
                    {children}
                </KitProvider>
            </MantineProvider>
        )
    });
}
