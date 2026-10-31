import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SelectField } from '@/src/component/molecule/SelectField/SelectField';
import { KitProvider } from '@/src/provider/KitProvider';
import { render } from '@/test-utils';

type City = { id?: number; name: string };
const CITIES: City[] = [
    { id: 1, name: 'Palmas' },
    { id: 2, name: 'Araguaína' }
];

/**
 * Renders the field with the test cities.
 * @param searchable value of the `searchable` prop; absent to use the default of the component
 */
function renderCities(searchable?: boolean): void {
    render(
        <SelectField
            label="City"
            data={CITIES}
            getId={city => city.id}
            getDescription={city => city.name}
            searchable={searchable}
        />
    );
}

beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
});

describe('SelectField', () => {
    test('builds the placeholder from the label when none is given', () => {
        renderCities();
        expect(screen.getByPlaceholderText('Select the City')).toBeInTheDocument();
    });

    test('builds the placeholder in the locale of the app', () => {
        render(
            <KitProvider locale="pt-BR">
                <SelectField label="City" data={CITIES} getId={city => city.id} getDescription={city => city.name} />
            </KitProvider>
        );
        expect(screen.getByPlaceholderText('Selecione o(a) City')).toBeInTheDocument();
    });

    // Most fields have long lists, so searching is the default.
    test('allows typing to filter the options by default', async () => {
        const user = userEvent.setup();
        renderCities();

        await user.type(screen.getByRole('combobox', { name: 'City' }), 'Pal');

        expect(screen.getByRole('option', { name: 'Palmas' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'Araguaína' })).not.toBeInTheDocument();
    });

    test('does not allow typing when searchable is false', () => {
        renderCities(false);
        expect(screen.getByRole('combobox', { name: 'City' })).toHaveAttribute('readonly');
    });

    // Mantine 9 accepts primitive values, so the id arrives with its real type, without converting it to string.
    test('gives the chosen id with its type (number)', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(
            <SelectField
                label="City"
                data={CITIES}
                getId={city => city.id}
                getDescription={city => city.name}
                onChange={onChange}
            />
        );

        await user.click(screen.getByRole('combobox', { name: 'City' }));
        await user.click(screen.getByRole('option', { name: 'Araguaína' }));

        expect(onChange).toHaveBeenCalledWith(2, expect.anything());
    });

    test('does not show items without an id', async () => {
        const user = userEvent.setup();
        render(
            <SelectField
                label="City"
                data={[...CITIES, { name: 'Gurupi' }]}
                getId={city => city.id}
                getDescription={city => city.name}
            />
        );

        await user.click(screen.getByRole('combobox', { name: 'City' }));

        expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Palmas', 'Araguaína']);
    });
});
