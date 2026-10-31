import { describe, expect, jest, test } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmEditButton from '@/src/component/atom/ConfirmEditButton/ConfirmEditButton';
import { KitProvider } from '@/src/provider/KitProvider';
import { render } from '@/test-utils';

describe('ConfirmEditButton', () => {
    test('calls onClick when enabled', async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();
        render(<ConfirmEditButton onClick={onClick} />);

        await user.click(screen.getByRole('button', { name: 'Confirm editing (Enter)' }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('does not call onClick when disabled', async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();
        render(<ConfirmEditButton onClick={onClick} disabled />);

        const button = screen.getByRole('button', { name: 'Confirm editing (Enter)' });
        expect(button).toBeDisabled();

        await user.click(button);

        expect(onClick).not.toHaveBeenCalled();
    });

    test('uses the label of the locale of the app', () => {
        render(
            <KitProvider locale="pt-BR">
                <ConfirmEditButton onClick={jest.fn()} />
            </KitProvider>
        );

        expect(screen.getByRole('button', { name: 'Confirmar edição (Enter)' })).toBeInTheDocument();
    });
});
