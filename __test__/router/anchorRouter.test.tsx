import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { anchorRouter } from '@/src/router/anchorRouter';

describe('anchorRouter', () => {
    test('the link is a plain <a>, with the destination in href', () => {
        const { Link } = anchorRouter;
        render(<Link href="/region">Regions</Link>);

        expect(screen.getByRole('link', { name: 'Regions' })).toHaveAttribute('href', '/region');
    });

    test('the current path comes from window.location', () => {
        window.history.pushState({}, '', '/district');

        expect(anchorRouter.usePathname()).toBe('/district');
    });
});
