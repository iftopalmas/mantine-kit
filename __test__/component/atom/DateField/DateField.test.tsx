import { describe, expect, test } from '@jest/globals';
import { RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement, useState } from 'react';

import { DateField } from '@/src/component/atom/DateField/DateField';
import { KitLocale } from '@/src/i18n/KitLocale';
import { KitProvider } from '@/src/provider/KitProvider';
import { render } from '@/test-utils';

const LABEL = 'Start date';

/** Stores what `onChange` gives and passes it back as `value`, as an app or `form.getInputProps` does. */
function ControlledDateField({ initialValue }: { initialValue: string | null }): ReactElement {
    const [date, setDate] = useState(initialValue);

    return <DateField label={LABEL} value={date} onChange={setDate} />;
}

function renderInLocale(locale: KitLocale, value: Date | string | null): RenderResult {
    return render(
        <KitProvider locale={locale}>
            <DateField label={LABEL} value={value} />
        </KitProvider>
    );
}

describe('DateField', () => {
    test('shows the date chosen when controlled with the value from onChange', async () => {
        const user = userEvent.setup();
        render(<ControlledDateField initialValue="2026-10-05" />);
        const input = screen.getByRole('textbox', { name: LABEL });
        expect(input).toHaveValue('10/05/2026');

        await user.click(input);
        await user.click(await screen.findByRole('button', { name: '20 October 2026' }));

        expect(input).toHaveValue('10/20/2026');
    });

    test.each<[KitLocale, string | Date, string]>([
        ['en-US', '2026-10-05', '10/05/2026'],
        ['pt-BR', '2026-10-05', '05/10/2026'],
        ['en-US', '10/05/2026', '10/05/2026'],
        ['pt-BR', '05/10/2026', '05/10/2026'],
        ['pt-BR', new Date(2026, 9, 5), '05/10/2026']
    ])('in %s, shows the value %s as %s', (locale, value, shown) => {
        renderInLocale(locale, value);

        expect(screen.getByRole('textbox', { name: LABEL })).toHaveValue(shown);
    });

    test('is empty without a value', () => {
        renderInLocale('en-US', null);

        expect(screen.getByRole('textbox', { name: LABEL })).toHaveValue('');
    });
});
