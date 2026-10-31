import type { Decorator, Preview } from '@storybook/react-vite';

import { MantineProvider, useMantineColorScheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { ReactElement, ReactNode, useEffect } from 'react';

import { KitLocale } from '../src/i18n/KitLocale';
import { KitProvider } from '../src/provider/KitProvider';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.css';
import '../src/styles/print.css';

/** Applies the color scheme chosen in the toolbar to the Mantine provider. */
function ColorScheme({ scheme, children }: { scheme: 'light' | 'dark'; children: ReactNode }): ReactElement {
    const { setColorScheme } = useMantineColorScheme();
    useEffect(() => setColorScheme(scheme), [scheme, setColorScheme]);

    return <>{children}</>;
}

/**
 * Wraps every story in the providers an app would have: Mantine (with modals and notifications) and the `KitProvider`,
 * with the locale chosen in the toolbar. Links use the default router (plain `<a>`).
 */
const withProviders: Decorator = (Story, context) => (
    <MantineProvider>
        <ColorScheme scheme={context.globals.colorScheme}>
            <ModalsProvider>
                <Notifications />
                <KitProvider appName="Storybook" locale={context.globals.locale as KitLocale}>
                    <Story />
                </KitProvider>
            </ModalsProvider>
        </ColorScheme>
    </MantineProvider>
);

const preview: Preview = {
    decorators: [withProviders],
    tags: ['autodocs'],
    globalTypes: {
        locale: {
            description: 'Locale of the texts',
            toolbar: { title: 'Locale', icon: 'globe', items: ['en-US', 'pt-BR'], dynamicTitle: true }
        },
        colorScheme: {
            description: 'Mantine color scheme',
            toolbar: { title: 'Theme', icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true }
        }
    },
    initialGlobals: { locale: 'en-US', colorScheme: 'light' },
    parameters: {
        controls: { expanded: true },
        // Links of the stories use the default router, which would leave the Storybook page.
        options: { storySort: { order: ['Introduction', 'Atoms', 'Molecules', 'Organisms', 'Templates'] } }
    }
};

export default preview;
